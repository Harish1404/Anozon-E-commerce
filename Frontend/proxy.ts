import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"


export function proxy (request: NextRequest) {
    const path = request.nextUrl.pathname
    const token = request.cookies.get("refresh_token")?.value

  // Public routes — no token needed
  const publicRoutes = ["/auth/login", "/auth/signup", "/auth/forgot-password"]
  if (publicRoutes.includes(path)) return NextResponse.next()

  // No token → redirect to login
  if (!token) return NextResponse.redirect(new URL("/auth/login", request.url))

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


