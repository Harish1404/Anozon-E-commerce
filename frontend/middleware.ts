import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"


export function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname
    const token = request.cookies.get("refresh_token")?.value

  // Determine portal from route — this runs for ALL requests
  let portal = 'user'
  if (path.startsWith('/seller')) portal = 'seller'
  if (path.startsWith('/admin'))  portal = 'admin'

  // Helper to create a response with the portal header attached to the REQUEST
  function nextWithPortal() {
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-anozon-portal', portal)
    return NextResponse.next({ request: { headers: requestHeaders } })
  }

  function redirectTo(url: string) {
    return NextResponse.redirect(new URL(url, request.url))
  }

  // Public routes that don't need a token
  const authRoutes = ["/auth/login", "/auth/signup", "/auth/forgot-password", "/auth/verify-otp", "/auth/reset-password"]
  const publicPrefixes = ["/products"]
  const isPublicRoute = path === "/" || publicPrefixes.some(prefix => path.startsWith(prefix))

  // If user is on an auth route but HAS a token, redirect to home
  if (authRoutes.includes(path) && token) {
    return redirectTo("/")
  }

  // If user is on an auth route and NO token, allow access
  if (authRoutes.includes(path)) {
    return nextWithPortal()
  }

  // If user is on a public route (Home, Products) and NO token, allow access
  if (isPublicRoute && !token) {
    return nextWithPortal()
  }

  // For any other route (Cart, Orders, Profile, etc), require a token
  if (!token) {
    return redirectTo("/auth/login")
  }

  // Role based — decode token and check role
  const payload = decodeJwtPayload(token);
  const userRole = payload?.role ;

  // Seller routes
  if (path.startsWith("/seller") && userRole !== "seller") {
    return redirectTo("/")
  }

  // Admin routes
  if (path.startsWith("/admin")) {
    if (!["admin", "super_admin"].includes(userRole ?? "")) {
      return redirectTo("/")
    }

    // Super Admin specific routes
    const isSuperAdminRoute = path.startsWith("/admin/admins")
    if (isSuperAdminRoute && userRole !== "super_admin") {
      return redirectTo("/admin/dashboard")
    }
  }

  return nextWithPortal()
}

function decodeJwtPayload(token: string) {
  try {
    const base64Payload = token.split(".")[1]
    const decoded = atob(base64Payload)
    return JSON.parse(decoded) as { role?: string }
  } catch {
    return null
  }
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
