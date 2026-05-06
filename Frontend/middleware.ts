import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"


export function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname
    const token = request.cookies.get("refresh_token")?.value

  // Public routes that don't need a token
  const authRoutes = ["/auth/login", "/auth/signup", "/auth/forgot-password", "/auth/verify-otp", "/auth/reset-password"]
  const publicPrefixes = ["/products"]
  const isPublicRoute = path === "/" || publicPrefixes.some(prefix => path.startsWith(prefix))

  // If user is on an auth route but HAS a token, redirect to home
  if (authRoutes.includes(path) && token) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  // If user is on an auth route and NO token, allow access
  if (authRoutes.includes(path)) {
    return NextResponse.next()
  }

  // If user is on a public route (Home, Products) and NO token, allow access
  if (isPublicRoute && !token) {
    return NextResponse.next()
  }

  // For any other route (Cart, Orders, Profile, etc), require a token
  if (!token) {
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  // Role based — decode token and check role
  const payload = decodeJwtPayload(token);
  const userRole = payload?.role ;

  // Seller routes
  if (path.startsWith("/seller") && userRole !== "seller") {
    return NextResponse.redirect(new URL("/", request.url))
  }

  // Admin routes
  if (path.startsWith("/admin") && !["admin", "super_admin"].includes(userRole ?? "")) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
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
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}


