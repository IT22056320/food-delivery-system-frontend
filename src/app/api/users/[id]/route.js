import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET(request, { params }) {
    const token = cookies().get("token")?.value

    if (!token) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    try {
        // Forward the request to your backend API
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${params.id}`, {
            headers: {
                Cookie: `token=${token}`,
            },
        })

        if (!response.ok) {
            return NextResponse.json({ error: "Failed to fetch user" }, { status: response.status })
        }

        const data = await response.json()
        return NextResponse.json(data)
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

export async function PUT(request, { params }) {
    const token = cookies().get("token")?.value

    if (!token) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    try {
        const body = await request.json()

        // Forward the request to your backend API
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${params.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Cookie: `token=${token}`,
            },
            body: JSON.stringify(body),
        })

        if (!response.ok) {
            return NextResponse.json({ error: "Failed to update user" }, { status: response.status })
        }

        const data = await response.json()
        return NextResponse.json(data)
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

export async function DELETE(request, { params }) {
    const token = cookies().get("token")?.value

    if (!token) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    try {
        // Forward the request to your backend API
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${params.id}`, {
            method: "DELETE",
            headers: {
                Cookie: `token=${token}`,
            },
        })

        if (!response.ok) {
            return NextResponse.json({ error: "Failed to delete user" }, { status: response.status })
        }

        const data = await response.json()
        return NextResponse.json(data)
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

