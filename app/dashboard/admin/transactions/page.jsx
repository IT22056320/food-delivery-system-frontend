"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { getTransactions, processRefund } from "@/lib/api"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Search,
    DollarSign,
    RefreshCcw,
    Download,
    Calendar,
    MoreHorizontal,
    ArrowUpDown,
    FileText,
    TrendingUp,
} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminSidebar } from "@/components/admin-sidebar"

export default function AdminTransactionsPage() {
    const { user, loading } = useAuth()
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)
    const [transactions, setTransactions] = useState([])
    const [filteredTransactions, setFilteredTransactions] = useState([])
    const [searchQuery, setSearchQuery] = useState("")
    const [refundDialogOpen, setRefundDialogOpen] = useState(false)
    const [transactionToRefund, setTransactionToRefund] = useState(null)
    const [activeTab, setActiveTab] = useState("all")
    const [dateFilter, setDateFilter] = useState("all")
    const [sortOrder, setSortOrder] = useState("newest")
    const [transactionStats, setTransactionStats] = useState({
        total: 0,
        totalAmount: 0,
        completed: 0,
        refunded: 0,
        pending: 0,
    })

    useEffect(() => {
        if (!loading && (!user || user.role !== "admin")) {
            router.push("/")
            toast.error("You don't have permission to access this page")
        }
    }, [user, loading, router])

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                setIsLoading(true)
                const data = await getTransactions()
                setTransactions(data)
                setFilteredTransactions(data)

                // Calculate transaction statistics
                const stats = {
                    total: data.length,
                    totalAmount: data.reduce((sum, t) => sum + t.amount, 0).toFixed(2),
                    completed: data.filter((t) => t.status === "completed").length,
                    refunded: data.filter((t) => t.status === "refunded").length,
                    pending: data.filter((t) => t.status === "pending").length,
                }
                setTransactionStats(stats)
            } catch (error) {
                toast.error("Failed to fetch transactions")
                console.error(error)
            } finally {
                setIsLoading(false)
            }
        }

        if (user && !loading && user.role === "admin") {
            fetchTransactions()
        }
    }, [user, loading])

    useEffect(() => {
        // Apply filters
        let filtered = [...transactions]

        // Status filter
        if (activeTab !== "all") {
            filtered = filtered.filter((t) => t.status === activeTab)
        }

        // Date filter
        if (dateFilter !== "all") {
            const now = new Date()
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

            if (dateFilter === "today") {
                filtered = filtered.filter((t) => new Date(t.createdAt) >= today)
            } else if (dateFilter === "week") {
                const weekAgo = new Date(today)
                weekAgo.setDate(weekAgo.getDate() - 7)
                filtered = filtered.filter((t) => new Date(t.createdAt) >= weekAgo)
            } else if (dateFilter === "month") {
                const monthAgo = new Date(today)
                monthAgo.setMonth(monthAgo.getMonth() - 1)
                filtered = filtered.filter((t) => new Date(t.createdAt) >= monthAgo)
            }
        }

        // Search filter
        if (searchQuery) {
            filtered = filtered.filter(
                (t) =>
                    t.orderId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    t.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    t.restaurantName?.toLowerCase().includes(searchQuery.toLowerCase()),
            )
        }

        // Sort
        filtered.sort((a, b) => {
            if (sortOrder === "newest") {
                return new Date(b.createdAt) - new Date(a.createdAt)
            } else if (sortOrder === "oldest") {
                return new Date(a.createdAt) - new Date(b.createdAt)
            } else if (sortOrder === "highest") {
                return b.amount - a.amount
            } else if (sortOrder === "lowest") {
                return a.amount - b.amount
            }
            return 0
        })

        setFilteredTransactions(filtered)
    }, [searchQuery, transactions, activeTab, dateFilter, sortOrder])

    const handleTabChange = (value) => {
        setActiveTab(value)
    }

    const confirmRefund = (transaction) => {
        setTransactionToRefund(transaction)
        setRefundDialogOpen(true)
    }

    const handleProcessRefund = async () => {
        if (!transactionToRefund) return

        try {
            await processRefund(transactionToRefund._id)

            // Update local state
            const updatedTransactions = transactions.map((t) =>
                t._id === transactionToRefund._id ? { ...t, status: "refunded" } : t,
            )
            setTransactions(updatedTransactions)

            toast.success(`Refund processed successfully for order #${transactionToRefund.orderId}`)
            setRefundDialogOpen(false)
            setTransactionToRefund(null)
        } catch (error) {
            toast.error("Failed to process refund")
            console.error(error)
        }
    }

    const getStatusBadge = (status) => {
        switch (status) {
            case "completed":
                return <Badge className="bg-green-100 text-green-700">Completed</Badge>
            case "refunded":
                return <Badge className="bg-red-100 text-red-700">Refunded</Badge>
            case "pending":
                return <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>
            case "failed":
                return <Badge className="bg-gray-100 text-gray-700">Failed</Badge>
            default:
                return <Badge className="bg-blue-100 text-blue-700">{status}</Badge>
        }
    }

    const exportTransactions = () => {
        // Create CSV content
        const headers = ["Transaction ID", "Order ID", "Customer", "Restaurant", "Amount", "Status", "Date"]
        const csvContent = [
            headers.join(","),
            ...filteredTransactions.map((t) =>
                [
                    t._id,
                    t.orderId,
                    t.customerName,
                    t.restaurantName,
                    `$${t.amount.toFixed(2)}`,
                    t.status,
                    new Date(t.createdAt).toLocaleString(),
                ].join(","),
            ),
        ].join("\n")

        // Create download link
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.setAttribute("href", url)
        link.setAttribute("download", `transactions_${new Date().toISOString().split("T")[0]}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Sidebar */}
            <AdminSidebar activePage="transactions" />

            {/* Main Content */}
            <div className="flex-1 p-6">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold">Financial Transactions</h1>
                            <p className="text-gray-500">Manage and monitor all system transactions</p>
                        </div>
                        <Button className="bg-green-500 hover:bg-green-600" onClick={exportTransactions}>
                            <Download className="h-4 w-4 mr-2" /> Export Transactions
                        </Button>
                    </div>

                    {/* Transaction Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
                            <CardContent className="p-4">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-gray-500 text-sm">Total Revenue</p>
                                        <h3 className="text-2xl font-bold mt-1">${transactionStats.totalAmount}</h3>
                                    </div>
                                    <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                                        <DollarSign className="h-5 w-5 text-green-500" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
                            <CardContent className="p-4">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-gray-500 text-sm">Completed Transactions</p>
                                        <h3 className="text-2xl font-bold mt-1">{transactionStats.completed}</h3>
                                    </div>
                                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                        <TrendingUp className="h-5 w-5 text-blue-500" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
                            <CardContent className="p-4">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-gray-500 text-sm">Refunded Transactions</p>
                                        <h3 className="text-2xl font-bold mt-1">{transactionStats.refunded}</h3>
                                    </div>
                                    <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
                                        <RefreshCcw className="h-5 w-5 text-red-500" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
                            <CardContent className="p-4">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-gray-500 text-sm">Pending Transactions</p>
                                        <h3 className="text-2xl font-bold mt-1">{transactionStats.pending}</h3>
                                    </div>
                                    <div className="h-10 w-10 bg-yellow-100 rounded-full flex items-center justify-center">
                                        <FileText className="h-5 w-5 text-yellow-500" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <Tabs defaultValue="all" value={activeTab} onValueChange={handleTabChange} className="flex-1">
                            <TabsList>
                                <TabsTrigger value="all">All Transactions</TabsTrigger>
                                <TabsTrigger value="completed">Completed</TabsTrigger>
                                <TabsTrigger value="pending">Pending</TabsTrigger>
                                <TabsTrigger value="refunded">Refunded</TabsTrigger>
                            </TabsList>
                        </Tabs>

                        <div className="flex gap-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="flex items-center">
                                        <Calendar className="h-4 w-4 mr-2" />
                                        {dateFilter === "all"
                                            ? "All Time"
                                            : dateFilter === "today"
                                                ? "Today"
                                                : dateFilter === "week"
                                                    ? "This Week"
                                                    : "This Month"}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuLabel>Filter by Date</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => setDateFilter("all")}>All Time</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setDateFilter("today")}>Today</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setDateFilter("week")}>This Week</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setDateFilter("month")}>This Month</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="flex items-center">
                                        <ArrowUpDown className="h-4 w-4 mr-2" />
                                        {sortOrder === "newest"
                                            ? "Newest First"
                                            : sortOrder === "oldest"
                                                ? "Oldest First"
                                                : sortOrder === "highest"
                                                    ? "Highest Amount"
                                                    : "Lowest Amount"}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => setSortOrder("newest")}>Newest First</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setSortOrder("oldest")}>Oldest First</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setSortOrder("highest")}>Highest Amount</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setSortOrder("lowest")}>Lowest Amount</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    <Card className="border-none shadow-xl mb-6">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Transactions</CardTitle>
                            <div className="relative w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search transactions..."
                                    className="pl-10"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="text-center py-12">
                                    <DollarSign className="h-10 w-10 text-blue-500 animate-spin mx-auto mb-4" />
                                    <p className="text-lg">Loading transactions...</p>
                                </div>
                            ) : filteredTransactions.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="text-left text-xs text-gray-500 border-b">
                                                <th className="pb-2 font-medium">Transaction ID</th>
                                                <th className="pb-2 font-medium">Order ID</th>
                                                <th className="pb-2 font-medium">Customer</th>
                                                <th className="pb-2 font-medium">Restaurant</th>
                                                <th className="pb-2 font-medium">Amount</th>
                                                <th className="pb-2 font-medium">Status</th>
                                                <th className="pb-2 font-medium">Date</th>
                                                <th className="pb-2 font-medium">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredTransactions.map((transaction) => (
                                                <tr key={transaction._id} className="border-b border-gray-100">
                                                    <td className="py-3 font-medium text-xs">{transaction._id.substring(0, 8)}...</td>
                                                    <td className="py-3">{transaction.orderId}</td>
                                                    <td className="py-3">{transaction.customerName}</td>
                                                    <td className="py-3">{transaction.restaurantName}</td>
                                                    <td className="py-3 font-medium">${transaction.amount.toFixed(2)}</td>
                                                    <td className="py-3">{getStatusBadge(transaction.status)}</td>
                                                    <td className="py-3 text-gray-500">{new Date(transaction.createdAt).toLocaleDateString()}</td>
                                                    <td className="py-3">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    onClick={() => router.push(`/dashboard/admin/transactions/${transaction._id}`)}
                                                                >
                                                                    <FileText className="h-4 w-4 mr-2" /> View Details
                                                                </DropdownMenuItem>
                                                                {transaction.status === "completed" && (
                                                                    <DropdownMenuItem className="text-red-600" onClick={() => confirmRefund(transaction)}>
                                                                        <RefreshCcw className="h-4 w-4 mr-2" /> Process Refund
                                                                    </DropdownMenuItem>
                                                                )}
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="mx-auto h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                        <DollarSign className="h-6 w-6 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-700 mb-1">No Transactions Found</h3>
                                    {searchQuery || activeTab !== "all" || dateFilter !== "all" ? (
                                        <p className="text-sm text-gray-500 mb-4">Try adjusting your filters</p>
                                    ) : (
                                        <p className="text-sm text-gray-500 mb-4">There are no transactions recorded in the system.</p>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Refund Confirmation Dialog */}
            <AlertDialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Process Refund</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to process a refund for order #{transactionToRefund?.orderId}? This action cannot be
                            undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleProcessRefund} className="bg-red-500 hover:bg-red-600">
                            Process Refund
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
