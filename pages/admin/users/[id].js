import { ArrowLeft, CheckCircle, Clock, Award } from "react-feather";
import Link from "next/link";
import AdminLayout from "../../../components/admin/AdminLayout";

/**
 * User progress detail page.
 * Loaded server-side to show a single user's full course and quiz history.
 */
export default function UserProgressPage({ userData, error }) {
  if (error) {
    return (
      <AdminLayout>
        <div className="admin-error">{error}</div>
        <Link href="/admin/users"><a className="btn-admin-secondary" style={{ marginTop: "1rem" }}><ArrowLeft size={14} /> Back to Users</a></Link>
      </AdminLayout>
    );
  }

  const completedCourses = userData.courses.filter((c) => c.completed);
  const inProgressCourses = userData.courses.filter((c) => !c.completed);

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <Link href="/admin/users">
          <a className="btn-admin-secondary" style={{ marginBottom: "1rem", display: "inline-flex" }}>
            <ArrowLeft size={14} /> Back to Users
          </a>
        </Link>
        <h1>User Progress</h1>
        <p style={{ fontFamily: "monospace", fontSize: "0.8rem", color: "#64748b" }}>
          {userData.user}
        </p>
      </div>

      {/* Summary row */}
      <div className="admin-stats-grid" style={{ marginBottom: "2rem" }}>
        <div className="admin-stat-card">
          <div className="admin-stat-card__label">Role</div>
          <div style={{ marginTop: "0.25rem" }}>
            <span className={`badge badge--${userData.role}`}>{userData.role}</span>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-card__label">Courses Started</div>
          <div className="admin-stat-card__value">{userData.courses.length}</div>
        </div>
        <div className="admin-stat-card admin-stat-card--accent">
          <div className="admin-stat-card__label">Courses Completed</div>
          <div className="admin-stat-card__value">{completedCourses.length}</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-card__label">Quizzes Taken</div>
          <div className="admin-stat-card__value">{userData.quizScores?.length ?? 0}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        {/* Completed courses */}
        <div className="admin-table-wrapper">
          <div className="admin-table-toolbar">
            <span style={{ fontWeight: 600, fontSize: "0.875rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <CheckCircle size={15} style={{ color: "#4ade80" }} /> Completed Courses
            </span>
          </div>
          {completedCourses.length === 0 ? (
            <div className="admin-empty"><p>No courses completed yet.</p></div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr><th>Course Slug</th><th>Quiz Score</th></tr>
              </thead>
              <tbody>
                {completedCourses.map((c, i) => {
                  const quizRecord = userData.quizScores?.find((q) => q.course === c.course);
                  return (
                    <tr key={i}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <img src={`/images/${c.course}.svg`} alt="" width={22} height={22} />
                          <span style={{ fontWeight: 500, color: "#f1f5f9" }}>{c.course}</span>
                        </div>
                      </td>
                      <td>
                        {quizRecord
                          ? <span style={{ color: quizRecord.score / quizRecord.total >= 0.7 ? "#4ade80" : "#f87171" }}>
                              {quizRecord.score}/{quizRecord.total}
                            </span>
                          : <span style={{ color: "#475569" }}>—</span>
                        }
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* In-progress courses */}
        <div className="admin-table-wrapper">
          <div className="admin-table-toolbar">
            <span style={{ fontWeight: 600, fontSize: "0.875rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <Clock size={15} style={{ color: "#facc15" }} /> In Progress
            </span>
          </div>
          {inProgressCourses.length === 0 ? (
            <div className="admin-empty"><p>No courses in progress.</p></div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr><th>Course Slug</th></tr>
              </thead>
              <tbody>
                {inProgressCourses.map((c, i) => (
                  <tr key={i}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <img src={`/images/${c.course}.svg`} alt="" width={22} height={22} />
                        <span style={{ color: "#94a3b8" }}>{c.course}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Full quiz history */}
      {userData.quizScores?.length > 0 && (
        <div className="admin-table-wrapper" style={{ marginTop: "1.5rem" }}>
          <div className="admin-table-toolbar">
            <span style={{ fontWeight: 600, fontSize: "0.875rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <Award size={15} style={{ color: "#ec3944" }} /> Full Quiz History
            </span>
          </div>
          <table className="admin-table">
            <thead>
              <tr><th>Course</th><th>Score</th><th>Percentage</th><th>Submitted</th></tr>
            </thead>
            <tbody>
              {userData.quizScores.map((q, i) => {
                const pct = Math.round((q.score / q.total) * 100);
                return (
                  <tr key={i}>
                    <td style={{ fontWeight: 500 }}>{q.course}</td>
                    <td>{q.score}/{q.total}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <span style={{ color: pct >= 70 ? "#4ade80" : "#f87171", fontWeight: 600 }}>{pct}%</span>
                        <div className="admin-progress-bar" style={{ width: 80 }}>
                          <div className="admin-progress-bar__fill" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </td>
                    <td style={{ color: "#64748b", fontSize: "0.8rem" }}>
                      {q.submittedAt ? new Date(q.submittedAt).toLocaleString() : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}

export async function getServerSideProps(context) {
  const { connect } = await import("../../../utils/db");
  const User = (await import("../../../models/User")).default;
  await connect();

  const { id } = context.params;
  try {
    const user = await User.findOne({ user: id });
    if (!user) return { notFound: true };
    return { props: { userData: JSON.parse(JSON.stringify(user)), error: null } };
  } catch {
    return { props: { userData: null, error: "Failed to load user data." } };
  }
}
