"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { getMyRestaurants, createMenuItem } from "@/lib/restaurant-api"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Pizza, ArrowLeft, Plus, X } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function CreateMenuItemPage() {
    const { user, loading } = useAuth()
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [restaurants, setRestaurants] = useState([])
    const [ingredients, setIngredients] = useState([])
    const [newIngredient, setNewIngredient] = useState("")

    const [form, setForm] = useState({
        restaurantId: "",
        name: "",
        description: "",
        price: "",
        category: "",
        image: "",
        preparationTime: "15",
        nutritionalInfo: {
            calories: "",
            protein: "",
            carbs: "",
            fat: "",
        },
    })

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
                    setForm((prev) => ({ ...prev, restaurantId: data[0]._id }))
                }
            } catch (error) {
                toast.error("Failed to fetch restaurants")
                console.error(error)
            }
        }

        if (user && !loading) {
            fetchRestaurants()
        }
    }, [user, loading])

    const handleChange = (e) => {
        const { name, value } = e.target

        if (name.includes(".")) {
            const [parent, child] = name.split(".")
            setForm((prev) => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value,
                },
            }))
        } else {
            setForm((prev) => ({ ...prev, [name]: value }))
        }
    }

    const handleSelectChange = (name, value) => {
        setForm((prev) => ({ ...prev, [name]: value }))
    }

    const handleAddIngredient = () => {
        if (newIngredient.trim() && !ingredients.includes(newIngredient.trim())) {
            setIngredients([...ingredients, newIngredient.trim()])
            setNewIngredient("")
        }
    }

    const handleRemoveIngredient = (ingredient) => {
        setIngredients(ingredients.filter((i) => i !== ingredient))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            // Format the data
            const menuItemData = {
                ...form,
                price: Number.parseFloat(form.price),
                preparationTime: Number.parseInt(form.preparationTime),
                ingredients,
                nutritionalInfo: {
                    calories: form.nutritionalInfo.calories ? Number.parseInt(form.nutritionalInfo.calories) : undefined,
                    protein: form.nutritionalInfo.protein ? Number.parseInt(form.nutritionalInfo.protein) : undefined,
                    carbs: form.nutritionalInfo.carbs ? Number.parseInt(form.nutritionalInfo.carbs) : undefined,
                    fat: form.nutritionalInfo.fat ? Number.parseInt(form.nutritionalInfo.fat) : undefined,
                },
            }

            await createMenuItem(menuItemData)
            toast.success("Menu item created successfully!")
            router.push("/dashboard/restaurant/menu")
        } catch (error) {
            toast.error(error.message || "Failed to create menu item")
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
                        onClick={() => router.push("/dashboard/restaurant/menu")}
                    >
                        <ArrowLeft className="h-4 w-4" /> Back to Menu Items
                    </Button>
                    <div className="flex items-center gap-2">
                        <Pizza className="h-6 w-6 text-orange-500" />
                        <span className="font-bold text-xl">FoodHub</span>
                    </div>
                </div>

                <Card className="border-none shadow-xl">
                    <CardHeader>
                        <CardTitle className="text-2xl">Add New Menu Item</CardTitle>
                        <CardDescription>Fill in the details below to add a new item to your restaurant's menu.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="restaurantId">Restaurant</Label>
                                    <Select
                                        value={form.restaurantId}
                                        onValueChange={(value) => handleSelectChange("restaurantId", value)}
                                        required
                                    >
                                        <SelectTrigger className="mt-1">
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

                                <div>
                                    <Label htmlFor="name">Item Name</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        placeholder="Enter item name"
                                        required
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        name="description"
                                        value={form.description}
                                        onChange={handleChange}
                                        placeholder="Describe the menu item"
                                        required
                                        className="mt-1"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="price">Price ($)</Label>
                                        <Input
                                            id="price"
                                            name="price"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={form.price}
                                            onChange={handleChange}
                                            placeholder="0.00"
                                            required
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="category">Category</Label>
                                        <Input
                                            id="category"
                                            name="category"
                                            value={form.category}
                                            onChange={handleChange}
                                            placeholder="e.g., Appetizers, Main Course, Desserts"
                                            required
                                            className="mt-1"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="image">Image URL (optional)</Label>
                                        <Input
                                            id="image"
                                            name="image"
                                            value={form.image}
                                            onChange={handleChange}
                                            placeholder="Enter image URL"
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="preparationTime">Preparation Time (minutes)</Label>
                                        <Input
                                            id="preparationTime"
                                            name="preparationTime"
                                            type="number"
                                            min="1"
                                            value={form.preparationTime}
                                            onChange={handleChange}
                                            required
                                            className="mt-1"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label>Ingredients</Label>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {ingredients.map((ingredient) => (
                                            <div
                                                key={ingredient}
                                                className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full flex items-center gap-1"
                                            >
                                                <span>{ingredient}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveIngredient(ingredient)}
                                                    className="text-orange-700 hover:text-orange-900"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex mt-2">
                                        <Input
                                            value={newIngredient}
                                            onChange={(e) => setNewIngredient(e.target.value)}
                                            placeholder="Add ingredient"
                                            className="rounded-r-none"
                                        />
                                        <Button
                                            type="button"
                                            onClick={handleAddIngredient}
                                            className="rounded-l-none"
                                            disabled={!newIngredient.trim()}
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                <div>
                                    <Label>Nutritional Information (optional)</Label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                                        <div>
                                            <Label htmlFor="calories" className="text-xs">
                                                Calories
                                            </Label>
                                            <Input
                                                id="calories"
                                                name="nutritionalInfo.calories"
                                                type="number"
                                                min="0"
                                                value={form.nutritionalInfo.calories}
                                                onChange={handleChange}
                                                placeholder="kcal"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="protein" className="text-xs">
                                                Protein
                                            </Label>
                                            <Input
                                                id="protein"
                                                name="nutritionalInfo.protein"
                                                type="number"
                                                min="0"
                                                value={form.nutritionalInfo.protein}
                                                onChange={handleChange}
                                                placeholder="g"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="carbs" className="text-xs">
                                                Carbs
                                            </Label>
                                            <Input
                                                id="carbs"
                                                name="nutritionalInfo.carbs"
                                                type="number"
                                                min="0"
                                                value={form.nutritionalInfo.carbs}
                                                onChange={handleChange}
                                                placeholder="g"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="fat" className="text-xs">
                                                Fat
                                            </Label>
                                            <Input
                                                id="fat"
                                                name="nutritionalInfo.fat"
                                                type="number"
                                                min="0"
                                                value={form.nutritionalInfo.fat}
                                                onChange={handleChange}
                                                placeholder="g"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <CardFooter className="flex justify-end gap-3 px-0">
                                <Button type="button" variant="outline" onClick={() => router.push("/dashboard/restaurant/menu")}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? "Creating..." : "Create Menu Item"}
                                </Button>
                            </CardFooter>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

