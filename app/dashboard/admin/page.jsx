"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { getSystemStats } from "@/lib/restaurant-api";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Store,
  Users,
  ShoppingBag,
  TrendingUp,
  DollarSign,
  Clock,
  BarChart3,
  PieChart,
  CheckCircle,
  XCircle,
  AlertTriangle,
  LogOut,
} from "lucide-react";
import { logout } from "@/lib/auth";

export default function AdminDashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [timeFilter, setTimeFilter] = useState("today");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/");
      toast.error("You don't have permission to access this page");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const data = await getSystemStats();
        setStats(data);
      } catch (error) {
        toast.error("Failed to fetch system statistics");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user && !loading && user.role === "admin") {
      fetchStats();
    }
  }, [user, loading, timeFilter]);

  // If no stats are available yet, use placeholder data
  const placeholderStats = {
    restaurants: {
      total: 45,
      verified: 38,
      pending: 7,
      growth: 12,
    },
    orders: {
      total: 1250,
      completed: 1180,
      cancelled: 45,
      pending: 25,
      growth: 8,
    },
    users: {
      total: 2800,
      customers: 2650,
      restaurantOwners: 120,
      deliveryPersonnel: 30,
      growth: 15,
    },
    revenue: {
      total: 28500,
      growth: 10,
      averageOrderValue: 22.8,
    },
    popular: {
      cuisines: [
        { name: "Italian", count: 450 },
        { name: "Chinese", count: 380 },
        { name: "Indian", count: 320 },
        { name: "Mexican", count: 280 },
        { name: "Japanese", count: 220 },
      ],
      restaurants: [
        { name: "Pizza Palace", orders: 180 },
        { name: "Burger Barn", orders: 165 },
        { name: "Sushi Supreme", orders: 140 },
        { name: "Taco Town", orders: 125 },
        { name: "Pasta Paradise", orders: 110 },
      ],
    },
  };

  const displayStats = stats || placeholderStats;

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar */}
      <div className="w-56 bg-white shadow-md flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <Store className="h-8 w-8 text-blue-500" />
            <span className="font-bold text-xl">FoodHub</span>
          </div>
        </div>

        <div className="flex flex-col p-4 flex-1">
          <p className="text-gray-500 text-sm mb-4">Admin Dashboard</p>

          <nav className="space-y-1">
            <Button
              variant="default"
              className="w-full justify-start bg-blue-500 hover:bg-blue-600"
              onClick={() => router.push("/dashboard/admin")}
            >
              <BarChart3 className="mr-2 h-5 w-5" />
              Overview
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => router.push("/dashboard/admin/restaurants")}
            >
              <Store className="mr-2 h-5 w-5" />
              Restaurants
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => router.push("/dashboard/admin/users")}
            >
              <Users className="mr-2 h-5 w-5" />
              Users
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => router.push("/dashboard/admin/orders")}
            >
              <ShoppingBag className="mr-2 h-5 w-5" />
              Orders
            </Button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-gray-500">System overview and statistics</p>
            </div>
            <Button
              variant="outline"
              className="flex items-center gap-2 text-red-500 border-red-200 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>

          {/* Time Period Filter */}
          <div className="mb-6">
            <Tabs
              defaultValue="today"
              value={timeFilter}
              onValueChange={setTimeFilter}
            >
              <TabsList>
                <TabsTrigger value="today">Today</TabsTrigger>
                <TabsTrigger value="week">This Week</TabsTrigger>
                <TabsTrigger value="month">This Month</TabsTrigger>
                <TabsTrigger value="year">This Year</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="border-none shadow-md">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
                        <div className="h-6 w-16 bg-gray-300 rounded mt-1 mb-2"></div>
                        <div className="h-3 w-32 bg-gray-200 rounded mt-1"></div>
                      </div>
                      <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-gray-500 text-sm">Total Restaurants</p>
                      <h3 className="text-2xl font-bold mt-1">
                        {displayStats?.restaurants?.total || 0}
                      </h3>
                      <p className="text-green-500 text-xs mt-1 flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1" /> +
                        {displayStats?.restaurants?.growth || 0}% from last{" "}
                        {timeFilter}
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Store className="h-6 w-6 text-blue-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-gray-500 text-sm">Total Orders</p>
                      <h3 className="text-2xl font-bold mt-1">
                        {displayStats?.orders?.total || 0}
                      </h3>
                      <p className="text-green-500 text-xs mt-1 flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1" /> +
                        {displayStats?.orders?.growth || 0}% from last{" "}
                        {timeFilter}
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                      <ShoppingBag className="h-6 w-6 text-orange-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-gray-500 text-sm">Total Users</p>
                      <h3 className="text-2xl font-bold mt-1">
                        {displayStats?.users?.total || 0}
                      </h3>
                      <p className="text-green-500 text-xs mt-1 flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1" /> +
                        {displayStats?.users?.growth || 0}% from last{" "}
                        {timeFilter}
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-purple-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-gray-500 text-sm">Total Revenue</p>
                      <h3 className="text-2xl font-bold mt-1">
                        ${displayStats?.revenue?.total || 0}
                      </h3>
                      <p className="text-green-500 text-xs mt-1 flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1" /> +
                        {displayStats?.revenue?.growth || 0}% from last{" "}
                        {timeFilter}
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-green-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Restaurant Status */}
              <Card className="border-none shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle>Restaurant Status</CardTitle>
                  <CardDescription>
                    Overview of restaurant verification status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <p className="text-sm">Verified Restaurants</p>
                        <p className="text-sm font-medium">
                          {displayStats?.restaurants?.verified || 0} (
                          {Math.round(
                            ((displayStats?.restaurants?.verified || 0) /
                              (displayStats?.restaurants?.total || 1)) *
                              100
                          )}
                          %)
                        </p>
                      </div>
                      <Progress
                        value={Math.round(
                          ((displayStats?.restaurants?.verified || 0) /
                            (displayStats?.restaurants?.total || 1)) *
                            100
                        )}
                        className="h-2"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <p className="text-sm">Pending Verification</p>
                        <p className="text-sm font-medium">
                          {displayStats?.restaurants?.pending || 0} (
                          {Math.round(
                            ((displayStats?.restaurants?.pending || 0) /
                              (displayStats?.restaurants?.total || 1)) *
                              100
                          )}
                          %)
                        </p>
                      </div>
                      <Progress
                        value={Math.round(
                          ((displayStats?.restaurants?.pending || 0) /
                            (displayStats?.restaurants?.total || 1)) *
                            100
                        )}
                        className="h-2"
                      />
                    </div>

                    <div className="pt-4 grid grid-cols-2 gap-4">
                      <Button
                        variant="outline"
                        className="flex items-center justify-center gap-2"
                        onClick={() =>
                          router.push("/dashboard/admin/restaurants")
                        }
                      >
                        <Store className="h-4 w-4" />
                        View All Restaurants
                      </Button>
                      <Button
                        variant="outline"
                        className="flex items-center justify-center gap-2 text-yellow-600 border-yellow-600 hover:bg-yellow-50"
                        onClick={() =>
                          router.push(
                            "/dashboard/admin/restaurants?filter=pending"
                          )
                        }
                      >
                        <AlertTriangle className="h-4 w-4" />
                        View Pending Approvals
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Order Statistics */}
              <Card className="border-none shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle>Order Statistics</CardTitle>
                  <CardDescription>
                    Overview of order status and metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="font-medium">Completed</span>
                      </div>
                      <p className="text-2xl font-bold">
                        {displayStats?.orders?.completed || 0}
                      </p>
                      <p className="text-sm text-gray-500">
                        {Math.round(
                          ((displayStats?.orders?.completed || 0) /
                            (displayStats?.orders?.total || 1)) *
                            100
                        )}
                        % of total
                      </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-5 w-5 text-yellow-500" />
                        <span className="font-medium">Pending</span>
                      </div>
                      <p className="text-2xl font-bold">
                        {displayStats?.orders?.pending || 0}
                      </p>
                      <p className="text-sm text-gray-500">
                        {Math.round(
                          ((displayStats?.orders?.pending || 0) /
                            (displayStats?.orders?.total || 1)) *
                            100
                        )}
                        % of total
                      </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <XCircle className="h-5 w-5 text-red-500" />
                        <span className="font-medium">Cancelled</span>
                      </div>
                      <p className="text-2xl font-bold">
                        {displayStats?.orders?.cancelled || 0}
                      </p>
                      <p className="text-sm text-gray-500">
                        {Math.round(
                          ((displayStats?.orders?.cancelled || 0) /
                            (displayStats?.orders?.total || 1)) *
                            100
                        )}
                        % of total
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium">Average Order Value</h4>
                      <p className="text-xl font-bold">
                        ${displayStats?.revenue?.averageOrderValue || 0}
                      </p>
                    </div>

                    <Button
                      variant="outline"
                      className="w-full flex items-center justify-center gap-2"
                      onClick={() => router.push("/dashboard/admin/orders")}
                    >
                      <ShoppingBag className="h-4 w-4" />
                      View All Orders
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Popular Cuisines */}
              <Card className="border-none shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle>Popular Cuisines</CardTitle>
                  <CardDescription>Most ordered cuisine types</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(displayStats?.popular?.cuisines || []).map(
                      (cuisine, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <PieChart className="h-4 w-4 text-blue-500" />
                            </div>
                            <span>{cuisine.name}</span>
                          </div>
                          <span className="font-medium">
                            {cuisine.count} orders
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Top Restaurants */}
              <Card className="border-none shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle>Top Restaurants</CardTitle>
                  <CardDescription>
                    Highest performing restaurants
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(displayStats?.popular?.restaurants || []).map(
                      (restaurant, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                              <Store className="h-4 w-4 text-orange-500" />
                            </div>
                            <span>{restaurant.name}</span>
                          </div>
                          <span className="font-medium">
                            {restaurant.orders} orders
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
