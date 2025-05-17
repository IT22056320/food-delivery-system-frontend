"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Pizza, Coffee, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push(
        user.role === "admin"
          ? "/dashboard/admin"
          : user.role === "restaurant_owner"
          ? "/dashboard/restaurant"
          : user.role === "delivery_person"
          ? "/dashboard/delivery"
          : "/dashboard/user"
      );
    }
  }, [user, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await loginUser(form);
      login(data.user);
      toast.success("Login successful! Getting your menu ready...");
      // inside handleSubmit
      router.push(
        data.user.role === "admin"
          ? "/dashboard/admin"
          : data.user.role === "restaurant_owner"
          ? "/dashboard/restaurant"
          : data.user.role === "delivery_person"
          ? "/dashboard/delivery"
          : "/dashboard/user"
      );
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100 p-4">
      <div className="absolute top-0 left-0 w-full h-64 bg-orange-500 rounded-b-[30%] -z-10 opacity-90" />

      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="bg-white p-3 rounded-full shadow-md">
            <Pizza className="h-10 w-10 text-orange-500" />
          </div>
        </div>

        <Card className="border-none shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Welcome back
            </CardTitle>
            <CardDescription className="text-center">
              Sign in to order your favorite meals
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    type="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    required
                    className="pl-10 py-6 bg-gray-50 border-gray-100"
                  />
                  <Coffee className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-orange-400" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <Input
                    type="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    required
                    className="pl-10 py-6 bg-gray-50 border-gray-100"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-orange-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-lock"
                    >
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full py-6 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center text-gray-500">
              Don&apos;t have an account?{" "}
              <a
                href="/register"
                className="text-orange-500 hover:text-orange-600 font-medium"
              >
                Register now
              </a>
            </div>

            <div className="flex items-center justify-center gap-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-amber-600"
                >
                  <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"></path>
                  <line x1="6" x2="18" y1="17" y2="17"></line>
                </svg>
              </div>
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-red-600"
                >
                  <path d="M15 11h.01"></path>
                  <path d="M11 15h.01"></path>
                  <path d="M16 16h.01"></path>
                  <path d="m2 16 20 6-6-20A20 20 0 0 0 2 16"></path>
                  <path d="M5.71 17.11a17.04 17.04 0 0 1 11.4-11.4"></path>
                </svg>
              </div>
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-green-600"
                >
                  <path d="M15.5 2H8.6c-.4 0-.8.2-1.1.5-.3.3-.5.7-.5 1.1v12.8c0 .4.2.8.5 1.1.3.3.7.5 1.1.5h9.8c.4 0 .8-.2 1.1-.5.3-.3.5-.7.5-1.1V6.5L15.5 2z"></path>
                  <path d="M3 7.6v12.8c0 .4.2.8.5 1.1.3.3.7.5 1.1.5h9.8"></path>
                  <path d="M15 2v5h5"></path>
                </svg>
              </div>
            </div>
          </CardFooter>
          <div className="text-sm text-center text-gray-500">
            <a
              href="/forgot-password"
              className="text-orange-500 hover:text-orange-600 font-medium"
            >
              Forgot your password?
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
}
