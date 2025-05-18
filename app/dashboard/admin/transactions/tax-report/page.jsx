"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Skeleton } from "@/components/ui/skeleton";
import { getTaxReport, exportTransactionsCSV } from "@/lib/api";
import { toast } from "react-hot-toast";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { Download, ArrowLeft, DollarSign } from "lucide-react";
import AdminSidebar from "@/components/admin-sidebar";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export default function TaxReportPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState("month");
  const [taxReport, setTaxReport] = useState({
    summary: {
      totalTax: 0,
      totalTransactions: 0,
      totalAmount: 0,
    },
    taxByDay: [],
    taxByRestaurant: [],
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    } else if (!loading && user && user.role !== "admin") {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchTaxReport = async () => {
      try {
        setIsLoading(true);
        const data = await getTaxReport(dateFilter);
        setTaxReport(data);
      } catch (error) {
        toast.error("Failed to fetch tax report");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user && !loading && user.role === "admin") {
      fetchTaxReport();
    }
  }, [user, loading, dateFilter]);

  const handleExportCSV = async () => {
    try {
      const blob = await exportTransactionsCSV(dateFilter);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `tax-report-${dateFilter}-${
        new Date().toISOString().split("T")[0]
      }.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Tax report exported successfully");
    } catch (error) {
      toast.error("Failed to export tax report");
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <AdminSidebar />
        <div className="flex-1 p-8">
          <Skeleton className="h-12 w-48 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <Skeleton className="h-96 mb-6" />
        </div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Button
              variant="ghost"
              onClick={() => router.push("/dashboard/admin/transactions")}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Transactions
            </Button>
            <h1 className="text-3xl font-bold">Tax Collection Report</h1>
          </div>
          <div className="flex gap-2">
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleExportCSV}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Total Tax Collected
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 text-muted-foreground mr-2" />
                <div className="text-2xl font-bold">
                  ${taxReport.summary.totalTax?.toFixed(2) || "0.00"}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                From {taxReport.summary.totalTransactions || 0} transactions
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Total Transaction Amount
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 text-muted-foreground mr-2" />
                <div className="text-2xl font-bold">
                  ${taxReport.summary.totalAmount?.toFixed(2) || "0.00"}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Tax rate:{" "}
                {(
                  (taxReport.summary.totalTax / taxReport.summary.totalAmount) *
                    100 || 0
                ).toFixed(2)}
                %
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Average Tax Per Transaction
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 text-muted-foreground mr-2" />
                <div className="text-2xl font-bold">
                  $
                  {taxReport.summary.totalTransactions
                    ? (
                        taxReport.summary.totalTax /
                        taxReport.summary.totalTransactions
                      ).toFixed(2)
                    : "0.00"}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Based on {taxReport.summary.totalTransactions || 0} transactions
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Tax Collection Over Time</CardTitle>
              <CardDescription>
                Daily tax collection for the selected period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {isLoading ? (
                  <Skeleton className="h-full w-full" />
                ) : taxReport.taxByDay && taxReport.taxByDay.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={taxReport.taxByDay}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="_id" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="taxAmount"
                        name="Tax Amount"
                        stroke="#8884d8"
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">
                      No tax data available for this period
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tax by Restaurant</CardTitle>
              <CardDescription>
                Top restaurants by tax contribution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {isLoading ? (
                  <Skeleton className="h-full w-full" />
                ) : taxReport.taxByRestaurant &&
                  taxReport.taxByRestaurant.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={taxReport.taxByRestaurant}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name} (${(percent * 100).toFixed(0)}%)`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="taxAmount"
                        nameKey="_id"
                      >
                        {taxReport.taxByRestaurant.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">
                      No restaurant tax data available
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Tax Collection Details</CardTitle>
            <CardDescription>
              Detailed breakdown of tax collection by day
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : taxReport.taxByDay && taxReport.taxByDay.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Date</th>
                      <th className="text-left py-3 px-4">Transactions</th>
                      <th className="text-left py-3 px-4">Tax Collected</th>
                    </tr>
                  </thead>
                  <tbody>
                    {taxReport.taxByDay.map((day) => (
                      <tr key={day._id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">{day._id}</td>
                        <td className="py-3 px-4">{day.count}</td>
                        <td className="py-3 px-4">
                          ${day.taxAmount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-muted-foreground">
                  No tax data available for this period
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
