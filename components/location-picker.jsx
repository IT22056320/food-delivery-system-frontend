"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Navigation, Search, X, AlertCircle } from "lucide-react"

const LocationPicker = ({
    initialLocation = null,
    onLocationSelect,
    buttonText = "Confirm Location",
    placeholder = "Search for a location",
    height = "400px",
}) => {
    const [map, setMap] = useState(null)
    const [marker, setMarker] = useState(null)
    const [selectedLocation, setSelectedLocation] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [loadingCurrentLocation, setLoadingCurrentLocation] = useState(false)
    const [error, setError] = useState(null)
    const mapRef = useRef(null)
    const searchInputRef = useRef(null)
    const mapInstanceRef = useRef(null)
    const markerInstanceRef = useRef(null)
    const searchBoxInstanceRef = useRef(null)
    const googleMapsLoadedRef = useRef(false)

    // Initialize with default location if none provided
    useEffect(() => {
        if (initialLocation) {
            // Convert to standard format if needed
            let lat, lng

            if (Array.isArray(initialLocation)) {
                // If it's an array in [lng, lat] format (MongoDB format)
                lng = initialLocation[0]
                lat = initialLocation[1]
            } else if (initialLocation.lat && initialLocation.lng) {
                // If it's an object with lat/lng properties
                lat = initialLocation.lat
                lng = initialLocation.lng
            }

            // Validate coordinates
            if (typeof lat === "number" && !isNaN(lat) && typeof lng === "number" && !isNaN(lng)) {
                setSelectedLocation({
                    lat,
                    lng,
                    address: initialLocation.address || "Selected location",
                })
            }
        }
    }, [initialLocation])

    // Load Google Maps script if not already loaded
    useEffect(() => {
        if (window.google && window.google.maps) {
            googleMapsLoadedRef.current = true
            initializeMap()
            return
        }

        const loadGoogleMapsScript = () => {
            if (document.querySelector('script[src*="maps.googleapis.com/maps/api"]')) {
                // Script is already loading or loaded
                const checkIfLoaded = setInterval(() => {
                    if (window.google && window.google.maps) {
                        clearInterval(checkIfLoaded)
                        googleMapsLoadedRef.current = true
                        initializeMap()
                    }
                }, 100)
                return
            }

            const script = document.createElement("script")
            script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`
            script.async = true
            script.defer = true
            script.onload = () => {
                googleMapsLoadedRef.current = true
                initializeMap()
            }
            script.onerror = () => {
                setError("Failed to load Google Maps. Please try again later.")
                setIsLoading(false)
            }
            document.head.appendChild(script)
        }

        loadGoogleMapsScript()
    }, [])

    // Initialize map when Google Maps is loaded
    const initializeMap = () => {
        if (!mapRef.current || !googleMapsLoadedRef.current) return

        try {
            // Clean up existing instances to prevent memory leaks
            if (mapInstanceRef.current) {
                // No need to explicitly clean up the map, just create a new one
            }

            if (markerInstanceRef.current) {
                markerInstanceRef.current.setMap(null)
            }

            // Default to Colombo, Sri Lanka if no location is selected
            const defaultLocation = { lat: 6.9271, lng: 79.8612 }

            // Use selected location if available, otherwise use default
            const initialPos = selectedLocation ? { lat: selectedLocation.lat, lng: selectedLocation.lng } : defaultLocation

            // Create map instance
            const mapInstance = new window.google.maps.Map(mapRef.current, {
                center: initialPos,
                zoom: 15,
                mapTypeControl: false,
                fullscreenControl: false,
                streetViewControl: false,
                zoomControl: true,
            })

            // Create marker
            const markerInstance = new window.google.maps.Marker({
                map: mapInstance,
                position: initialPos,
                draggable: true,
                animation: window.google.maps.Animation.DROP,
            })

            // Create search box if input ref exists
            if (searchInputRef.current) {
                const searchBoxInstance = new window.google.maps.places.SearchBox(searchInputRef.current)

                // Bias search results to current map viewport
                mapInstance.addListener("bounds_changed", () => {
                    searchBoxInstance.setBounds(mapInstance.getBounds())
                })

                // Listen for search box place selection
                searchBoxInstance.addListener("places_changed", () => {
                    const places = searchBoxInstance.getPlaces()
                    if (places.length === 0) return

                    const place = places[0]
                    if (!place.geometry || !place.geometry.location) return

                    // Set map center and marker position
                    mapInstance.setCenter(place.geometry.location)
                    markerInstance.setPosition(place.geometry.location)

                    // Update selected location
                    const newLocation = {
                        lat: place.geometry.location.lat(),
                        lng: place.geometry.location.lng(),
                        address: place.formatted_address || place.name,
                    }
                    setSelectedLocation(newLocation)
                    setError(null)
                })

                searchBoxInstanceRef.current = searchBoxInstance
            }

            // Listen for map clicks to set marker
            const mapClickListener = mapInstance.addListener("click", (event) => {
                markerInstance.setPosition(event.latLng)

                // Get address from coordinates (reverse geocoding)
                const geocoder = new window.google.maps.Geocoder()
                geocoder.geocode({ location: event.latLng }, (results, status) => {
                    if (status === "OK" && results[0]) {
                        const newLocation = {
                            lat: event.latLng.lat(),
                            lng: event.latLng.lng(),
                            address: results[0].formatted_address,
                        }
                        setSelectedLocation(newLocation)
                        setError(null)
                    } else {
                        const newLocation = {
                            lat: event.latLng.lat(),
                            lng: event.latLng.lng(),
                            address: `${event.latLng.lat().toFixed(6)}, ${event.latLng.lng().toFixed(6)}`,
                        }
                        setSelectedLocation(newLocation)
                        setError(null)
                    }
                })
            })

            // Listen for marker drag end
            const markerDragListener = markerInstance.addListener("dragend", () => {
                const position = markerInstance.getPosition()

                // Get address from coordinates (reverse geocoding)
                const geocoder = new window.google.maps.Geocoder()
                geocoder.geocode({ location: position }, (results, status) => {
                    if (status === "OK" && results[0]) {
                        const newLocation = {
                            lat: position.lat(),
                            lng: position.lng(),
                            address: results[0].formatted_address,
                        }
                        setSelectedLocation(newLocation)
                        setError(null)
                    } else {
                        const newLocation = {
                            lat: position.lat(),
                            lng: position.lng(),
                            address: `${position.lat().toFixed(6)}, ${position.lng().toFixed(6)}`,
                        }
                        setSelectedLocation(newLocation)
                        setError(null)
                    }
                })
            })

            // Save instances to refs for cleanup
            mapInstanceRef.current = mapInstance
            markerInstanceRef.current = markerInstance

            // Save instances to state for component use
            setMap(mapInstance)
            setMarker(markerInstance)
            setIsLoading(false)

            // Return cleanup function for event listeners
            return () => {
                window.google.maps.event.removeListener(mapClickListener)
                window.google.maps.event.removeListener(markerDragListener)
            }
        } catch (error) {
            console.error("Error initializing Google Maps:", error)
            setError("Failed to initialize maps. Please try again later.")
            setIsLoading(false)
        }
    }

    // Clean up on unmount
    useEffect(() => {
        return () => {
            // Clean up marker
            if (markerInstanceRef.current) {
                markerInstanceRef.current.setMap(null)
                markerInstanceRef.current = null
            }

            // Clean up event listeners
            if (mapInstanceRef.current && window.google) {
                window.google.maps.event.clearInstanceListeners(mapInstanceRef.current)
            }

            // Clean up search box
            if (searchBoxInstanceRef.current && window.google) {
                window.google.maps.event.clearInstanceListeners(searchBoxInstanceRef.current)
            }
        }
    }, [])

    // Get current location
    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser")
            return
        }

        setLoadingCurrentLocation(true)
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords

                // Update map and marker
                if (mapInstanceRef.current && markerInstanceRef.current) {
                    const latLng = new window.google.maps.LatLng(latitude, longitude)
                    mapInstanceRef.current.setCenter(latLng)
                    markerInstanceRef.current.setPosition(latLng)

                    // Get address from coordinates (reverse geocoding)
                    const geocoder = new window.google.maps.Geocoder()
                    geocoder.geocode({ location: latLng }, (results, status) => {
                        if (status === "OK" && results[0]) {
                            const newLocation = {
                                lat: latitude,
                                lng: longitude,
                                address: results[0].formatted_address,
                            }
                            setSelectedLocation(newLocation)
                            setError(null)
                        } else {
                            const newLocation = {
                                lat: latitude,
                                lng: longitude,
                                address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
                            }
                            setSelectedLocation(newLocation)
                            setError(null)
                        }
                        setLoadingCurrentLocation(false)
                    })
                } else {
                    setLoadingCurrentLocation(false)
                }
            },
            (error) => {
                console.error("Error getting current location:", error)
                setError("Failed to get your current location. Please try again.")
                setLoadingCurrentLocation(false)
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
        )
    }

    // Handle location confirmation
    const handleConfirmLocation = () => {
        if (!selectedLocation) {
            setError("Please select a location first")
            return
        }

        // Validate coordinates
        if (
            typeof selectedLocation.lat !== "number" ||
            typeof selectedLocation.lng !== "number" ||
            isNaN(selectedLocation.lat) ||
            isNaN(selectedLocation.lng)
        ) {
            setError("Invalid location coordinates. Please try again.")
            return
        }

        // Log the location being returned
        console.log("Confirming location:", selectedLocation)

        // Call the callback with the selected location
        onLocationSelect(selectedLocation)
    }

    // Clear search input
    const clearSearch = () => {
        if (searchInputRef.current) {
            searchInputRef.current.value = ""
        }
    }

    return (
        <div className="space-y-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input ref={searchInputRef} placeholder={placeholder} className="pl-10 pr-10" />
                {searchInputRef.current?.value && (
                    <button
                        type="button"
                        onClick={clearSearch}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            <div className="relative" style={{ height }}>
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50 z-10">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                    </div>
                )}
                <div ref={mapRef} className="w-full h-full rounded-md overflow-hidden"></div>

                <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-3 right-3 bg-white shadow-md"
                    onClick={getCurrentLocation}
                    disabled={loadingCurrentLocation}
                >
                    {loadingCurrentLocation ? (
                        <div className="animate-spin h-4 w-4 border-2 border-orange-500 border-t-transparent rounded-full"></div>
                    ) : (
                        <Navigation className="h-4 w-4 mr-2" />
                    )}
                    {loadingCurrentLocation ? "Getting location..." : "Use my location"}
                </Button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            )}

            {selectedLocation && (
                <Card className="bg-gray-50 border-none">
                    <CardContent className="p-3">
                        <div className="flex items-start gap-2">
                            <MapPin className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                                <p className="font-medium text-sm">Selected Location</p>
                                <p className="text-sm text-gray-600 break-words">{selectedLocation.address}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Coordinates: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Button
                className="w-full bg-orange-500 hover:bg-orange-600"
                onClick={handleConfirmLocation}
                disabled={!selectedLocation}
            >
                {buttonText}
            </Button>
        </div>
    )
}

export default LocationPicker
