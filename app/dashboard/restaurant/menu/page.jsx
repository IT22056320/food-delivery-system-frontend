"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { getMyRestaurants, getMenuItems, updateMenuItemAvailability, deleteMenuItem } from "@/lib/restaurant-api"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Pizza, ArrowLeft, Plus, Search, Edit, Trash2, Clock, Tag, Store } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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

export default function MenuItemsPage() {
    const { user, loading } = useAuth()
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)
    const [restaurants, setRestaurants] = useState([])
    const [selectedRestaurant, setSelectedRestaurant] = useState(null)
    const [menuItems, setMenuItems] = useState([])
    const [filteredMenuItems, setFilteredMenuItems] = useState([])
    const [searchQuery, setSearchQuery] = useState("")
    const [categoryFilter, setCategoryFilter] = useState("")
    const [availabilityFilter, setAvailabilityFilter] = useState("")
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [itemToDelete, setItemToDelete] = useState(null)

    useEffect(() => {
        if (!loading && user?.role !== "restaurant_owner") {
            router.push("/")
        }
    }, [user, loading, router])

    useEffect(() => {
        const fetchRestaurants = async () => {
            try {
                const data = await getMyRestaurants()
                setRestaurants(data)
                if (data.length > 0) {
                    setSelectedRestaurant(data[0])
                }
            } catch (error) {
                toast.error("Failed to fetch restaurants")
                console.error(error)
            } finally {
                setIsLoading(false)
            }
        }

        if (user && !loading) {
            fetchRestaurants()
        }
    }, [user, loading])

    useEffect(() => {
        const fetchMenuItems = async () => {
            if (!selectedRestaurant) return

            try {
                const data = await getMenuItems(selectedRestaurant._id)
                setMenuItems(data)
                setFilteredMenuItems(data)
            } catch (error) {
                toast.error("Failed to fetch menu items")
                console.error(error)
            }
        }

        if (selectedRestaurant) {
            fetchMenuItems()
        }
    }, [selectedRestaurant])

    useEffect(() => {
        // Apply filters
        let filtered = [...menuItems]

        if (searchQuery) {
            filtered = filtered.filter(
                (item) =>
                    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    item.description.toLowerCase().includes(searchQuery.toLowerCase()),
            )
        }

        if (categoryFilter && categoryFilter !== "all") {
            filtered = filtered.filter((item) => item.category === categoryFilter)
        }

        if (availabilityFilter && availabilityFilter !== "all") {
            filtered = filtered.filter((item) => {
                if (availabilityFilter === "available") return item.isAvailable
                if (availabilityFilter === "unavailable") return !item.isAvailable
                return true
            })
        }

        setFilteredMenuItems(filtered)
    }, [searchQuery, categoryFilter, availabilityFilter, menuItems])

    const handleToggleAvailability = async (item) => {
        try {
            await updateMenuItemAvailability(item._id, !item.isAvailable)

            // Update local state
            const updatedItems = menuItems.map((menuItem) =>
                menuItem._id === item._id ? { ...menuItem, isAvailable: !menuItem.isAvailable } : menuItem,
            )

            setMenuItems(updatedItems)
            toast.success(`${item.name} is now ${!item.isAvailable ? "available" : "unavailable"}`)
        } catch (error) {
            toast.error("Failed to update availability")
            console.error(error)
        }
    }

    const handleDeleteMenuItem = async () => {
        if (!itemToDelete) return

        try {
            await deleteMenuItem(itemToDelete._id)

            // Update local state
            const updatedItems = menuItems.filter((item) => item._id !== itemToDelete._id)
            setMenuItems(updatedItems)

            toast.success(`${itemToDelete.name} has been deleted`)
            setDeleteDialogOpen(false)
            setItemToDelete(null)
        } catch (error) {
            toast.error("Failed to delete menu item")
            console.error(error)
        }
    }

    const confirmDelete = (item) => {
        setItemToDelete(item)
        setDeleteDialogOpen(true)
    }

    // Get unique categories for filter
    const categories = [...new Set(menuItems.map((item) => item.category))]

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

                <Card className="border-none shadow-xl mb-6">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-2xl">Menu Items</CardTitle>
                        <Button
                            onClick={() => router.push("/dashboard/restaurant/menu/create")}
                            className="bg-orange-500 hover:bg-orange-600"
                        >
                            <Plus className="h-4 w-4 mr-2" /> Add Menu Item
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {restaurants.length > 0 ? (
                            <div className="space-y-6">
                                {/* Restaurant Selector */}
                                <div className="flex flex-col md:flex-row md:items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">Select Restaurant:</span>
                                        <Select
                                            value={selectedRestaurant?._id || "none"}
                                            onValueChange={(value) => {
                                                const restaurant = restaurants.find((r) => r._id === value)
                                                setSelectedRestaurant(restaurant)
                                            }}
                                        >
                                            <SelectTrigger className="w-[250px]">
                                                <SelectValue placeholder="Select a restaurant" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {restaurants.map((restaurant) => (
                                                    <SelectItem key={restaurant._id} value={restaurant._id}>
                                                        {restaurant.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Search and Filters */}
                                    <div className="flex-1 flex flex-col md:flex-row gap-3">
                                        <div className="relative flex-1">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <Input
                                                placeholder="Search menu items..."
                                                className="pl-10"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                            />
                                        </div>
                                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue placeholder="Filter by category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Categories</SelectItem>
                                                {categories.map((category) => (
                                                    <SelectItem key={category} value={category}>
                                                        {category}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue placeholder="Filter by availability" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Items</SelectItem>
                                                <SelectItem value="available">Available</SelectItem>
                                                <SelectItem value="unavailable">Unavailable</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Menu Items Grid */}
                                {filteredMenuItems.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {filteredMenuItems.map((item) => (
                                            <Card key={item._id} className="overflow-hidden">
                                                <div className="h-40 bg-gray-100 relative">
                                                    {item.image ? (
                                                        <img
                                                            src={item.image || "/placeholder.svg"}
                                                            alt={item.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <Pizza className="h-12 w-12 text-gray-300" />
                                                        </div>
                                                    )}
                                                    <Badge
                                                        className={`absolute top-2 right-2 ${item.isAvailable ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                                            }`}
                                                    >
                                                        {item.isAvailable ? "Available" : "Unavailable"}
                                                    </Badge>
                                                </div>
                                                <CardContent className="p-4">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h3 className="font-bold text-lg">{item.name}</h3>
                                                        <span className="font-bold text-orange-500">${item.price.toFixed(2)}</span>
                                                    </div>
                                                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                                                    <div className="flex flex-wrap gap-2 mb-3">
                                                        <Badge variant="outline" className="flex items-center gap-1">
                                                            <Tag className="h-3 w-3" /> {item.category}
                                                        </Badge>
                                                        <Badge variant="outline" className="flex items-center gap-1">
                                                            <Clock className="h-3 w-3" /> {item.preparationTime} min
                                                        </Badge>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm">Available</span>
                                                            <Switch
                                                                checked={item.isAvailable}
                                                                onCheckedChange={() => handleToggleAvailability(item)}
                                                                className="data-[state=checked]:bg-orange-500"
                                                            />
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 w-8 p-0"
                                                                onClick={() => router.push(`/dashboard/restaurant/menu/edit/${item._id}`)}
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                                onClick={() => confirmDelete(item)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="mx-auto h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                            <Pizza className="h-6 w-6 text-gray-400" />
                                        </div>
                                        {menuItems.length > 0 ? (
                                            <>
                                                <h3 className="text-lg font-medium text-gray-700 mb-1">No items match your filters</h3>
                                                <p className="text-sm text-gray-500">Try adjusting your search or filters</p>
                                            </>
                                        ) : (
                                            <>
                                                <h3 className="text-lg font-medium text-gray-700 mb-1">No Menu Items</h3>
                                                <p className="text-sm text-gray-500 mb-4">
                                                    You haven't added any menu items to this restaurant yet.
                                                </p>
                                                <Button
                                                    onClick={() => router.push("/dashboard/restaurant/menu/create")}
                                                    className="bg-orange-500 hover:bg-orange-600"
                                                >
                                                    <Plus className="h-4 w-4 mr-2" /> Add First Menu Item
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="mx-auto h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                    <Store className="h-6 w-6 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-700 mb-1">No Restaurants</h3>
                                <p className="text-sm text-gray-500 mb-4">You need to create a restaurant before adding menu items.</p>
                                <Button
                                    onClick={() => router.push("/dashboard/restaurant/create")}
                                    className="bg-orange-500 hover:bg-orange-600"
                                >
                                    <Plus className="h-4 w-4 mr-2" /> Create Restaurant
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete {itemToDelete?.name}. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteMenuItem} className="bg-red-500 hover:bg-red-600">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

