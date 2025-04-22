"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Pizza, Home, ShoppingBag, Heart, User, ArrowLeft, CreditCard, Wallet, Clock, Check, LogOut } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "sonner"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js"

// Initialize Stripe with the publishable key directly
// This ensures the key is available at runtime
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "")

// Log the key for debugging (remove in production)
console.log("Stripe Key:", process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? "Available" : "Not available")

// Payment Form Component
function CheckoutForm({ clientSecret, orderId, onSuccess }) {
    const stripe = useStripe()
    const elements = useElements()
    const [isLoading, setIsLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!stripe || !elements) {
            return
        }

        setIsLoading(true)
        setErrorMessage("")

        try {
            // Confirm the payment
            const { error, paymentIntent } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: `${window.location.origin}/dashboard/user?payment_success=true`,
                },
                redirect: "if_required",
            })

            if (error) {
                setErrorMessage(error.message)
                toast.error(error.message)
            } else if (paymentIntent && paymentIntent.status === "succeeded") {
                // Payment succeeded, update order status
                await fetch(`http://localhost:5002/api/payments/confirm-payment`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        orderId,
                        paymentIntentId: paymentIntent.id,
                    }),
                })

                toast.success("Payment successful!")
                onSuccess()
            }
        } catch (error) {
            console.error("Payment error:", error)
            setErrorMessage("An unexpected error occurred. Please try again.")
            toast.error("Payment failed. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <PaymentElement />
            {errorMessage && <div className="text-red-500 text-sm">{errorMessage}</div>}
            <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600" disabled={!stripe || isLoading}>
                {isLoading ? (
                    <div className="flex items-center gap-2">
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Processing...</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <Check className="h-4 w-4" />
                        <span>Pay Now</span>
                    </div>
                )}
            </Button>
        </form>
    )
}

export default function CheckoutPage() {
    const { user, loading, logout } = useAuth()
    const router = useRouter()
    const [activeTab, setActiveTab] = useState("restaurants")
    const [cart, setCart] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [paymentMethod, setPaymentMethod] = useState("CARD")
    const [clientSecret, setClientSecret] = useState("")
    const [orderId, setOrderId] = useState("")
    const [orderCreated, setOrderCreated] = useState(false)
    const apiUrl = "http://localhost:5002/api"

    const [form, setForm] = useState({
        name: "",
        phone: "",
        email: "",
        address: "",
        specialInstructions: "",
    })

    useEffect(() => {
        // Log environment variables for debugging
        console.log("API URL:", process.env.NEXT_PUBLIC_API_URL)
        console.log("Stripe Key:", process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? "Available" : "Not available")

        // Check if redirected after successful payment
        const urlParams = new URLSearchParams(window.location.search)
        if (urlParams.get("payment_success") === "true") {
            toast.success("Payment successful! Your order has been placed.")
        }

        // Get cart from localStorage
        const savedCart = localStorage.getItem("cart")
        if (!savedCart) {
            toast.error("No items in cart")
            router.push("/dashboard/user/restaurants")
            return
        }

        setCart(JSON.parse(savedCart))

        // Pre-fill form with user data if available
        if (user) {
            setForm((prev) => ({
                ...prev,
                name: user.name || "",
                email: user.email || "",
            }))
        }
    }, [user, router])

    const handleChange = (e) => {
        const { name, value } = e.target
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!cart) {
            toast.error("No items in cart")
            return
        }

        // Validate form
        if (!form.name || !form.phone || !form.email || !form.address) {
            toast.error("Please fill in all required fields")
            return
        }

        setIsLoading(true)

        try {
            // Prepare order data
            const orderData = {
                restaurant_id: cart.restaurantId,
                items: Object.values(cart.items).map((item) => ({
                    menu_id: item._id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                })),
                total_price: cart.total + 2.99 + cart.total * 0.08, // Subtotal + delivery fee + tax
                delivery_address: form.address,
                payment_method: paymentMethod,
                payment_status: "PENDING",
                extra_notes: form.specialInstructions ? [form.specialInstructions] : [],
                order_status: "PENDING",
            }

            console.log("Sending order data:", orderData)

            // Create order
            const response = await fetch(`${apiUrl}/orders`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(orderData),
            })

            console.log("Order API response status:", response.status, response.statusText)

            if (!response.ok) {
                const errorText = await response.text().catch(() => "No error details")
                console.error("Order creation failed:", {
                    status: response.status,
                    statusText: response.statusText,
                    errorDetails: errorText,
                })
                throw new Error(`Failed to create order: ${response.status} ${response.statusText}`)
            }

            const data = await response.json()
            console.log("Order created successfully:", data)

            // Set order ID from response
            const newOrderId = data.order?._id || data._id
            setOrderId(newOrderId)

            // If payment method is card and we have a client secret
            if (paymentMethod === "CARD" && data.clientSecret) {
                setClientSecret(data.clientSecret)
                setOrderCreated(true)
            } else if (paymentMethod === "CASH_ON_DELIVERY") {
                // For cash on delivery, proceed directly
                handleOrderSuccess(newOrderId)
            } else if (paymentMethod === "CARD" && !data.clientSecret) {
                // If card payment was selected but no client secret was returned,
                // create a payment intent separately
                try {
                    const paymentResponse = await fetch(`${apiUrl}/payments/create-payment-intent`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        credentials: "include",
                        body: JSON.stringify({
                            amount: cart.total + 2.99 + cart.total * 0.08,
                            metadata: {
                                orderId: newOrderId,
                            },
                        }),
                    })

                    if (!paymentResponse.ok) {
                        throw new Error("Failed to create payment intent")
                    }

                    const paymentData = await paymentResponse.json()
                    setClientSecret(paymentData.clientSecret)
                    setOrderCreated(true)
                } catch (paymentError) {
                    console.error("Payment setup error:", paymentError)
                    toast.error("Payment setup failed. Please try again or choose a different payment method.")
                    setIsLoading(false)
                }
            }
        } catch (error) {
            console.error("Error placing order:", error)
            toast.error(`Failed to place order: ${error.message}`)
            setIsLoading(false)
        } finally {
            if (!orderCreated) {
                setIsLoading(false)
            }
        }
    }

    const handleOrderSuccess = (id = orderId) => {
        // Clear cart
        localStorage.removeItem("cart")

        // Show success message
        toast.success("Payment successful! Your order has been placed.")

        // Redirect to user dashboard
        router.push("/dashboard/user")
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

    if (!cart) {
        return (
            <div className="flex min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 items-center justify-center">
                <Card className="w-96 shadow-md">
                    <CardHeader>
                        <CardTitle>No Items in Cart</CardTitle>
                        <CardDescription>Your cart is empty</CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <Button className="w-full" onClick={() => router.push("/dashboard/user/restaurants")}>
                            Browse Restaurants
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        )
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
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6">
                {/* Back Button */}
                <Button
                    variant="ghost"
                    className="mb-4 flex items-center gap-2"
                    onClick={() => router.push(`/dashboard/user/restaurants/${cart.restaurantId}`)}
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Restaurant
                </Button>

                <h1 className="text-2xl font-bold mb-6">Checkout</h1>

                {orderCreated && clientSecret ? (
                    <div className="max-w-md mx-auto">
                        <Card className="shadow-md border-none">
                            <CardHeader>
                                <CardTitle>Complete Your Payment</CardTitle>
                                <CardDescription>Please provide your payment details</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Elements stripe={stripePromise} options={{ clientSecret }}>
                                    <CheckoutForm clientSecret={clientSecret} orderId={orderId} onSuccess={() => handleOrderSuccess()} />
                                </Elements>
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Delivery Information */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card className="shadow-md border-none">
                                <CardHeader>
                                    <CardTitle>Delivery Information</CardTitle>
                                    <CardDescription>Please provide your delivery details</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="name">Full Name *</Label>
                                                <Input id="name" name="name" value={form.name} onChange={handleChange} required />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="phone">Phone Number *</Label>
                                                <Input id="phone" name="phone" value={form.phone} onChange={handleChange} required />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email *</Label>
                                            <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="address">Delivery Address *</Label>
                                            <Textarea id="address" name="address" value={form.address} onChange={handleChange} required />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="specialInstructions">Special Instructions (Optional)</Label>
                                            <Textarea
                                                id="specialInstructions"
                                                name="specialInstructions"
                                                value={form.specialInstructions}
                                                onChange={handleChange}
                                                placeholder="Any special instructions for delivery or food preparation"
                                            />
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>

                            {/* Payment Method */}
                            <Card className="shadow-md border-none">
                                <CardHeader>
                                    <CardTitle>Payment Method</CardTitle>
                                    <CardDescription>Select your preferred payment method</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-4">
                                        <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                                            <RadioGroupItem value="CARD" id="card" />
                                            <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer">
                                                <CreditCard className="h-5 w-5 text-blue-500" />
                                                <div>
                                                    <p className="font-medium">Credit/Debit Card</p>
                                                    <p className="text-sm text-gray-500">Pay securely with your card</p>
                                                </div>
                                            </Label>
                                        </div>

                                        <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                                            <RadioGroupItem value="CASH_ON_DELIVERY" id="cash" />
                                            <Label htmlFor="cash" className="flex items-center gap-2 cursor-pointer">
                                                <Wallet className="h-5 w-5 text-green-500" />
                                                <div>
                                                    <p className="font-medium">Cash on Delivery</p>
                                                    <p className="text-sm text-gray-500">Pay when your order arrives</p>
                                                </div>
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Order Summary */}
                        <div>
                            <Card className="shadow-md border-none sticky top-6">
                                <CardHeader>
                                    <CardTitle>Order Summary</CardTitle>
                                    <CardDescription>From {cart.restaurantName}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="max-h-60 overflow-y-auto space-y-2">
                                        {Object.values(cart.items).map((item) => (
                                            <div key={item._id} className="flex justify-between items-center py-2 border-b">
                                                <div className="flex items-center gap-2">
                                                    <div className="bg-orange-100 text-orange-500 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium">
                                                        {item.quantity}
                                                    </div>
                                                    <span>{item.name}</span>
                                                </div>
                                                <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="space-y-2 pt-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Subtotal</span>
                                            <span>${cart.total.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Delivery Fee</span>
                                            <span>$2.99</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Tax (8%)</span>
                                            <span>${(cart.total * 0.08).toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between font-bold pt-2 border-t">
                                            <span>Total</span>
                                            <span>${(cart.total + 2.99 + cart.total * 0.08).toFixed(2)}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2 pt-2">
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <Clock className="h-4 w-4" />
                                            <span>Estimated delivery time: 30-45 minutes</span>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button
                                        className="w-full bg-orange-500 hover:bg-orange-600"
                                        onClick={handleSubmit}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <div className="flex items-center gap-2">
                                                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                <span>Processing...</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <Check className="h-4 w-4" />
                                                <span>Place Order</span>
                                            </div>
                                        )}
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

