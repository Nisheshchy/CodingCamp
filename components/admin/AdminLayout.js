import Link from "next/link";
import { useRouter } from "next/router";
import { BarChart2, BookOpen, Users, Home, ArrowLeft, LogOut } from "react-feather";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: <Home size={18} /> },
  { href: "/admin/courses", label: "Courses", icon: <BookOpen size={18} /> },
  { href: "/admin/users", label: "Users", icon: <Users size={18} /> },
  { href: "/admin/analytics", label: "Analytics", icon: <BarChart2 size={18} /> },
];

/**
 * Shared admin panel layout with fixed sidebar navigation.
 * All /admin/* pages are wrapped in this layout.
 */
export default function AdminLayout({ children }) {
  const router = useRouter();

  const handleLogout = async (e) => {
    e.preventDefault();
    await fetch("/api/admin/logout");
    router.push("/admin/login");
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand">
          <h2>The Coding Camp</h2>
          <span>Admin Panel</span>
        </div>

        <nav className="admin-sidebar__nav">
          {navItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? router.pathname === "/admin"
                : router.pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href}>
                <a className={`admin-nav-link ${isActive ? "active" : ""}`}>
                  {item.icon}
                  <span>{item.label}</span>
                </a>
              </Link>
            );
          })}
        </nav>

        <div className="admin-sidebar__footer" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Link href="/courses">
            <a>
              <ArrowLeft size={14} />
              <span>Back to site</span>
            </a>
          </Link>
          <a href="#" onClick={handleLogout} style={{ color: '#ec3944' }}>
            <LogOut size={14} />
            <span>Sign Out Admin</span>
          </a>
        </div>
      </aside>

      <main className="admin-main">{children}</main>
    </div>
  );
}
