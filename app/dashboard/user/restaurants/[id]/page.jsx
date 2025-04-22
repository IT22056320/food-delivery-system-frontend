"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import {
    Pizza,
    Home,
    ShoppingBag,
    Heart,
    User,
    Clock,
    MapPin,
    Phone,
    Mail,
    ArrowLeft,
    Plus,
    Minus,
    LogOut,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

export default function RestaurantDetailPage() {
    const { user, loading, logout } = useAuth()
    const params = useParams()
    const router = useRouter()
    const { id } = params
    const [activeTab, setActiveTab] = useState("dashboard")
    const [isLoading, setIsLoading] = useState(true)
    const [restaurant, setRestaurant] = useState(null)
    const [menuItems, setMenuItems] = useState([])
    const [menuCategories, setMenuCategories] = useState([])
    const [activeCategory, setActiveCategory] = useState("all")
    const [cart, setCart] = useState([])
    const [cartTotal, setCartTotal] = useState(0)

    // Fetch restaurant details
    useEffect(() => {
        const fetchRestaurant = async () => {
            try {
                const response = await fetch(`http://localhost:5001/api/restaurants/${id}`, {
                    credentials: "include",
                })

                if (response.ok) {
                    const data = await response.json()
                    setRestaurant(data)
                } else {
                    console.error("Failed to fetch restaurant:", await response.text())
                    toast.error("Failed to load restaurant details")
                }
            } catch (error) {
                console.error("Error fetching restaurant:", error)
                toast.error("Error loading restaurant details")
            }
        }

        // Fetch menu items
        const fetchMenuItems = async () => {
            try {
                const response = await fetch(`http://localhost:5001/api/menu-items/restaurant/${id}`, {
                    credentials: "include",
                })

                if (response.ok) {
                    const data = await response.json()
                    setMenuItems(data)

                    // Extract unique categories
                    const categories = [...new Set(data.map((item) => item.category))]
                    setMenuCategories(categories)
                    if (categories.length > 0) {
                        setActiveCategory("all")
                    }
                } else {
                    console.error("Failed to fetch menu items:", await response.text())
                }
            } catch (error) {
                console.error("Error fetching menu items:", error)
            }
        }

        if (id && !loading) {
            Promise.all([fetchRestaurant(), fetchMenuItems()])
                .then(() => setIsLoading(false))
                .catch(() => setIsLoading(false))
        }
    }, [id, loading])

    // Calculate cart total whenever cart changes
    useEffect(() => {
        const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
        setCartTotal(total)
    }, [cart])

    const addToCart = (item) => {
        setCart((prevCart) => {
            // Check if item already exists in cart
            const existingItemIndex = prevCart.findIndex((cartItem) => cartItem._id === item._id)

            if (existingItemIndex >= 0) {
                // Update quantity if item exists
                const updatedCart = [...prevCart]
                updatedCart[existingItemIndex] = {
                    ...updatedCart[existingItemIndex],
                    quantity: updatedCart[existingItemIndex].quantity + 1,
                }
                return updatedCart
            } else {
                // Add new item with quantity 1
                return [...prevCart, { ...item, quantity: 1 }]
            }
        })

        toast.success(`Added ${item.name} to cart`)
    }

    const removeFromCart = (itemId) => {
        setCart((prevCart) => {
            const existingItemIndex = prevCart.findIndex((item) => item._id === itemId)

            if (existingItemIndex >= 0) {
                const updatedCart = [...prevCart]
                if (updatedCart[existingItemIndex].quantity > 1) {
                    // Decrease quantity if more than 1
                    updatedCart[existingItemIndex] = {
                        ...updatedCart[existingItemIndex],
                        quantity: updatedCart[existingItemIndex].quantity - 1,
                    }
                } else {
                    // Remove item if quantity is 1
                    updatedCart.splice(existingItemIndex, 1)
                }
                return updatedCart
            }
            return prevCart
        })
    }

    const clearCart = () => {
        setCart([])
        toast.info("Cart cleared")
    }

    const proceedToCheckout = () => {
        // Save cart to localStorage or state management
        localStorage.setItem(
            "cart",
            JSON.stringify({
                restaurantId: restaurant._id,
                restaurantName: restaurant.name,
                items: cart,
                total: cartTotal,
            }),
        )

        router.push("/dashboard/user/checkout")
    }

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

    // Filter menu items based on active category
    const filteredMenuItems =
        activeCategory === "all" ? menuItems : menuItems.filter((item) => item.category === activeCategory)

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
                {/* Header with Back Button */}
                <header className="flex items-center mb-6">
                    <Button variant="ghost" className="mr-4" onClick={() => router.push("/dashboard/user")}>
                        <ArrowLeft className="h-5 w-5 mr-2" />
                        Back to Dashboard
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">
                            {isLoading ? (
                                <div className="h-8 w-40 bg-gray-200 animate-pulse rounded"></div>
                            ) : (
                                restaurant?.name || "Restaurant Details"
                            )}
                        </h1>
                    </div>
                </header>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 h-64 bg-gray-200 animate-pulse rounded-lg"></div>
                        <div className="h-64 bg-gray-200 animate-pulse rounded-lg"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Restaurant Details and Menu */}
                        <div className="md:col-span-2 space-y-6">
                            {/* Restaurant Info Card */}
                            <Card className="border-none shadow-md">
                                <CardContent className="p-6">
                                    <div className="flex flex-col md:flex-row gap-6">
                                        <div className="md:w-1/3">
                                            <div className="h-48 rounded-lg overflow-hidden bg-gray-100">
                                                <img
                                                    src={
                                                        restaurant?.image ||
                                                        `/placeholder.svg?height=200&width=200&query=${encodeURIComponent(restaurant?.name || "restaurant")}`
                                                    }
                                                    alt={restaurant?.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        </div>
                                        <div className="md:w-2/3">
                                            <div className="flex justify-between items-start mb-2">
                                                <h2 className="text-xl font-bold">{restaurant?.name}</h2>
                                                <Badge className="bg-green-100 text-green-700">Open</Badge>
                                            </div>
                                            <p className="text-gray-600 mb-4">{restaurant?.description}</p>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <MapPin className="h-4 w-4 text-gray-500" />
                                                    <span>{restaurant?.address}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Phone className="h-4 w-4 text-gray-500" />
                                                    <span>{restaurant?.phone}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Mail className="h-4 w-4 text-gray-500" />
                                                    <span>{restaurant?.email}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Clock className="h-4 w-4 text-gray-500" />
                                                    <span>Delivery: 15-30 min</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap gap-2 mt-4">
                                                {restaurant?.cuisine?.map((type, index) => (
                                                    <Badge key={index} variant="outline">
                                                        {type}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Menu Categories */}
                            <Card className="border-none shadow-md">
                                <CardHeader>
                                    <CardTitle>Menu</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Tabs defaultValue="all" value={activeCategory} onValueChange={setActiveCategory}>
                                        <TabsList className="mb-4">
                                            <TabsTrigger value="all">All</TabsTrigger>
                                            {menuCategories.map((category) => (
                                                <TabsTrigger key={category} value={category}>
                                                    {category}
                                                </TabsTrigger>
                                            ))}
                                        </TabsList>

                                        <TabsContent value={activeCategory} className="mt-0">
                                            {filteredMenuItems.length > 0 ? (
                                                <div className="space-y-4">
                                                    {filteredMenuItems.map((item) => (
                                                        <div key={item._id} className="flex items-center gap-4 p-3 border-b last:border-0">
                                                            <div className="h-16 w-16 rounded-lg overflow-hidden bg-gray-100">
                                                                <img
                                                                    src={
                                                                        item.image ||
                                                                        `/placeholder.svg?height=100&width=100&query=${encodeURIComponent(item.name)}`
                                                                    }
                                                                    alt={item.name}
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="flex justify-between">
                                                                    <h4 className="font-medium">{item.name}</h4>
                                                                    <p className="font-bold text-orange-500">${item.price.toFixed(2)}</p>
                                                                </div>
                                                                <p className="text-sm text-gray-500 line-clamp-2">{item.description}</p>
                                                            </div>
                                                            <Button onClick={() => addToCart(item)} className="bg-orange-500 hover:bg-orange-600">
                                                                <Plus className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-8">
                                                    <p className="text-gray-500">No menu items found in this category.</p>
                                                </div>
                                            )}
                                        </TabsContent>
                                    </Tabs>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Cart Section */}
                        <div>
                            <Card className="border-none shadow-md sticky top-6">
                                <CardHeader>
                                    <CardTitle>Your Order</CardTitle>
                                    <CardDescription>
                                        {cart.length === 0
                                            ? "Your cart is empty"
                                            : `${cart.reduce((total, item) => total + item.quantity, 0)} items in your cart`}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {cart.length > 0 ? (
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                {cart.map((item) => (
                                                    <div key={item._id} className="flex justify-between items-center">
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex items-center">
                                                                <Button
                                                                    variant="outline"
                                                                    size="icon"
                                                                    className="h-6 w-6 rounded-full"
                                                                    onClick={() => removeFromCart(item._id)}
                                                                >
                                                                    <Minus className="h-3 w-3" />
                                                                </Button>
                                                                <span className="mx-2">{item.quantity}</span>
                                                                <Button
                                                                    variant="outline"
                                                                    size="icon"
                                                                    className="h-6 w-6 rounded-full"
                                                                    onClick={() => addToCart(item)}
                                                                >
                                                                    <Plus className="h-3 w-3" />
                                                                </Button>
                                                            </div>
                                                            <span className="text-sm">{item.name}</span>
                                                        </div>
                                                        <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            <Separator />

                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span>Subtotal</span>
                                                    <span>${cartTotal.toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span>Delivery Fee</span>
                                                    <span>$2.99</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span>Tax</span>
                                                    <span>${(cartTotal * 0.08).toFixed(2)}</span>
                                                </div>
                                            </div>

                                            <Separator />

                                            <div className="flex justify-between font-bold">
                                                <span>Total</span>
                                                <span>${(cartTotal + 2.99 + cartTotal * 0.08).toFixed(2)}</span>
                                            </div>

                                            <div className="pt-4 space-y-2">
                                                <Button className="w-full bg-orange-500 hover:bg-orange-600" onClick={proceedToCheckout}>
                                                    Proceed to Checkout
                                                </Button>
                                                <Button variant="outline" className="w-full" onClick={clearCart}>
                                                    Clear Cart
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                            <p className="text-gray-500 mb-4">Your cart is empty</p>
                                            <p className="text-sm text-gray-400">Add items from the menu to start your order</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
