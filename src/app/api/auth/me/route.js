import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET() {
    try {
        const cookieStore = await cookies().getAll()
        const tokenCookie = cookieStore.find(cookie => cookie.name === "token")
        const token = tokenCookie?.value

        if (!token) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
        }

        // Forward the request to your backend API
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
            headers: {
                Cookie: `token=${token}`,
            },
        })

        if (!response.ok) {
            return NextResponse.json({ error: "Authentication failed" }, { status: response.status })
        }

        const data = await response.json()
        return NextResponse.json(data)
    } catch (error) {
        console.error("Authentication Error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}