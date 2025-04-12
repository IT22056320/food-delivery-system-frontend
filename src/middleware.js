import { NextResponse } from "next/server"

// This function can be marked `async` if using `await` inside
export function middleware(request) {
    const path = request.nextUrl.pathname

    // Define public paths that don't require authentication
    const isPublicPath = path === "/" || path.startsWith("/auth") || path.startsWith("/api/auth")

    // Get the token from the cookies
    const token = request.cookies.get("token")?.value || ""

    // Redirect authenticated users away from auth pages
    if (isPublicPath && token) {
        // If user is already logged in and tries to access login/register page
        // redirect them to dashboard
        if (path.startsWith("/auth")) {
            return NextResponse.redirect(new URL("/dashboard", request.url))
        }
    }

    // Redirect unauthenticated users away from protected pages
    if (!isPublicPath && !token) {
        // If user is not logged in and tries to access protected page
        // redirect them to login page
        return NextResponse.redirect(new URL("/auth/login", request.url))
    }
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        "/((?!_next/static|_next/image|favicon.ico).*)",
    ],
}

