import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Users, Award, TrendingUp, Plus } from "react-feather";
import AdminLayout from "../../components/admin/AdminLayout";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((data) => { setStats(data); setLoading(false); })
      .catch(() => { setError("Failed to load stats."); setLoading(false); });
  }, []);

  const statCards = stats
    ? [
        { label: "Published Courses", value: stats.publishedCourses, icon: <BookOpen size={20} />, sub: `${stats.totalCourses} total (inc. drafts)` },
        { label: "Registered Learners", value: stats.totalUsers, icon: <Users size={20} />, sub: `${stats.activeLearners} active` },
        { label: "Course Completions", value: stats.totalCompletions, icon: <TrendingUp size={20} />, sub: "across all users" },
        { label: "Certificates Issued", value: stats.certificatesIssued, icon: <Award size={20} />, accent: true, sub: "all courses completed" },
      ]
    : [];

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <h1>Dashboard</h1>
        <p>Welcome back. Here&apos;s what&apos;s happening on The Coding Camp.</p>
      </div>

      {error && <div className="admin-error">{error}</div>}

      {loading ? (
        <div className="admin-loading">Loading stats…</div>
      ) : (
        <>
          <div className="admin-stats-grid">
            {statCards.map((card) => (
              <div key={card.label} className={`admin-stat-card${card.accent ? " admin-stat-card--accent" : ""}`}>
                <div className="admin-stat-card__label">{card.label}</div>
                <div className="admin-stat-card__value">{card.value ?? "—"}</div>
                <div className="admin-stat-card__sub">{card.sub}</div>
              </div>
            ))}
          </div>

          {/* Quick actions */}
          <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
            <Link href="/admin/courses/new">
              <a className="btn-admin-primary">
                <Plus size={16} /> New Course
              </a>
            </Link>
            <Link href="/admin/courses">
              <a className="btn-admin-secondary">
                <BookOpen size={16} /> Manage Courses
              </a>
            </Link>
            <Link href="/admin/users">
              <a className="btn-admin-secondary">
                <Users size={16} /> Manage Users
              </a>
            </Link>
          </div>

          {/* Recent completions */}
          {stats?.recentCompletions?.length > 0 && (
            <div className="admin-table-wrapper">
              <div className="admin-table-toolbar">
                <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>Recent Completions</span>
              </div>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Courses Completed</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentCompletions.map((u) => (
                    <tr key={u._id}>
                      <td style={{ fontFamily: "monospace", fontSize: "0.8rem" }}>{u.user}</td>
                      <td>{u.courses.filter((c) => c.completed).length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </AdminLayout>
  );
}
