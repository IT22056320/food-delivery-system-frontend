import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST() {
    try {
        // Forward the request to your backend API
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {
            method: "POST",
        })

        // Clear the token cookie regardless of the response
        cookies().delete("token")

        if (!response.ok) {
            const data = await response.json()
            return NextResponse.json({ error: data.error || "Logout failed" }, { status: response.status })
        }

        const data = await response.json()
        return NextResponse.json(data)
    } catch (error) {
        // Clear the token cookie even if there's an error
        cookies().delete("token")

        return NextResponse.json({ message: "Logged out successfully" }, { status: 200 })
    }
}

