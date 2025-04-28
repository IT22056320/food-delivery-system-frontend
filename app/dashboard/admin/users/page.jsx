"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Search,
    Store,
    Users,
    ShoppingBag,
    BarChart3,
    UserPlus,
    Trash2,
    Edit,
    MoreHorizontal,
    CheckCircle,
    XCircle,
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

// Mock data - replace with actual API calls
const mockUsers = [
    {
        _id: "1",
        name: "John Doe",
        email: "john@example.com",
        role: "customer",
        isVerified: true,
        createdAt: "2023-01-15T00:00:00.000Z",
        phone: "+1234567890",
        address: "123 Main St, City",
        orders: 12,
    },
    {
        _id: "2",
        name: "Jane Smith",
        email: "jane@restaurant.com",
        role: "restaurant_owner",
        isVerified: true,
        createdAt: "2023-02-20T00:00:00.000Z",
        phone: "+1987654321",
        address: "456 Oak Ave, Town",
        restaurants: 2,
    },
    {
        _id: "3",
        name: "Mike Johnson",
        email: "mike@delivery.com",
        role: "delivery_personnel",
        isVerified: true,
        createdAt: "2023-03-10T00:00:00.000Z",
        phone: "+1122334455",
        address: "789 Pine St, Village",
        deliveries: 45,
    },
    {
        _id: "4",
        name: "Sarah Williams",
        email: "sarah@example.com",
        role: "customer",
        isVerified: false,
        createdAt: "2023-04-05T00:00:00.000Z",
        phone: "+1555666777",
        address: "101 Elm St, County",
        orders: 0,
    },
    {
        _id: "5",
        name: "David Brown",
        email: "david@restaurant.com",
        role: "restaurant_owner",
        isVerified: true,
        createdAt: "2023-05-12T00:00:00.000Z",
        phone: "+1999888777",
        address: "202 Maple Dr, District",
        restaurants: 1,
    },
]

export default function AdminUsersPage() {
    const { user, loading } = useAuth()
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)
    const [users, setUsers] = useState([])
    const [filteredUsers, setFilteredUsers] = useState([])
    const [searchQuery, setSearchQuery] = useState("")
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [userToDelete, setUserToDelete] = useState(null)
    const [activeTab, setActiveTab] = useState("all")

    useEffect(() => {
        if (!loading && (!user || user.role !== "admin")) {
            router.push("/")
            toast.error("You don't have permission to access this page")
        }
    }, [user, loading, router])

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setIsLoading(true)
                // Replace with actual API call
                // const data = await getAllUsers();
                const data = mockUsers
                setUsers(data)
                setFilteredUsers(data)
            } catch (error) {
                toast.error("Failed to fetch users")
                console.error(error)
            } finally {
                setIsLoading(false)
            }
        }

        if (user && !loading && user.role === "admin") {
            fetchUsers()
        }
    }, [user, loading])

    useEffect(() => {
        // Apply search filter
        if (searchQuery) {
            const filtered = users.filter(
                (user) =>
                    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    user.role.toLowerCase().includes(searchQuery.toLowerCase()),
            )
            setFilteredUsers(filtered)
        } else {
            // Apply role filter based on active tab
            if (activeTab === "all") {
                setFilteredUsers(users)
            } else {
                const filtered = users.filter((user) =>
                    activeTab === "customers"
                        ? user.role === "customer"
                        : activeTab === "restaurant_owners"
                            ? user.role === "restaurant_owner"
                            : activeTab === "delivery"
                                ? user.role === "delivery_personnel"
                                : true,
                )
                setFilteredUsers(filtered)
            }
        }
    }, [searchQuery, users, activeTab])

    const handleTabChange = (value) => {
        setActiveTab(value)
        setSearchQuery("")
    }

    const confirmDelete = (user) => {
        setUserToDelete(user)
        setDeleteDialogOpen(true)
    }

    const handleDeleteUser = async () => {
        if (!userToDelete) return

        try {
            // Replace with actual API call
            // await deleteUser(userToDelete._id)

            // Update local state
            const updatedUsers = users.filter((u) => u._id !== userToDelete._id)
            setUsers(updatedUsers)

            toast.success(`${userToDelete.name} has been deleted`)
            setDeleteDialogOpen(false)
            setUserToDelete(null)
        } catch (error) {
            toast.error("Failed to delete user")
            console.error(error)
        }
    }

    const getRoleBadge = (role) => {
        switch (role) {
            case "admin":
                return <Badge className="bg-purple-100 text-purple-700">Admin</Badge>
            case "restaurant_owner":
                return <Badge className="bg-blue-100 text-blue-700">Restaurant Owner</Badge>
            case "delivery_personnel":
                return <Badge className="bg-orange-100 text-orange-700">Delivery Personnel</Badge>
            default:
                return <Badge className="bg-green-100 text-green-700">Customer</Badge>
        }
    }

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
                        <Button variant="ghost" className="w-full justify-start" onClick={() => router.push("/dashboard/admin")}>
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
                            variant="default"
                            className="w-full justify-start bg-blue-500 hover:bg-blue-600"
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
                            <h1 className="text-2xl font-bold">User Management</h1>
                            <p className="text-gray-500">Manage system users</p>
                        </div>
                        <Button className="bg-blue-500 hover:bg-blue-600">
                            <UserPlus className="h-4 w-4 mr-2" /> Add New User
                        </Button>
                    </div>

                    <Tabs defaultValue="all" value={activeTab} onValueChange={handleTabChange} className="mb-6">
                        <TabsList>
                            <TabsTrigger value="all">All Users</TabsTrigger>
                            <TabsTrigger value="customers">Customers</TabsTrigger>
                            <TabsTrigger value="restaurant_owners">Restaurant Owners</TabsTrigger>
                            <TabsTrigger value="delivery">Delivery Personnel</TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <Card className="border-none shadow-xl mb-6">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Users</CardTitle>
                            <div className="relative w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search users..."
                                    className="pl-10"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="text-center py-12">
                                    <Users className="h-10 w-10 text-blue-500 animate-spin mx-auto mb-4" />
                                    <p className="text-lg">Loading users...</p>
                                </div>
                            ) : filteredUsers.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="text-left text-xs text-gray-500 border-b">
                                                <th className="pb-2 font-medium">Name</th>
                                                <th className="pb-2 font-medium">Email</th>
                                                <th className="pb-2 font-medium">Role</th>
                                                <th className="pb-2 font-medium">Status</th>
                                                <th className="pb-2 font-medium">Joined</th>
                                                <th className="pb-2 font-medium">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredUsers.map((user) => (
                                                <tr key={user._id} className="border-b border-gray-100">
                                                    <td className="py-3 font-medium">{user.name}</td>
                                                    <td className="py-3">{user.email}</td>
                                                    <td className="py-3">{getRoleBadge(user.role)}</td>
                                                    <td className="py-3">
                                                        {user.isVerified ? (
                                                            <div className="flex items-center gap-1 text-green-600">
                                                                <CheckCircle className="h-4 w-4" />
                                                                <span className="text-xs">Verified</span>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-1 text-yellow-600">
                                                                <XCircle className="h-4 w-4" />
                                                                <span className="text-xs">Unverified</span>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="py-3 text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
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
                                                                <DropdownMenuItem>
                                                                    <Edit className="h-4 w-4 mr-2" /> Edit
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem className="text-red-600" onClick={() => confirmDelete(user)}>
                                                                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                                                                </DropdownMenuItem>
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
                                        <Users className="h-6 w-6 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-700 mb-1">No Users Found</h3>
                                    {searchQuery ? (
                                        <p className="text-sm text-gray-500 mb-4">Try adjusting your search criteria</p>
                                    ) : (
                                        <p className="text-sm text-gray-500 mb-4">There are no users in this category.</p>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete {userToDelete?.name}'s account and all associated data. This action cannot be
                            undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteUser} className="bg-red-500 hover:bg-red-600">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
