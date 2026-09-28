import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    if (path === "/login" && token) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    if (path.startsWith("/dashboard") && !token) {
      return NextResponse.redirect(new URL("/login", req.url))
    }

    // Role-based Access Control (RBAC)
    const role = token?.role as string

    // Admin only routes
    if (path.startsWith("/dashboard/master") || path.startsWith("/dashboard/users") || path.startsWith("/dashboard/settings")) {
      if (role !== "ADMIN") return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    // restricted for PENGGUNA_BMN and PENANGGUNG_JAWAB_RUANGAN (Employee)
    if (path.startsWith("/dashboard/assets") || path.startsWith("/dashboard/vehicles") || path.startsWith("/dashboard/analytics") || path.startsWith("/dashboard/rkbmn")) {
      if (role === "PENGGUNA_BMN" || role === "PENANGGUNG_JAWAB_RUANGAN") {
        // Pengecualian: Boleh akses /dashboard/assets/[id] (Detail) untuk melihat info setelah scan QR
        // karena format URL detail adalah /dashboard/assets/xxxx
        const isAssetDetail = /^\/dashboard\/assets\/[a-zA-Z0-9_-]+$/.test(path);
        // Dan tidak boleh akses /edit atau /create
        const isEditOrCreate = path.includes("/edit") || path.includes("/create");

        if (!isAssetDetail || isEditOrCreate) {
          return NextResponse.redirect(new URL("/dashboard", req.url))
        }
      }
    }

    // Maintenance restricted
    if (path.startsWith("/dashboard/maintenances")) {
      if (role !== "ADMIN" && role !== "PENGELOLA_BMN") {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    }
  }
)

export const config = {
  matcher: ["/dashboard/:path*", "/bmn/:path*", "/api/dashboard", "/api/assets"]
}
