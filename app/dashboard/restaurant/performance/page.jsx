"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import {
  getMyRestaurants,
  getRestaurantStats,
  getPopularMenuItems,
} from "@/lib/restaurant-api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Pizza,
  ArrowLeft,
  Clock,
  DollarSign,
  CheckCircle,
  Store,
} from "lucide-react";

export default function RestaurantPerformancePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [restaurants, setRestaurants] = useState([]);
  const [timeFilter, setTimeFilter] = useState("week");
  const [restaurantStats, setRestaurantStats] = useState({});
  const [popularItems, setPopularItems] = useState({});

  useEffect(() => {
    if (!loading && user?.role !== "restaurant_owner") {
      router.push("/");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const data = await getMyRestaurants();
        setRestaurants(data);

        // Fetch stats for all restaurants
        if (data.length > 0) {
          const statsPromises = data.map((restaurant) =>
            fetchRestaurantData(restaurant._id)
          );
          await Promise.all(statsPromises);
        }
      } catch (error) {
        toast.error("Failed to fetch restaurants");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user && !loading) {
      fetchRestaurants();
    }
  }, [user, loading, timeFilter]);

  const fetchRestaurantData = async (restaurantId) => {
    try {
      // Fetch restaurant stats
      const stats = await getRestaurantStats(restaurantId);
      setRestaurantStats((prev) => ({
        ...prev,
        [restaurantId]: stats,
      }));

      // Fetch popular items
      const period =
        timeFilter === "today"
          ? "day"
          : timeFilter === "week"
          ? "week"
          : "month";
      const items = await getPopularMenuItems(restaurantId, period);
      setPopularItems((prev) => ({
        ...prev,
        [restaurantId]: items,
      }));
    } catch (error) {
      console.error(
        `Failed to fetch data for restaurant ${restaurantId}:`,
        error
      );
    }
  };

  // Calculate overall stats across all restaurants
  const calculateOverallStats = () => {
    let totalOrders = 0;
    let totalRevenue = 0;
    let totalDelivered = 0;
    let totalCancelled = 0;

    restaurants.forEach((restaurant) => {
      const stats = restaurantStats[restaurant._id];
      if (stats) {
        totalOrders += stats.totalOrders || 0;
        totalRevenue += stats.totalRevenue || 0;
        totalDelivered += stats.deliveredOrders || 0;
        totalCancelled += stats.cancelledOrders || 0;
      }
    });

    const completionRate =
      totalOrders > 0 ? Math.round((totalDelivered / totalOrders) * 100) : 0;
    const cancellationRate =
      totalOrders > 0 ? Math.round((totalCancelled / totalOrders) * 100) : 0;

    return {
      totalOrders,
      totalRevenue,
      completionRate,
      cancellationRate,
    };
  };

  const overallStats = calculateOverallStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            className="flex items-center gap-2"
            onClick={() => router.push("/dashboard/restaurant")}
          >
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Button>
          <div className="flex items-center gap-2">
            <Pizza className="h-6 w-6 text-orange-500" />
            <span className="font-bold text-xl">FoodHub</span>
          </div>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Restaurant Performance</h1>
          <p className="text-gray-500">
            Compare performance across all your restaurants
          </p>
        </div>

        {/* Time Period Filter */}
        <div className="mb-6">
          <Tabs
            defaultValue="week"
            value={timeFilter}
            onValueChange={setTimeFilter}
          >
            <TabsList>
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="week">This Week</TabsTrigger>
              <TabsTrigger value="month">This Month</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Overall Stats */}
        <Card className="border-none shadow-md mb-6">
          <CardHeader>
            <CardTitle>Overall Performance</CardTitle>
            <CardDescription>
              Combined stats across all your restaurants
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <Store className="h-4 w-4 text-orange-500" />
                  </div>
                  <span className="text-sm text-gray-500">
                    Total Restaurants
                  </span>
                </div>
                <div className="text-2xl font-bold">{restaurants.length}</div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Clock className="h-4 w-4 text-blue-500" />
                  </div>
                  <span className="text-sm text-gray-500">Total Orders</span>
                </div>
                <div className="text-2xl font-bold">
                  {overallStats.totalOrders}
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                    <DollarSign className="h-4 w-4 text-green-500" />
                  </div>
                  <span className="text-sm text-gray-500">Total Revenue</span>
                </div>
                <div className="text-2xl font-bold">
                  ${overallStats.totalRevenue.toFixed(2)}
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-purple-500" />
                  </div>
                  <span className="text-sm text-gray-500">Completion Rate</span>
                </div>
                <div className="text-2xl font-bold">
                  {overallStats.completionRate}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Individual Restaurant Performance */}
        <div className="grid grid-cols-1 gap-6">
          {isLoading ? (
            <Card className="border-none shadow-md">
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-24 bg-gray-200 rounded"></div>
                    <div className="h-24 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : restaurants.length > 0 ? (
            restaurants.map((restaurant) => (
              <Card key={restaurant._id} className="border-none shadow-md">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>{restaurant.name}</CardTitle>
                      <CardDescription>{restaurant.address}</CardDescription>
                    </div>
                    <Badge
                      className={
                        restaurant.isAvailable
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }
                    >
                      {restaurant.isAvailable ? "Open" : "Closed"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Restaurant Stats */}
                    <div>
                      <h3 className="text-lg font-medium mb-4">
                        Performance Metrics
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-1">
                            <p className="text-sm">Order Completion Rate</p>
                            <p className="text-sm font-medium">
                              {restaurantStats[restaurant._id]
                                ?.completionRate || 0}
                              %
                            </p>
                          </div>
                          <Progress
                            value={
                              restaurantStats[restaurant._id]?.completionRate ||
                              0
                            }
                            className="h-2"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <p className="text-sm">Customer Satisfaction</p>
                            <p className="text-sm font-medium">
                              {restaurantStats[restaurant._id]
                                ?.customerSatisfaction || 0}
                              %
                            </p>
                          </div>
                          <Progress
                            value={
                              restaurantStats[restaurant._id]
                                ?.customerSatisfaction || 0
                            }
                            className="h-2"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <p className="text-sm">On-time Delivery</p>
                            <p className="text-sm font-medium">
                              {restaurantStats[restaurant._id]
                                ?.onTimeDelivery || 0}
                              %
                            </p>
                          </div>
                          <Progress
                            value={
                              restaurantStats[restaurant._id]?.onTimeDelivery ||
                              0
                            }
                            className="h-2"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="text-sm text-gray-500 mb-1">
                              Total Orders
                            </div>
                            <div className="text-xl font-bold">
                              {restaurantStats[restaurant._id]?.totalOrders ||
                                0}
                            </div>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="text-sm text-gray-500 mb-1">
                              Revenue
                            </div>
                            <div className="text-xl font-bold">
                              $
                              {(
                                restaurantStats[restaurant._id]?.totalRevenue ||
                                0
                              ).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Popular Items */}
                    <div>
                      <h3 className="text-lg font-medium mb-4">
                        Popular Items
                      </h3>
                      <div className="space-y-3">
                        {popularItems[restaurant._id] &&
                        popularItems[restaurant._id].length > 0 ? (
                          popularItems[restaurant._id]
                            .slice(0, 3)
                            .map((item) => (
                              <div
                                key={item.menuItemId}
                                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                              >
                                <div className="h-10 w-10 bg-orange-100 rounded-full overflow-hidden">
                                  {item.image ? (
                                    <img
                                      src={item.image || "/placeholder.svg"}
                                      alt={item.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <Pizza className="h-5 w-5 m-auto mt-2.5 text-orange-500" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium">{item.name}</p>
                                  <div className="flex justify-between items-center">
                                    <p className="text-xs text-gray-500">
                                      {item.count} orders this{" "}
                                      {timeFilter === "today"
                                        ? "day"
                                        : timeFilter}
                                    </p>
                                    <p className="text-sm font-medium">
                                      ${item.price?.toFixed(2) || "0.00"}
                                    </p>
                                  </div>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {item.category || "Uncategorized"}
                                  </p>
                                </div>
                              </div>
                            ))
                        ) : (
                          <div className="text-center py-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-500">
                              No popular items data available
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <Button
                      onClick={() =>
                        router.push(
                          `/dashboard/restaurant/edit/${restaurant._id}`
                        )
                      }
                      variant="outline"
                      className="mr-2"
                    >
                      Edit Restaurant
                    </Button>
                    <Button
                      onClick={() =>
                        router.push(
                          `/dashboard/restaurant/menu?restaurant=${restaurant._id}`
                        )
                      }
                      className="bg-orange-500 hover:bg-orange-600"
                    >
                      Manage Menu
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
              <Store className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-700 mb-1">
                No Restaurants Found
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                You need to create a restaurant to view performance metrics.
              </p>
              <Button
                onClick={() => router.push("/dashboard/restaurant/create")}
                className="bg-orange-500 hover:bg-orange-600"
              >
                Create Restaurant
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
