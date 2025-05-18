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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getTransactionsByPeriod,
  getTaxReport,
  exportTransactionsCSV,
} from "@/lib/api";
import { toast } from "react-hot-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Download,
  Search,
  DollarSign,
  CreditCard,
  Wallet,
  FileText,
} from "lucide-react";
import AdminSidebar from "@/components/admin-sidebar";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export default function AdminTransactionsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("month");
  const [statusFilter, setStatusFilter] = useState("all");
  const [transactionStats, setTransactionStats] = useState({
    total: 0,
    totalAmount: 0,
    totalTax: 0,
    completed: 0,
    refunded: 0,
    pending: 0,
  });
  const [taxReport, setTaxReport] = useState({
    summary: {
      totalTax: 0,
      totalTransactions: 0,
      totalAmount: 0,
    },
    taxByDay: [],
    taxByRestaurant: [],
  });
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    } else if (!loading && user && user.role !== "admin") {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true);
        const data = await getTransactionsByPeriod(dateFilter);
        setTransactions(data);
        setFilteredTransactions(data);

        // Calculate transaction statistics
        const stats = {
          total: data.length,
          totalAmount: data.reduce((sum, t) => sum + t.amount, 0).toFixed(2),
          totalTax: data
            .reduce((sum, t) => sum + (t.taxAmount || 0), 0)
            .toFixed(2),
          completed: data.filter((t) => t.status === "completed").length,
          refunded: data.filter((t) => t.status === "refunded").length,
          pending: data.filter((t) => t.status === "pending").length,
        };
        setTransactionStats(stats);

        // Fetch tax report
        const taxData = await getTaxReport(dateFilter);
        setTaxReport(taxData);
      } catch (error) {
        toast.error("Failed to fetch transactions");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user && !loading && user.role === "admin") {
      fetchTransactions();
    }
  }, [user, loading, dateFilter]);

  useEffect(() => {
    // Filter transactions based on search term and status filter
    let filtered = [...transactions];

    if (searchTerm) {
      filtered = filtered.filter(
        (transaction) =>
          transaction._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          transaction.orderId
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          transaction.customerId
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          transaction.restaurantId
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (transaction) => transaction.status === statusFilter
      );
    }

    setFilteredTransactions(filtered);
  }, [searchTerm, statusFilter, transactions]);

  const handleExportCSV = async () => {
    try {
      const blob = await exportTransactionsCSV(dateFilter);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `transactions-${dateFilter}-${
        new Date().toISOString().split("T")[0]
      }.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Transactions exported successfully");
    } catch (error) {
      toast.error("Failed to export transactions");
      console.error(error);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case "refunded":
        return <Badge className="bg-red-500">Refunded</Badge>;
      case "failed":
        return <Badge className="bg-gray-500">Failed</Badge>;
      default:
        return <Badge className="bg-gray-500">{status}</Badge>;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
          <h1 className="text-3xl font-bold">Financial Transactions</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportCSV}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                router.push("/dashboard/admin/transactions/tax-report")
              }
            >
              <FileText className="mr-2 h-4 w-4" />
              Tax Report
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Total Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 text-muted-foreground mr-2" />
                <div className="text-2xl font-bold">
                  ${transactionStats.totalAmount}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {transactionStats.total} transactions | $
                {transactionStats.totalTax} tax collected
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Payment Methods
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <CreditCard className="h-4 w-4 text-muted-foreground mr-1" />
                  <span className="text-sm">
                    Card:{" "}
                    {
                      transactions.filter((t) => t.paymentMethod === "CARD")
                        .length
                    }
                  </span>
                </div>
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 text-muted-foreground mr-1" />
                  <span className="text-sm">
                    Cash:{" "}
                    {
                      transactions.filter((t) => t.paymentMethod === "CASH")
                        .length
                    }
                  </span>
                </div>
                <div className="flex items-center">
                  <Wallet className="h-4 w-4 text-muted-foreground mr-1" />
                  <span className="text-sm">
                    Wallet:{" "}
                    {
                      transactions.filter((t) => t.paymentMethod === "WALLET")
                        .length
                    }
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Transaction Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <span className="h-3 w-3 rounded-full bg-green-500 mr-1"></span>
                  <span className="text-sm">
                    Completed: {transactionStats.completed}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="h-3 w-3 rounded-full bg-yellow-500 mr-1"></span>
                  <span className="text-sm">
                    Pending: {transactionStats.pending}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="h-3 w-3 rounded-full bg-red-500 mr-1"></span>
                  <span className="text-sm">
                    Refunded: {transactionStats.refunded}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Transaction Overview</CardTitle>
              <CardDescription>
                View transaction trends over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {taxReport.taxByDay && taxReport.taxByDay.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
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
                      <YAxis
                        yAxisId="left"
                        orientation="left"
                        stroke="#8884d8"
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke="#82ca9d"
                      />
                      <Tooltip />
                      <Legend />
                      <Bar
                        yAxisId="left"
                        dataKey="taxAmount"
                        name="Tax Amount"
                        fill="#8884d8"
                      />
                      <Bar
                        yAxisId="right"
                        dataKey="count"
                        name="Transaction Count"
                        fill="#82ca9d"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">
                      No transaction data available
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search transactions..."
                className="pl-8 w-[300px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Transaction List</CardTitle>
              <CardDescription>
                Showing {filteredTransactions.length} of {transactions.length}{" "}
                transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredTransactions.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">No transactions found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Transaction ID</th>
                        <th className="text-left py-3 px-4">Date</th>
                        <th className="text-left py-3 px-4">Amount</th>
                        <th className="text-left py-3 px-4">Tax</th>
                        <th className="text-left py-3 px-4">Payment Method</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTransactions.map((transaction) => (
                        <tr
                          key={transaction._id}
                          className="border-b hover:bg-muted/50"
                        >
                          <td className="py-3 px-4 font-mono text-sm">
                            {transaction._id}
                          </td>
                          <td className="py-3 px-4">
                            {formatDate(transaction.createdAt)}
                          </td>
                          <td className="py-3 px-4">
                            ${transaction.amount.toFixed(2)}
                          </td>
                          <td className="py-3 px-4">
                            $
                            {transaction.taxAmount
                              ? transaction.taxAmount.toFixed(2)
                              : "0.00"}
                          </td>
                          <td className="py-3 px-4">
                            {transaction.paymentMethod}
                          </td>
                          <td className="py-3 px-4">
                            {getStatusBadge(transaction.status)}
                          </td>
                          <td className="py-3 px-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                router.push(
                                  `/dashboard/admin/transactions/${transaction._id}`
                                )
                              }
                            >
                              View
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
