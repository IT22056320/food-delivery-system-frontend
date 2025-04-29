"use client"

import { useEffect, useState, createContext, useContext } from "react"

// Create a context to provide maps loading state
export const GoogleMapsContext = createContext({
    isLoaded: false,
    isLoading: false,
    loadError: null,
})

export const useGoogleMaps = () => useContext(GoogleMapsContext)

const GoogleMapsLoader = ({ apiKey, children, libraries = ["places"], version = "weekly" }) => {
    const [isLoaded, setIsLoaded] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [loadError, setLoadError] = useState(null)

    useEffect(() => {
        // Skip if already loaded or loading
        if (window.google?.maps || isLoading || isLoaded) {
            if (window.google?.maps) {
                setIsLoaded(true)
            }
            return
        }

        setIsLoading(true)

        // Create a unique callback name
        const callbackName = `googleMapsCallback_${Math.random().toString(36).substring(7)}`

        // Add the callback to window
        window[callbackName] = () => {
            setIsLoaded(true)
            setIsLoading(false)
            // Clean up the callback
            delete window[callbackName]
        }

        // Create script element
        const script = document.createElement("script")
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=${libraries.join(",")}&v=${version}&callback=${callbackName}`
        script.async = true
        script.defer = true
        script.onerror = (error) => {
            setLoadError(error)
            setIsLoading(false)
            console.error("Error loading Google Maps API:", error)
        }

        // Add script to document
        document.head.appendChild(script)

        return () => {
            // Clean up
            if (window[callbackName]) {
                delete window[callbackName]
            }
            // Remove script if component unmounts before loading completes
            if (!isLoaded) {
                document.head.removeChild(script)
            }
        }
    }, [apiKey, libraries, version, isLoaded, isLoading])

    // Provide the loading state through context
    const contextValue = {
        isLoaded,
        isLoading,
        loadError,
    }

    // Support both render props and regular children
    return (
        <GoogleMapsContext.Provider value={contextValue}>
            {typeof children === "function" ? children({ isLoaded, isLoading, loadError }) : children}
        </GoogleMapsContext.Provider>
    )
}

export default GoogleMapsLoader
