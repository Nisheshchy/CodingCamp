import { useState, useEffect } from "react";
import { Award, TrendingUp, RefreshCw } from "react-feather";
import AdminLayout from "../../components/admin/AdminLayout";

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/analytics");
      const json = await res.json();
      if (!res.ok) throw new Error(json.msg);
      setData(json);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message || "Failed to load analytics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAnalytics(); }, []);

  const getRateColor = (rate) => {
    if (rate >= 70) return "#4ade80";
    if (rate >= 40) return "#facc15";
    return "#f87171";
  };

  return (
    <AdminLayout>
      <div className="admin-page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1>Analytics</h1>
          <p>
            Per-course completion rates and quiz performance.
            {lastUpdated && (
              <span style={{ marginLeft: "0.5rem", color: "#475569", fontSize: "0.75rem" }}>
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <button className="btn-admin-secondary" onClick={fetchAnalytics} disabled={loading} aria-label="Refresh analytics">
          <RefreshCw size={14} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
          Refresh
        </button>
      </div>

      {error && <div className="admin-error">{error}</div>}

      {!loading && data && (
        <>
          {/* Certificates issued */}
          <div className="admin-stats-grid" style={{ marginBottom: "2rem" }}>
            <div className="admin-stat-card admin-stat-card--accent">
              <div className="admin-stat-card__label">Certificates Issued</div>
              <div className="admin-stat-card__value">{data.certificatesIssued}</div>
              <div className="admin-stat-card__sub">users completed all {data.publishedCourses} courses</div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-card__label">Avg Completion Rate</div>
              <div className="admin-stat-card__value">
                {data.analytics.length > 0
                  ? Math.round(data.analytics.reduce((a, c) => a + c.completionRate, 0) / data.analytics.length)
                  : 0}%
              </div>
              <div className="admin-stat-card__sub">across all published courses</div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-card__label">Avg Quiz Score</div>
              <div className="admin-stat-card__value">
                {(() => {
                  const withScores = data.analytics.filter((c) => c.avgQuizScore !== null);
                  if (!withScores.length) return "—";
                  return (
                    Math.round(
                      (withScores.reduce((a, c) => a + c.avgQuizScore, 0) / withScores.length) * 10
                    ) /
                    10
                  ).toFixed(1) + "%";
                })()}
              </div>
              <div className="admin-stat-card__sub">platform-wide average</div>
            </div>
          </div>

          {/* Per-course breakdown */}
          <div className="admin-table-wrapper">
            <div className="admin-table-toolbar">
              <span style={{ fontWeight: 600, fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <TrendingUp size={16} /> Course Performance
              </span>
            </div>
            {data.analytics.length === 0 ? (
              <div className="admin-empty">
                <h3>No data yet</h3>
                <p>Analytics will appear once learners start courses.</p>
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Course</th>
                    <th>Starts</th>
                    <th>Completions</th>
                    <th>Completion Rate</th>
                    <th>Avg Quiz Score</th>
                    <th>Quiz Submissions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.analytics
                    .sort((a, b) => b.starts - a.starts)
                    .map((course) => (
                      <tr key={course.slug}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                            <img src={`/images/${course.slug}.svg`} alt="" width={22} height={22} />
                            <span style={{ fontWeight: 500, color: "#f1f5f9" }}>{course.name}</span>
                          </div>
                        </td>
                        <td>{course.starts}</td>
                        <td>{course.completions}</td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                            <span style={{ color: getRateColor(course.completionRate), fontWeight: 600, minWidth: 36 }}>
                              {course.completionRate}%
                            </span>
                            <div className="admin-progress-bar" style={{ width: 80 }}>
                              <div
                                className="admin-progress-bar__fill"
                                style={{
                                  width: `${course.completionRate}%`,
                                  background: `linear-gradient(90deg, ${getRateColor(course.completionRate)}, ${getRateColor(course.completionRate)}99)`,
                                }}
                              />
                            </div>
                          </div>
                        </td>
                        <td>
                          {course.avgQuizScore !== null ? (
                            <span style={{ color: getRateColor(course.avgQuizScore), fontWeight: 600 }}>
                              {course.avgQuizScore.toFixed(1)}%
                            </span>
                          ) : (
                            <span style={{ color: "#475569" }}>—</span>
                          )}
                        </td>
                        <td style={{ color: "#64748b" }}>{course.quizSubmissions}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {loading && <div className="admin-loading">Loading analytics…</div>}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </AdminLayout>
  );
}
