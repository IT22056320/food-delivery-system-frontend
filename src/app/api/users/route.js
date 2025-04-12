import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET() {
    const token = cookies().get("token")?.value

    if (!token) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    try {
        // Forward the request to your backend API
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`, {
            headers: {
                Cookie: `token=${token}`,
            },
        })

        if (!response.ok) {
            return NextResponse.json({ error: "Failed to fetch users" }, { status: response.status })
        }

        const data = await response.json()
        return NextResponse.json(data)
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

