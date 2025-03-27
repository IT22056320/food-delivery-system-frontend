import { NextResponse } from "next/server"

export async function POST(request) {
    try {
        const body = await request.json()

        console.log("Registration Request Body:", body)
        console.log("Backend API URL:", process.env.NEXT_PUBLIC_API_URL)

        // Validate backend API URL
        if (!process.env.NEXT_PUBLIC_API_URL) {
            return NextResponse.json({
                error: "Backend API URL is not configured"
            }, { status: 500 })
        }

        // Update the URL to match your actual backend server
        const backendUrl = `http://localhost:5000/api/auth/register`

        console.log("Attempting to fetch from:", backendUrl)

        // Forward the request to your backend API
        const response = await fetch(backendUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        })

        const data = await response.json()

        console.log("Backend Response:", {
            status: response.status,
            data: data
        })

        if (!response.ok) {
            return NextResponse.json({
                error: data.error || "Registration failed",
                details: data
            }, { status: response.status })
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error("Full Registration Error:", error)
        return NextResponse.json({
            error: "Internal server error",
            details: error instanceof Error ? error.message : String(error),
            fullError: error
        }, { status: 500 })
    }
}