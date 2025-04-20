"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { io } from "socket.io-client"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import "leaflet-routing-machine"
import { updateLocation } from "@/lib/delivery-api"
import { toast } from "sonner"

// Fix Leaflet icon issues
const fixLeafletIcon = () => {
    delete L.Icon.Default.prototype._getIconUrl
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    })
}

// Custom delivery icon
const createDeliveryIcon = () => {
    return L.divIcon({
        html: `<div class="delivery-marker">
             <div class="delivery-marker-icon">
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                 <path d="M8.965 18a3.5 3.5 0 0 1-6.93 0H1V6a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2h3l3 4.056V18h-2.035a3.5 3.5 0 0 1-6.93 0h-5.07zM15 7H3v8.05a3.5 3.5 0 0 1 5.663.95h5.674c.168-.353.393-.674.663-.95V7zm2 8h4v-3.5L18.5 8H17v7zm-7.5 4a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm12 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/>
               </svg>
             </div>
             <div class="delivery-marker-pulse"></div>
           </div>`,
        className: "",
        iconSize: [36, 36],
        iconAnchor: [18, 18],
    })
}

export default function DeliveryMap({
    deliveryId,
    pickupLocation,
    deliveryLocation,
    isDeliveryPerson = false,
    onLocationUpdate = () => { },
    className = "",
}) {
    const mapRef = useRef(null)
    const mapInstanceRef = useRef(null)
    const socketRef = useRef(null)
    const markerRef = useRef(null)
    const routingControlRef = useRef(null)
    const watchIdRef = useRef(null)

    const [currentLocation, setCurrentLocation] = useState(null)
    const [isMapReady, setIsMapReady] = useState(false)
    const [isSocketConnected, setIsSocketConnected] = useState(false)

    // Initialize map
    useEffect(() => {
        if (!mapRef.current) return

        // Fix Leaflet icon issues
        fixLeafletIcon()

        // Create map instance
        const map = L.map(mapRef.current, {
            center: [6.9271, 79.8612], // Default to Colombo, Sri Lanka
            zoom: 13,
            layers: [
                L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                }),
            ],
        })

        // Save map instance
        mapInstanceRef.current = map

        // Set map as ready
        setIsMapReady(true)

        // Cleanup
        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove()
                mapInstanceRef.current = null
            }
        }
    }, [])

    // Initialize Socket.io connection
    useEffect(() => {
        if (!deliveryId) return

        // Get token from localStorage or cookies
        const token =
            localStorage.getItem("token") || document.cookie.replace(/(?:(?:^|.*;\s*)token\s*=\s*([^;]*).*$)|^.*$/, "$1")

        // Create socket connection
        const socket = io(process.env.NEXT_PUBLIC_DELIVERY_SERVICE_URL || "http://localhost:5003", {
            auth: { token },
            query: { token },
        })

        // Socket event handlers
        socket.on("connect", () => {
            console.log("Socket connected")
            setIsSocketConnected(true)

            // Join delivery tracking room
            socket.emit("trackDelivery", deliveryId)
        })

        socket.on("disconnect", () => {
            console.log("Socket disconnected")
            setIsSocketConnected(false)
        })

        socket.on("locationUpdate", (data) => {
            if (data.deliveryId === deliveryId) {
                updateDeliveryMarker(data.location, data.heading)
            }
        })

        socket.on("connect_error", (error) => {
            console.error("Socket connection error:", error)
            toast.error("Failed to connect to tracking service")
        })

        // Save socket reference
        socketRef.current = socket

        // Cleanup
        return () => {
            if (socketRef.current) {
                socketRef.current.emit("stopTracking", deliveryId)
                socketRef.current.disconnect()
                socketRef.current = null
            }
        }
    }, [deliveryId])

    // Watch current location if delivery person
    useEffect(() => {
        if (!isDeliveryPerson || !isMapReady) return

        // Start watching position
        const id = navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude, heading, speed } = position.coords
                const newLocation = { lat: latitude, lng: longitude }

                setCurrentLocation(newLocation)

                // Update location in the backend
                updateLocation(latitude, longitude, null, heading, speed)
                    .then(() => {
                        onLocationUpdate(newLocation)
                        updateDeliveryMarker(newLocation, heading)
                    })
                    .catch((error) => {
                        console.error("Failed to update location:", error)
                    })
            },
            (error) => {
                console.error("Geolocation error:", error)
                toast.error("Unable to access your location. Please enable location services.")
            },
            {
                enableHighAccuracy: true,
                maximumAge: 10000,
                timeout: 5000,
            },
        )

        watchIdRef.current = id

        // Cleanup
        return () => {
            if (watchIdRef.current) {
                navigator.geolocation.clearWatch(watchIdRef.current)
                watchIdRef.current = null
            }
        }
    }, [isDeliveryPerson, isMapReady, onLocationUpdate])

    // Update delivery marker position
    const updateDeliveryMarker = useCallback((location, heading = 0) => {
        if (!mapInstanceRef.current) return

        const { lat, lng } = location

        // Create or update marker
        if (!markerRef.current) {
            // Create new marker
            markerRef.current = L.marker([lat, lng], {
                icon: createDeliveryIcon(),
            }).addTo(mapInstanceRef.current)
        } else {
            // Update existing marker
            markerRef.current.setLatLng([lat, lng])
        }

        // Rotate marker based on heading if needed
        if (markerRef.current.getElement()) {
            const iconElement = markerRef.current.getElement().querySelector(".delivery-marker-icon")
            if (iconElement) {
                iconElement.style.transform = `rotate(${heading}deg)`
            }
        }

        // Center map on marker
        mapInstanceRef.current.panTo([lat, lng])
    }, [])

    // Calculate and display route
    useEffect(() => {
        if (!isMapReady || !mapInstanceRef.current || !pickupLocation || !deliveryLocation) return

        // Clear existing routing control
        if (routingControlRef.current) {
            mapInstanceRef.current.removeControl(routingControlRef.current)
            routingControlRef.current = null
        }

        // Get coordinates
        const pickupCoords = pickupLocation.coordinates
            ? [pickupLocation.coordinates.lat, pickupLocation.coordinates.lng]
            : null

        const deliveryCoords = deliveryLocation.coordinates
            ? [deliveryLocation.coordinates.lat, deliveryLocation.coordinates.lng]
            : null

        // If we don't have coordinates, try geocoding the addresses
        if (!pickupCoords || !deliveryCoords) {
            // For simplicity, we'll just show markers at default positions
            // In a real app, you would use a geocoding service
            console.warn("Missing coordinates for routing")
            return
        }

        // Create waypoints
        const waypoints = [L.latLng(pickupCoords), L.latLng(deliveryCoords)]

        // Add current location as waypoint if available
        if (currentLocation) {
            waypoints.splice(1, 0, L.latLng(currentLocation.lat, currentLocation.lng))
        }

        // Create routing control
        routingControlRef.current = L.Routing.control({
            waypoints,
            routeWhileDragging: false,
            showAlternatives: false,
            fitSelectedRoutes: true,
            lineOptions: {
                styles: [
                    { color: "#6366F1", opacity: 0.8, weight: 6 },
                    { color: "#818CF8", opacity: 0.9, weight: 4 },
                ],
            },
            createMarker: (i, waypoint, n) => {
                // Custom markers for pickup and delivery
                if (i === 0) {
                    return L.marker(waypoint.latLng, {
                        icon: L.divIcon({
                            html: `<div class="pickup-marker">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#10B981" width="24" height="24">
                        <path d="M18.364 17.364L12 23.728l-6.364-6.364a9 9 0 1 1 12.728 0zM12 15a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm0-2a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"/>
                      </svg>
                    </div>`,
                            className: "",
                            iconSize: [24, 24],
                            iconAnchor: [12, 24],
                        }),
                    }).bindPopup("Pickup Location")
                } else if (i === n - 1) {
                    return L.marker(waypoint.latLng, {
                        icon: L.divIcon({
                            html: `<div class="delivery-marker">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#EF4444" width="24" height="24">
                        <path d="M18.364 17.364L12 23.728l-6.364-6.364a9 9 0 1 1 12.728 0zM12 15a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm0-2a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"/>
                      </svg>
                    </div>`,
                            className: "",
                            iconSize: [24, 24],
                            iconAnchor: [12, 24],
                        }),
                    }).bindPopup("Delivery Location")
                } else {
                    // Don't create a marker for current location, we'll use our custom one
                    return null
                }
            },
        }).addTo(mapInstanceRef.current)

        // Hide the itinerary
        routingControlRef.current.on("routesfound", () => {
            const container = document.querySelector(".leaflet-routing-container")
            if (container) {
                container.style.display = "none"
            }
        })

        // Cleanup
        return () => {
            if (routingControlRef.current && mapInstanceRef.current) {
                mapInstanceRef.current.removeControl(routingControlRef.current)
                routingControlRef.current = null
            }
        }
    }, [isMapReady, pickupLocation, deliveryLocation, currentLocation])

    return (
        <div className={`${className} relative rounded-lg overflow-hidden border border-gray-200`}>
            <div ref={mapRef} className="w-full h-full min-h-[300px]" />

            {/* Connection status indicator */}
            <div className="absolute bottom-2 right-2 z-[1000] flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-md text-xs">
                <div className={`w-2 h-2 rounded-full ${isSocketConnected ? "bg-green-500" : "bg-red-500"}`}></div>
                <span>{isSocketConnected ? "Live Tracking" : "Connecting..."}</span>
            </div>

            {/* Add custom CSS for markers */}
            <style jsx global>{`
        .delivery-marker {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .delivery-marker-icon {
          width: 36px;
          height: 36px;
          background-color: #3B82F6;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          z-index: 1;
          transition: transform 0.3s ease;
        }
        
        .delivery-marker-pulse {
          position: absolute;
          width: 50px;
          height: 50px;
          background-color: rgba(59, 130, 246, 0.4);
          border-radius: 50%;
          z-index: 0;
          animation: pulse 1.5s infinite;
        }
        
        @keyframes pulse {
          0% {
            transform: scale(0.5);
            opacity: 1;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }
        
        .pickup-marker, .delivery-marker {
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
        </div>
    )
}
