"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { createRestaurant } from "@/lib/restaurant-api"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Pizza, ArrowLeft, Plus, X, Clock } from "lucide-react"

export default function CreateRestaurantPage() {
    const { user, loading } = useAuth()
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [cuisines, setCuisines] = useState([])
    const [newCuisine, setNewCuisine] = useState("")
    const [openingHours, setOpeningHours] = useState([
        { day: "Monday", open: "09:00", close: "22:00" },
        { day: "Tuesday", open: "09:00", close: "22:00" },
        { day: "Wednesday", open: "09:00", close: "22:00" },
        { day: "Thursday", open: "09:00", close: "22:00" },
        { day: "Friday", open: "09:00", close: "22:00" },
        { day: "Saturday", open: "09:00", close: "22:00" },
        { day: "Sunday", open: "09:00", close: "22:00" },
    ])

    const [form, setForm] = useState({
        name: "",
        address: "",
        phone: "",
        email: "",
        description: "",
    })

    const handleChange = (e) => {
        const { name, value } = e.target
        setForm((prev) => ({ ...prev, [name]: value }))
    }

    const handleAddCuisine = () => {
        if (newCuisine.trim() && !cuisines.includes(newCuisine.trim())) {
            setCuisines([...cuisines, newCuisine.trim()])
            setNewCuisine("")
        }
    }

    const handleRemoveCuisine = (cuisine) => {
        setCuisines(cuisines.filter((c) => c !== cuisine))
    }

    const handleOpeningHoursChange = (index, field, value) => {
        const updatedHours = [...openingHours]
        updatedHours[index] = { ...updatedHours[index], [field]: value }
        setOpeningHours(updatedHours)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            const restaurantData = {
                ...form,
                cuisine: cuisines,
                openingHours,
            }

            await createRestaurant(restaurantData)
            toast.success("Restaurant created successfully!")
            router.push("/dashboard/restaurant")
        } catch (error) {
            toast.error(error.message || "Failed to create restaurant")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-6">
            <div className="max-w-4xl mx-auto">
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

                <Card className="border-none shadow-xl">
                    <CardHeader>
                        <CardTitle className="text-2xl">Create New Restaurant</CardTitle>
                        <CardDescription>
                            Fill in the details below to create your restaurant. Once submitted, it will be reviewed by our team.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="name">Restaurant Name</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        placeholder="Enter restaurant name"
                                        required
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="address">Address</Label>
                                    <Textarea
                                        id="address"
                                        name="address"
                                        value={form.address}
                                        onChange={handleChange}
                                        placeholder="Enter full address"
                                        required
                                        className="mt-1"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="phone">Phone Number</Label>
                                        <Input
                                            id="phone"
                                            name="phone"
                                            value={form.phone}
                                            onChange={handleChange}
                                            placeholder="Enter phone number"
                                            required
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={form.email}
                                            onChange={handleChange}
                                            placeholder="Enter email address"
                                            required
                                            className="mt-1"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        name="description"
                                        value={form.description}
                                        onChange={handleChange}
                                        placeholder="Describe your restaurant"
                                        required
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <Label>Cuisine Types</Label>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {cuisines.map((cuisine) => (
                                            <div
                                                key={cuisine}
                                                className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full flex items-center gap-1"
                                            >
                                                <span>{cuisine}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveCuisine(cuisine)}
                                                    className="text-orange-700 hover:text-orange-900"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex mt-2">
                                        <Input
                                            value={newCuisine}
                                            onChange={(e) => setNewCuisine(e.target.value)}
                                            placeholder="Add cuisine type"
                                            className="rounded-r-none"
                                        />
                                        <Button
                                            type="button"
                                            onClick={handleAddCuisine}
                                            className="rounded-l-none"
                                            disabled={!newCuisine.trim()}
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                <div>
                                    <Label>Opening Hours</Label>
                                    <div className="space-y-3 mt-2">
                                        {openingHours.map((hours, index) => (
                                            <div key={hours.day} className="grid grid-cols-3 gap-3 items-center">
                                                <div className="font-medium">{hours.day}</div>
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-4 w-4 text-gray-400" />
                                                    <Input
                                                        type="time"
                                                        value={hours.open}
                                                        onChange={(e) => handleOpeningHoursChange(index, "open", e.target.value)}
                                                    />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-4 w-4 text-gray-400" />
                                                    <Input
                                                        type="time"
                                                        value={hours.close}
                                                        onChange={(e) => handleOpeningHoursChange(index, "close", e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <CardFooter className="flex justify-end gap-3 px-0">
                                <Button type="button" variant="outline" onClick={() => router.push("/dashboard/restaurant")}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? "Creating..." : "Create Restaurant"}
                                </Button>
                            </CardFooter>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

