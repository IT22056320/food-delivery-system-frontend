"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { getAllUsers, updateUserStatus, deleteUser } from "@/lib/api"
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
    UserPlus,
    Trash2,
    Edit,
    MoreHorizontal,
    CheckCircle,
    Ban,
    Shield,
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
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [userToEdit, setUserToEdit] = useState(null)
    const [userStats, setUserStats] = useState({
        total: 0,
        customers: 0,
        restaurantOwners: 0,
        deliveryPersonnel: 0,
        admins: 0,
    })

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
                const data = await getAllUsers()
                setUsers(data)
                setFilteredUsers(data)

                // Calculate user statistics
                const stats = {
                    total: data.length,
                    customers: data.filter((u) => u.role === "customer").length,
                    restaurantOwners: data.filter((u) => u.role === "restaurant_owner").length,
                    deliveryPersonnel: data.filter((u) => u.role === "delivery_personnel").length,
                    admins: data.filter((u) => u.role === "admin").length,
                }
                setUserStats(stats)
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
                    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    user.role?.toLowerCase().includes(searchQuery.toLowerCase()),
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
                                : activeTab === "admins"
                                    ? user.role === "admin"
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
            await deleteUser(userToDelete._id)

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

    const openEditDialog = (user) => {
        setUserToEdit({ ...user })
        setEditDialogOpen(true)
    }

    const handleUpdateUser = async () => {
        if (!userToEdit) return

        try {
            const updatedUser = await updateUserStatus(userToEdit._id, {
                isActive: userToEdit.isActive,
                role: userToEdit.role,
            })

            // Update local state
            const updatedUsers = users.map((u) => (u._id === updatedUser._id ? updatedUser : u))
            setUsers(updatedUsers)

            toast.success(`${userToEdit.name}'s account has been updated`)
            setEditDialogOpen(false)
            setUserToEdit(null)
        } catch (error) {
            toast.error("Failed to update user")
            console.error(error)
        }
    }

    const toggleUserStatus = async (userId, isActive) => {
        try {
            const updatedUser = await updateUserStatus(userId, { isActive: !isActive })

            // Update local state
            const updatedUsers = users.map((u) => (u._id === userId ? { ...u, isActive: !isActive } : u))
            setUsers(updatedUsers)

            toast.success(`User status updated successfully`)
        } catch (error) {
            toast.error("Failed to update user status")
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
            <AdminSidebar activePage="users" />

            {/* Main Content */}
            <div className="flex-1 p-6">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold">User Management</h1>
                            <p className="text-gray-500">Manage system users</p>
                        </div>
                        <Button
                            className="bg-blue-500 hover:bg-blue-600"
                            onClick={() => router.push("/dashboard/admin/users/create")}
                        >
                            <UserPlus className="h-4 w-4 mr-2" /> Add New User
                        </Button>
                    </div>

                    {/* User Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                        <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
                            <CardContent className="p-4">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-gray-500 text-sm">Total Users</p>
                                        <h3 className="text-2xl font-bold mt-1">{userStats.total}</h3>
                                    </div>
                                    <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                                        <Users className="h-5 w-5 text-gray-500" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
                            <CardContent className="p-4">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-gray-500 text-sm">Customers</p>
                                        <h3 className="text-2xl font-bold mt-1">{userStats.customers}</h3>
                                    </div>
                                    <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                                        <Users className="h-5 w-5 text-green-500" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
                            <CardContent className="p-4">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-gray-500 text-sm">Restaurant Owners</p>
                                        <h3 className="text-2xl font-bold mt-1">{userStats.restaurantOwners}</h3>
                                    </div>
                                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                        <Store className="h-5 w-5 text-blue-500" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
                            <CardContent className="p-4">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-gray-500 text-sm">Delivery Personnel</p>
                                        <h3 className="text-2xl font-bold mt-1">{userStats.deliveryPersonnel}</h3>
                                    </div>
                                    <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center">
                                        <ShoppingBag className="h-5 w-5 text-orange-500" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
                            <CardContent className="p-4">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-gray-500 text-sm">Admins</p>
                                        <h3 className="text-2xl font-bold mt-1">{userStats.admins}</h3>
                                    </div>
                                    <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                                        <Shield className="h-5 w-5 text-purple-500" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Tabs defaultValue="all" value={activeTab} onValueChange={handleTabChange} className="mb-6">
                        <TabsList>
                            <TabsTrigger value="all">All Users</TabsTrigger>
                            <TabsTrigger value="customers">Customers</TabsTrigger>
                            <TabsTrigger value="restaurant_owners">Restaurant Owners</TabsTrigger>
                            <TabsTrigger value="delivery">Delivery Personnel</TabsTrigger>
                            <TabsTrigger value="admins">Admins</TabsTrigger>
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
                                                        {user.isActive !== false ? (
                                                            <div className="flex items-center gap-1 text-green-600">
                                                                <CheckCircle className="h-4 w-4" />
                                                                <span className="text-xs">Active</span>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-1 text-red-600">
                                                                <Ban className="h-4 w-4" />
                                                                <span className="text-xs">Suspended</span>
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
                                                                <DropdownMenuItem onClick={() => openEditDialog(user)}>
                                                                    <Edit className="h-4 w-4 mr-2" /> Edit
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => toggleUserStatus(user._id, user.isActive !== false)}>
                                                                    {user.isActive !== false ? (
                                                                        <>
                                                                            <Ban className="h-4 w-4 mr-2 text-orange-500" /> Suspend
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <CheckCircle className="h-4 w-4 mr-2 text-green-500" /> Activate
                                                                        </>
                                                                    )}
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

            {/* Edit User Dialog */}
            <AlertDialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <AlertDialogContent className="max-w-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Edit User</AlertDialogTitle>
                        <AlertDialogDescription>Update user details and permissions.</AlertDialogDescription>
                    </AlertDialogHeader>

                    {userToEdit && (
                        <div className="space-y-4 py-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Name</label>
                                <Input
                                    value={userToEdit.name}
                                    onChange={(e) => setUserToEdit({ ...userToEdit, name: e.target.value })}
                                    disabled
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Email</label>
                                <Input
                                    value={userToEdit.email}
                                    onChange={(e) => setUserToEdit({ ...userToEdit, email: e.target.value })}
                                    disabled
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Role</label>
                                <select
                                    className="w-full p-2 border rounded-md"
                                    value={userToEdit.role}
                                    onChange={(e) => setUserToEdit({ ...userToEdit, role: e.target.value })}
                                >
                                    <option value="customer">Customer</option>
                                    <option value="restaurant_owner">Restaurant Owner</option>
                                    <option value="delivery_personnel">Delivery Personnel</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Status</label>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="isActive"
                                        checked={userToEdit.isActive !== false}
                                        onChange={(e) => setUserToEdit({ ...userToEdit, isActive: e.target.checked })}
                                        className="rounded border-gray-300"
                                    />
                                    <label htmlFor="isActive">Active</label>
                                </div>
                            </div>
                        </div>
                    )}

                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleUpdateUser} className="bg-blue-500 hover:bg-blue-600">
                            Save Changes
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
