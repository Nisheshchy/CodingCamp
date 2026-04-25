import { NextResponse } from "next/server";

export default function middleware(req) {
  const path = req.nextUrl.pathname;

  // Protect /admin routes
  if (path.startsWith("/admin")) {
    // Allow unrestricted access to the login page
    if (path === "/admin/login") {
      return NextResponse.next();
    }

    // Check for the custom secure cookie
    const adminTokenCookie = req.cookies.get("admin_token");
    const adminToken = adminTokenCookie?.value ?? adminTokenCookie;
    
    if (!adminToken || adminToken !== process.env.ADMIN_SECRET) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
