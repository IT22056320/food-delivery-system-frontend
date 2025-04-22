"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { motion } from "framer-motion"
import {
    Pizza,
    Home,
    ShoppingBag,
    Heart,
    User,
    Star,
    Clock,
    MapPin,
    Phone,
    Mail,
    ArrowLeft,
    Plus,
    Minus,
    ShoppingCart,
    LogOut,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { toast } from "sonner"

export default function RestaurantDetailPage() {
    const { user, loading, logout } = useAuth()
    const router = useRouter()
    const params = useParams()
    const { id } = params
    const [activeTab, setActiveTab] = useState("restaurants")
    const [isLoading, setIsLoading] = useState(true)
    const [restaurant, setRestaurant] = useState(null)
    const [menuItems, setMenuItems] = useState([])
    const [menuCategory, setMenuCategory] = useState("all")
    const [cartItems, setCartItems] = useState({})

    // Fetch restaurant details
    useEffect(() => {
        const fetchRestaurantDetails = async () => {
            try {
                const response = await fetch(`http://localhost:5001/api/restaurants/${id}`, {
                    credentials: "include",
                })

                if (!response.ok) {
                    throw new Error("Failed to fetch restaurant details")
                }

                const data = await response.json()
                setRestaurant(data)
            } catch (error) {
                console.error("Error fetching restaurant details:", error)
                toast.error("Failed to load restaurant details")
            }
        }

        if (id) {
            fetchRestaurantDetails()
        }
    }, [id])

    // Fetch menu items
    useEffect(() => {
        const fetchMenuItems = async () => {
            try {
                const response = await fetch(`http://localhost:5001/api/menu-items/restaurant/${id}`, {
                    credentials: "include",
                })

                if (!response.ok) {
                    throw new Error("Failed to fetch menu items")
                }

                const data = await response.json()
                // Filter only available menu items
                const availableItems = data.filter((item) => item.isAvailable)
                setMenuItems(availableItems)
                setIsLoading(false)
            } catch (error) {
                console.error("Error fetching menu items:", error)
                toast.error("Failed to load menu items")
                setIsLoading(false)
            }
        }

        if (id) {
            fetchMenuItems()
        }
    }, [id])

    // Get all unique categories for menu filtering
    const categories = ["all", ...new Set(menuItems.map((item) => item.category))]

    // Filter menu items by category
    const filteredMenuItems =
        menuCategory === "all" ? menuItems : menuItems.filter((item) => item.category === menuCategory)

    const handleLogout = async () => {
        try {
            await fetch("http://localhost:5000/api/auth/logout", {
                method: "POST",
                credentials: "include",
            })
            logout()
            router.push("/login")
            toast.success("Logged out successfully")
        } catch (error) {
            console.error("Logout failed:", error)
            toast.error("Logout failed. Please try again.")
        }
    }

    // Cart functions
    const addToCart = (item) => {
        setCartItems((prev) => {
            const newItems = { ...prev }
            if (newItems[item._id]) {
                newItems[item._id].quantity += 1
            } else {
                newItems[item._id] = {
                    ...item,
                    quantity: 1,
                }
            }
            return newItems
        })
        toast.success(`Added ${item.name} to cart`)
    }

    const removeFromCart = (itemId) => {
        setCartItems((prev) => {
            const newItems = { ...prev }
            if (newItems[itemId] && newItems[itemId].quantity > 1) {
                newItems[itemId].quantity -= 1
            } else {
                delete newItems[itemId]
            }
            return newItems
        })
    }

    const getCartTotal = () => {
        return Object.values(cartItems).reduce((total, item) => {
            return total + item.price * item.quantity
        }, 0)
    }

    const getCartItemsCount = () => {
        return Object.values(cartItems).reduce((count, item) => {
            return count + item.quantity
        }, 0)
    }

    const handleCheckout = () => {
        if (getCartItemsCount() === 0) {
            toast.error("Your cart is empty")
            return
        }

        // Store cart in localStorage or context for checkout page
        localStorage.setItem(
            "cart",
            JSON.stringify({
                restaurantId: id,
                restaurantName: restaurant?.name,
                items: cartItems,
                total: getCartTotal(),
            }),
        )

        router.push("/dashboard/user/checkout")
    }

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
            {/* Sidebar */}
            <div className="w-56 bg-white shadow-md flex flex-col">
                <div className="p-4 border-b">
                    <div className="flex items-center gap-2">
                        <Pizza className="h-8 w-8 text-orange-500" />
                        <span className="font-bold text-xl">FoodHub</span>
                    </div>
                </div>

                <div className="flex flex-col p-4 flex-1">
                    <p className="text-gray-500 text-sm mb-4">Welcome to your food dashboard</p>

                    <nav className="space-y-1">
                        <Button
                            variant={activeTab === "dashboard" ? "default" : "ghost"}
                            className={`w-full justify-start ${activeTab === "dashboard" ? "bg-orange-500 hover:bg-orange-600" : ""}`}
                            onClick={() => {
                                setActiveTab("dashboard")
                                router.push("/dashboard/user")
                            }}
                        >
                            <Home className="mr-2 h-5 w-5" />
                            Dashboard
                        </Button>

                        <Button
                            variant={activeTab === "restaurants" ? "default" : "ghost"}
                            className={`w-full justify-start ${activeTab === "restaurants" ? "bg-orange-500 hover:bg-orange-600" : ""}`}
                            onClick={() => {
                                setActiveTab("restaurants")
                                router.push("/dashboard/user/restaurants")
                            }}
                        >
                            <Pizza className="mr-2 h-5 w-5" />
                            Restaurants
                        </Button>

                        <Button
                            variant={activeTab === "orders" ? "default" : "ghost"}
                            className={`w-full justify-start ${activeTab === "orders" ? "bg-orange-500 hover:bg-orange-600" : ""}`}
                            onClick={() => {
                                setActiveTab("orders")
                                router.push("/dashboard/user/orders")
                            }}
                        >
                            <ShoppingBag className="mr-2 h-5 w-5" />
                            My Orders
                        </Button>

                        <Button
                            variant={activeTab === "favorites" ? "default" : "ghost"}
                            className={`w-full justify-start ${activeTab === "favorites" ? "bg-orange-500 hover:bg-orange-600" : ""}`}
                            onClick={() => {
                                setActiveTab("favorites")
                                router.push("/dashboard/user/favorites")
                            }}
                        >
                            <Heart className="mr-2 h-5 w-5" />
                            Favorites
                        </Button>

                        <Button
                            variant={activeTab === "profile" ? "default" : "ghost"}
                            className={`w-full justify-start ${activeTab === "profile" ? "bg-orange-500 hover:bg-orange-600" : ""}`}
                            onClick={() => {
                                setActiveTab("profile")
                                router.push("/dashboard/user/profile")
                            }}
                        >
                            <User className="mr-2 h-5 w-5" />
                            Profile
                        </Button>

                        <Button
                            variant="ghost"
                            className="w-full justify-start text-red-500 hover:bg-red-50 hover:text-red-600 mt-4"
                            onClick={handleLogout}
                        >
                            <LogOut className="mr-2 h-5 w-5" />
                            Logout
                        </Button>
                    </nav>
                </div>

                <div className="p-4 mt-auto">
                    <Card className="bg-orange-500 text-white border-none shadow-md">
                        <CardContent className="p-4">
                            <div className="flex flex-col items-center gap-2">
                                <Pizza className="h-8 w-8" />
                                <p className="text-sm font-medium">Get 50% off</p>
                                <Button size="sm" variant="outline" className="bg-white text-orange-500 hover:bg-orange-50 w-full">
                                    Order Now
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6">
                {/* Back Button */}
                <Button
                    variant="ghost"
                    className="mb-4 flex items-center gap-2"
                    onClick={() => router.push("/dashboard/user/restaurants")}
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Restaurants
                </Button>

                {isLoading || !restaurant ? (
                    <div className="space-y-4">
                        <div className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
                        <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                    </div>
                ) : (
                    <>
                        {/* Restaurant Header */}
                        <div className="bg-white rounded-lg overflow-hidden shadow-md mb-6">
                            <div className="h-64 bg-gray-100 relative">
                                {restaurant.image ? (
                                    <img
                                        src={restaurant.image || "/placeholder.svg"}
                                        alt={restaurant.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Pizza className="h-24 w-24 text-gray-300" />
                                    </div>
                                )}
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                                    <h1 className="text-3xl font-bold text-white">{restaurant.name}</h1>
                                    <div className="flex items-center gap-3 text-white mt-2">
                                        <div className="flex items-center">
                                            <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                                            <span className="text-sm ml-1">{restaurant.rating || 4.5}</span>
                                        </div>
                                        <span>•</span>
                                        <div className="flex items-center text-sm">
                                            <Clock className="h-3 w-3 mr-1" />
                                            <span>30-45 min</span>
                                        </div>
                                        {restaurant.cuisine && restaurant.cuisine.length > 0 && (
                                            <>
                                                <span>•</span>
                                                <div className="flex flex-wrap gap-1">
                                                    {restaurant.cuisine.map((cuisine) => (
                                                        <Badge key={cuisine} className="bg-orange-500">
                                                            {cuisine}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="p-6">
                                <p className="text-gray-600 mb-4">{restaurant.description}</p>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="flex items-start gap-2">
                                        <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <h3 className="font-medium">Address</h3>
                                            <p className="text-sm text-gray-500">{restaurant.address}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-2">
                                        <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <h3 className="font-medium">Phone</h3>
                                            <p className="text-sm text-gray-500">{restaurant.phone}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-2">
                                        <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <h3 className="font-medium">Email</h3>
                                            <p className="text-sm text-gray-500">{restaurant.email}</p>
                                        </div>
                                    </div>
                                </div>

                                {restaurant.openingHours && restaurant.openingHours.length > 0 && (
                                    <div className="mt-6">
                                        <h3 className="font-medium mb-2">Opening Hours</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                            {restaurant.openingHours.map((hours, index) => (
                                                <div key={index} className="bg-gray-50 p-2 rounded">
                                                    <p className="font-medium text-sm">{hours.day}</p>
                                                    <p className="text-sm text-gray-500">
                                                        {hours.open} - {hours.close}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Menu Section */}
                        <Card className="border-none shadow-md mb-6">
                            <CardHeader>
                                <CardTitle>Menu</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {/* Category Tabs */}
                                <Tabs defaultValue="all" value={menuCategory} onValueChange={setMenuCategory} className="mb-6">
                                    <TabsList className="w-full justify-start overflow-x-auto">
                                        {categories.map((category) => (
                                            <TabsTrigger key={category} value={category} className="capitalize">
                                                {category}
                                            </TabsTrigger>
                                        ))}
                                    </TabsList>

                                    {categories.map((category) => (
                                        <TabsContent key={category} value={category}>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {filteredMenuItems.map((item, index) => (
                                                    <motion.div
                                                        key={item._id}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: index * 0.05 }}
                                                        className="flex bg-white p-4 rounded-lg shadow-sm"
                                                    >
                                                        <div className="h-20 w-20 bg-gray-100 rounded-md overflow-hidden flex-shrink-0 mr-4">
                                                            {item.image ? (
                                                                <img
                                                                    src={item.image || "/placeholder.svg"}
                                                                    alt={item.name}
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center">
                                                                    <Pizza className="h-8 w-8 text-gray-300" />
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="flex-1">
                                                            <div className="flex justify-between">
                                                                <h3 className="font-medium">{item.name}</h3>
                                                                <p className="font-bold text-orange-500">${item.price.toFixed(2)}</p>
                                                            </div>

                                                            <p className="text-sm text-gray-500 line-clamp-2 mb-2">{item.description}</p>

                                                            <div className="flex justify-between items-center">
                                                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                                                    <Clock className="h-3 w-3" />
                                                                    <span>{item.preparationTime || 15} min</span>
                                                                </div>

                                                                <div className="flex items-center gap-2">
                                                                    {cartItems[item._id] && (
                                                                        <>
                                                                            <Button
                                                                                size="icon"
                                                                                variant="outline"
                                                                                className="h-7 w-7 rounded-full"
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation()
                                                                                    removeFromCart(item._id)
                                                                                }}
                                                                            >
                                                                                <Minus className="h-3 w-3" />
                                                                            </Button>
                                                                            <span className="text-sm font-medium w-5 text-center">
                                                                                {cartItems[item._id].quantity}
                                                                            </span>
                                                                        </>
                                                                    )}

                                                                    <Button
                                                                        size="icon"
                                                                        className="h-7 w-7 rounded-full bg-orange-500 hover:bg-orange-600"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation()
                                                                            addToCart(item)
                                                                        }}
                                                                    >
                                                                        <Plus className="h-3 w-3" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </TabsContent>
                                    ))}
                                </Tabs>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>

            {/* Cart Sidebar */}
            <div className="w-80 bg-white shadow-md flex flex-col">
                <div className="p-4 border-b">
                    <div className="flex items-center justify-between">
                        <h2 className="font-bold text-lg">Your Cart</h2>
                        <Badge className="bg-orange-500">{getCartItemsCount()} items</Badge>
                    </div>
                </div>

                <div className="flex-1 overflow-auto p-4">
                    {Object.keys(cartItems).length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <ShoppingCart className="h-12 w-12 text-gray-300 mb-2" />
                            <h3 className="font-medium text-gray-700">Your cart is empty</h3>
                            <p className="text-sm text-gray-500 mt-1">Add items from the menu to start your order</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {Object.values(cartItems).map((item) => (
                                <div key={item._id} className="flex items-center gap-3">
                                    <div className="h-12 w-12 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                                        {item.image ? (
                                            <img
                                                src={item.image || "/placeholder.svg"}
                                                alt={item.name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Pizza className="h-6 w-6 text-gray-300" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1">
                                        <h4 className="font-medium text-sm">{item.name}</h4>
                                        <div className="flex justify-between items-center mt-1">
                                            <p className="text-sm text-gray-500">
                                                ${item.price.toFixed(2)} x {item.quantity}
                                            </p>
                                            <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-6 w-6 rounded-full hover:bg-red-50 hover:text-red-500"
                                            onClick={() => removeFromCart(item._id)}
                                        >
                                            <Minus className="h-3 w-3" />
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-6 w-6 rounded-full hover:bg-green-50 hover:text-green-500"
                                            onClick={() => addToCart(item)}
                                        >
                                            <Plus className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-4 border-t">
                    <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Subtotal</span>
                            <span>${getCartTotal().toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Delivery Fee</span>
                            <span>$2.99</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Tax</span>
                            <span>${(getCartTotal() * 0.08).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold pt-2 border-t">
                            <span>Total</span>
                            <span>${(getCartTotal() + 2.99 + getCartTotal() * 0.08).toFixed(2)}</span>
                        </div>
                    </div>

                    <Button
                        className="w-full bg-orange-500 hover:bg-orange-600"
                        disabled={Object.keys(cartItems).length === 0}
                        onClick={handleCheckout}
                    >
                        Proceed to Checkout
                    </Button>
                </div>
            </div>
        </div>
    )
}
