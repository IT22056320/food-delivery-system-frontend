"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container flex items-center justify-between py-4">
          <h1 className="text-2xl font-bold">Auth System</h1>
          <nav>
            <ClientNav />
          </nav>
        </div>
      </header>
      <main className="flex-1 container py-12">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h2 className="text-4xl font-bold tracking-tight">Secure Authentication System</h2>
          <p className="text-xl text-muted-foreground">
            A complete authentication solution with email verification, social login, and role-based access control.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/auth/register">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </main>
      <footer className="border-t py-6">
        <div className="container text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Auth System. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
;

function ClientNav() {
  const { user, logout } = useAuth()

  if (!user) {
    return (
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost">
          <Link href="/auth/login">Login</Link>
        </Button>
        <Button asChild>
          <Link href="/auth/register">Register</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-4">
      <Button asChild variant="ghost">
        <Link href="/dashboard">Dashboard</Link>
      </Button>
      {user.isAdmin && (
        <Button asChild variant="ghost">
          <Link href="/admin">Admin</Link>
        </Button>
      )}
      <Button variant="outline" onClick={logout}>
        Logout
      </Button>
    </div>
  )
}

