import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(request) {
    try {
        const body = await request.json()

        console.log("Login Request Body:", body)
        console.log("Backend API URL:", process.env.NEXT_PUBLIC_API_URL)

        // Validate backend API URL
        if (!process.env.NEXT_PUBLIC_API_URL) {
            return NextResponse.json({
                error: "Backend API URL is not configured"
            }, { status: 500 })
        }

        // Use the full backend URL
        const backendUrl = `http://localhost:5000/api/auth/login`

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
                error: data.error || "Login failed",
                details: data
            }, { status: response.status })
        }

        // Set the token cookie (use an async method for cookies)
        const cookieStore = cookies()
        cookieStore.set({
            name: "token",
            value: data.token || "",
            httpOnly: true,
            path: "/",
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        })

        return NextResponse.json(data)
    } catch (error) {
        console.error("Full Login Error:", error)
        return NextResponse.json({
            error: "Internal server error",
            details: error instanceof Error ? error.message : String(error),
            fullError: error
        }, { status: 500 })
    }
}