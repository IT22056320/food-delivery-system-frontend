"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Calendar,
  DollarSign,
  TrendingUp,
  BarChart3,
  ArrowLeft,
} from "lucide-react";
import { getDeliveryHistory, getEarningsStats } from "@/lib/delivery-api";
import Link from "next/link";

export default function DeliveryEarningsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [earningsData, setEarningsData] = useState({
    total: 0,
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
    history: [],
  });
  const [timeFilter, setTimeFilter] = useState("all");
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }

    if (!loading && user && user.role !== "delivery_person") {
      toast.error("You don't have access to the delivery dashboard");
      router.push("/dashboard/user");
      return;
    }

    if (!loading && user) {
      fetchEarningsData();
    }
  }, [loading, user, router, timeFilter]);

  // Update the fetchEarningsData function to use the correct user ID property
  const fetchEarningsData = async () => {
    try {
      setIsLoading(true);

      // Make sure we have a user before making API calls
      if (!user) {
        console.error("User not available for earnings API calls");
        toast.error(
          "User information not available. Please try logging in again."
        );
        setIsLoading(false);
        return;
      }

      // Get the user ID from the appropriate property
      const userId = user._id || user.id || user.userId || user.uid;

      if (!userId) {
        console.error("User ID not found in user object:", user);
        toast.error("User ID not available. Please try logging in again.");
        setIsLoading(false);
        return;
      }

      console.log(`Fetching earnings data for user ID: ${userId}`);

      // Fetch earnings statistics
      const stats = await getEarningsStats(userId, timeFilter);
      console.log("Fetched earnings stats:", stats);

      // Fetch delivery history for earnings calculation
      const history = await getDeliveryHistory(userId);
      console.log("Fetched delivery history for earnings:", history);

      if (!history || history.length === 0) {
        console.log("No delivery history found for earnings calculation");
        setEarningsData({
          total: 0,
          today: 0,
          thisWeek: 0,
          thisMonth: 0,
          history: [],
        });
        setChartData([]);
        setIsLoading(false);
        return;
      }

      // Calculate earnings from delivery history
      const earningsHistory = history
        .filter((delivery) => delivery.status === "DELIVERED") // Only include completed deliveries
        .map((delivery) => {
          // Calculate earnings (80% of delivery fee, which is 10% of order total)
          const deliveryFee = delivery.order?.total_price * 0.1 || 0;
          const earnings = deliveryFee * 0.8;

          return {
            ...delivery,
            earnings: earnings,
            date: new Date(delivery.delivered_at || delivery.createdAt),
          };
        });

      console.log("Calculated earnings history:", earningsHistory);

      // Calculate total earnings
      const totalEarnings = earningsHistory.reduce(
        (sum, delivery) => sum + delivery.earnings,
        0
      );

      // Calculate today's earnings
      const today = new Date().toDateString();
      const todayEarnings = earningsHistory
        .filter((delivery) => delivery.date.toDateString() === today)
        .reduce((sum, delivery) => sum + delivery.earnings, 0);

      // Calculate this week's earnings
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);

      const weekEarnings = earningsHistory
        .filter((delivery) => delivery.date >= weekStart)
        .reduce((sum, delivery) => sum + delivery.earnings, 0);

      // Calculate this month's earnings
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      const monthEarnings = earningsHistory
        .filter((delivery) => delivery.date >= monthStart)
        .reduce((sum, delivery) => sum + delivery.earnings, 0);

      // Prepare chart data - group by day for the last 30 days
      const last30Days = new Date();
      last30Days.setDate(last30Days.getDate() - 30);

      const dailyEarnings = {};

      earningsHistory.forEach((delivery) => {
        if (delivery.date >= last30Days) {
          const dateStr = delivery.date.toLocaleDateString();
          if (!dailyEarnings[dateStr]) {
            dailyEarnings[dateStr] = 0;
          }
          dailyEarnings[dateStr] += delivery.earnings;
        }
      });

      const chartDataArray = Object.keys(dailyEarnings)
        .map((date) => ({
          date,
          amount: dailyEarnings[date],
        }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      console.log("Chart data:", chartDataArray);

      setEarningsData({
        total: totalEarnings,
        today: todayEarnings,
        thisWeek: weekEarnings,
        thisMonth: monthEarnings,
        history: earningsHistory.sort((a, b) => b.date - a.date),
      });

      setChartData(chartDataArray);
    } catch (error) {
      console.error("Error fetching earnings data:", error);
      toast.error("Failed to load earnings data");
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading earnings data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link href="/dashboard/delivery">
                <Button variant="ghost" size="icon" className="mr-2">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Earnings Dashboard
                </h1>
                <p className="text-gray-600">
                  Track your delivery earnings and payment history
                </p>
                <p className="text-xs text-gray-500">
                  User ID:{" "}
                  {user?._id ||
                    user?.id ||
                    user?.userId ||
                    user?.uid ||
                    "Not available"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Earnings Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-white border-none shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Earnings</p>
                  <p className="text-2xl font-bold">
                    ${earningsData.total.toFixed(2)}
                  </p>
                </div>
                <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-orange-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-none shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Today</p>
                  <p className="text-2xl font-bold">
                    ${earningsData.today.toFixed(2)}
                  </p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-none shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">This Week</p>
                  <p className="text-2xl font-bold">
                    ${earningsData.thisWeek.toFixed(2)}
                  </p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-none shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">This Month</p>
                  <p className="text-2xl font-bold">
                    ${earningsData.thisMonth.toFixed(2)}
                  </p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Earnings Chart */}
        <Card className="bg-white border-none shadow-md mb-6">
          <CardHeader>
            <CardTitle>Earnings Trend</CardTitle>
            <CardDescription>
              Your earnings over the last 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {chartData.length > 0 ? (
                <div className="relative h-full">
                  {/* Simple bar chart implementation */}
                  <div className="flex items-end justify-between h-[250px] gap-1">
                    {chartData.map((item, index) => {
                      const maxAmount = Math.max(
                        ...chartData.map((d) => d.amount)
                      );
                      const height = (item.amount / maxAmount) * 100;

                      return (
                        <div
                          key={index}
                          className="flex flex-col items-center flex-1 min-w-0"
                        >
                          <div
                            className="w-full bg-orange-400 rounded-t-sm hover:bg-orange-500 transition-all cursor-pointer group relative"
                            style={{ height: `${Math.max(height, 5)}%` }}
                          >
                            <div className="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                              ${item.amount.toFixed(2)} on {item.date}
                            </div>
                          </div>
                          {index % 5 === 0 && (
                            <span className="text-xs text-gray-500 mt-1 truncate w-full text-center">
                              {new Date(item.date).toLocaleDateString(
                                undefined,
                                { month: "short", day: "numeric" }
                              )}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* X-axis */}
                  <div className="h-[1px] bg-gray-200 w-full mt-2"></div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-gray-500">
                    No earnings data available for the selected period
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Earnings History */}
        <Card className="bg-white border-none shadow-md">
          <CardHeader>
            <CardTitle>Earnings History</CardTitle>
            <CardDescription>
              Detailed breakdown of your delivery earnings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Date
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Order ID
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Restaurant
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Order Total
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Delivery Fee
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Your Earnings
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {earningsData.history.length > 0 ? (
                    earningsData.history.map((delivery, index) => {
                      const orderTotal = delivery.order?.total_price || 0;
                      const deliveryFee = orderTotal * 0.1;
                      const earnings = deliveryFee * 0.8;

                      return (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            {new Date(delivery.date).toLocaleDateString()}
                            <div className="text-xs text-gray-500">
                              {new Date(delivery.date).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            #{delivery.order_id.substring(0, 6)}
                          </td>
                          <td className="py-3 px-4">
                            {delivery.restaurant_contact?.name || "Restaurant"}
                          </td>
                          <td className="py-3 px-4">
                            ${orderTotal.toFixed(2)}
                          </td>
                          <td className="py-3 px-4">
                            ${deliveryFee.toFixed(2)}
                          </td>
                          <td className="py-3 px-4 font-medium text-green-600">
                            ${earnings.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-6 text-center text-gray-500"
                      >
                        No earnings history available for the selected period
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t p-4">
            <p className="text-sm text-gray-500">
              Showing {earningsData.history.length} deliveries
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled>
                Next
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
