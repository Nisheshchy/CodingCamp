import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        textAlign: "center",
        padding: "2rem",
        background: "#0f1117",
        color: "#e2e8f0",
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
      }}
    >
      <h1
        style={{
          fontSize: "6rem",
          fontWeight: 800,
          color: "#ec3944",
          margin: 0,
          lineHeight: 1,
        }}
      >
        404
      </h1>
      <h2 style={{ fontSize: "1.5rem", fontWeight: 600, margin: "1rem 0 0.5rem", color: "#fff" }}>
        Page Not Found
      </h2>
      <p style={{ color: "#64748b", marginBottom: "2rem", maxWidth: 400 }}>
        The page you&apos;re looking for doesn&apos;t exist. It might have been moved, archived, or never existed.
      </p>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
        <Link href="/">
          <a
            style={{
              background: "#ec3944",
              color: "#fff",
              padding: "0.65rem 1.5rem",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: 600,
              fontSize: "0.9rem",
            }}
          >
            Go Home
          </a>
        </Link>
        <Link href="/courses">
          <a
            style={{
              background: "#1e2535",
              color: "#e2e8f0",
              padding: "0.65rem 1.5rem",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: 600,
              fontSize: "0.9rem",
              border: "1px solid #2d3748",
            }}
          >
            Browse Courses
          </a>
        </Link>
      </div>
    </div>
  );
}
