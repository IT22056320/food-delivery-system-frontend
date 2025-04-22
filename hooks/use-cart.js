"use client"

import { createContext, useContext, useState, useEffect } from "react"

const CartContext = createContext()

export function CartProvider({ children }) {
    const [cart, setCart] = useState({
        restaurantId: null,
        restaurantName: "",
        items: {},
        total: 0,
    })

    // Load cart from localStorage on initial render
    useEffect(() => {
        const savedCart = localStorage.getItem("cart")
        if (savedCart) {
            setCart(JSON.parse(savedCart))
        }
    }, [])

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(cart))
    }, [cart])

    const addToCart = (restaurantId, restaurantName, item) => {
        // If trying to add item from a different restaurant, ask for confirmation
        if (cart.restaurantId && cart.restaurantId !== restaurantId) {
            const confirmed = window.confirm(
                "Adding items from a different restaurant will clear your current cart. Continue?",
            )

            if (!confirmed) return false

            // Clear the cart if confirmed
            setCart({
                restaurantId,
                restaurantName,
                items: {
                    [item._id]: {
                        ...item,
                        quantity: 1,
                    },
                },
                total: item.price,
            })

            return true
        }

        // Add item to cart
        setCart((prev) => {
            const newItems = { ...prev.items }

            if (newItems[item._id]) {
                newItems[item._id].quantity += 1
            } else {
                newItems[item._id] = {
                    ...item,
                    quantity: 1,
                }
            }

            const newTotal = Object.values(newItems).reduce((sum, item) => sum + item.price * item.quantity, 0)

            return {
                restaurantId,
                restaurantName,
                items: newItems,
                total: newTotal,
            }
        })

        return true
    }

    const removeFromCart = (itemId) => {
        setCart((prev) => {
            const newItems = { ...prev.items }

            if (newItems[itemId]) {
                if (newItems[itemId].quantity > 1) {
                    newItems[itemId].quantity -= 1
                } else {
                    delete newItems[itemId]
                }
            }

            const newTotal = Object.values(newItems).reduce((sum, item) => sum + item.price * item.quantity, 0)

            // If cart is empty, reset restaurantId
            const restaurantId = Object.keys(newItems).length > 0 ? prev.restaurantId : null
            const restaurantName = Object.keys(newItems).length > 0 ? prev.restaurantName : ""

            return {
                restaurantId,
                restaurantName,
                items: newItems,
                total: newTotal,
            }
        })
    }

    const clearCart = () => {
        setCart({
            restaurantId: null,
            restaurantName: "",
            items: {},
            total: 0,
        })
    }

    const getCartItemsCount = () => {
        return Object.values(cart.items).reduce((count, item) => count + item.quantity, 0)
    }

    return (
        <CartContext.Provider
            value={{
                cart,
                addToCart,
                removeFromCart,
                clearCart,
                getCartItemsCount,
            }}
        >
            {children}
        </CartContext.Provider>
    )
}

export function useCart() {
    const context = useContext(CartContext)
    if (!context) {
        throw new Error("useCart must be used within a CartProvider")
    }
    return context
}
