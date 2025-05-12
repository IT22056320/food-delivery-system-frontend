"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

const DeliveryMap = ({
  deliveryId,
  pickupLocation,
  deliveryLocation,
  currentLocation: initialCurrentLocation = null,
  isDeliveryPerson = false,
  className = "h-[300px] w-full",
}) => {
  const [map, setMap] = useState(null);
  const [directionsRenderer, setDirectionsRenderer] = useState(null);
  const [directionsService, setDirectionsService] = useState(null);
  const [restaurantMarker, setRestaurantMarker] = useState(null);
  const [customerMarker, setCustomerMarker] = useState(null);
  const [driverMarker, setDriverMarker] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [estimatedTime, setEstimatedTime] = useState(null);
  const [routeMode, setRouteMode] = useState("pickup"); // 'pickup' or 'delivery'
  const [currentLocation, setCurrentLocation] = useState(
    initialCurrentLocation
  );
  const mapRef = useRef(null);
  const locationUpdateInterval = useRef(null);
  const simulationInterval = useRef(null);
  const routePoints = useRef([]);
  const currentPointIndex = useRef(0);
  const originalEta = useRef(null);
  const [fallbackLocationUsed, setFallbackLocationUsed] = useState(false);

  // Add a function to use fallback location when geolocation fails
  const useFallbackLocation = useCallback(() => {
    setFallbackLocationUsed(true);
    // If we have pickup location, use a location near it
    if (pickupLocation && pickupLocation.coordinates) {
      const fallbackLat =
        Number.parseFloat(pickupLocation.coordinates.lat) + 0.01;
      const fallbackLng =
        Number.parseFloat(pickupLocation.coordinates.lng) + 0.01;

      setCurrentLocation({
        lat: fallbackLat,
        lng: fallbackLng,
      });

      console.log("Using fallback location near restaurant:", {
        lat: fallbackLat,
        lng: fallbackLng,
      });
      return;
    }

    // Default fallback to a location (this should be customized based on your service area)
    setCurrentLocation({
      lat: 6.9271, // Default to Colombo, Sri Lanka coordinates
      lng: 79.8612,
    });
    console.log("Using default fallback location");
  }, [pickupLocation]);

  // Initialize Google Maps
  useEffect(() => {
    const loadGoogleMaps = async () => {
      try {
        setIsLoading(true);

        // Check if Google Maps API is already loaded
        if (!window.google || !window.google.maps) {
          console.error("Google Maps API not loaded");
          toast.error("Failed to load maps. Please try again later.");
          setIsLoading(false);
          return;
        }

        // Create map instance
        const mapInstance = new window.google.maps.Map(mapRef.current, {
          zoom: 13,
          mapTypeControl: false,
          fullscreenControl: false,
          streetViewControl: false,
          zoomControl: true,
        });

        // Create directions service and renderer
        const directionsServiceInstance =
          new window.google.maps.DirectionsService();
        const directionsRendererInstance =
          new window.google.maps.DirectionsRenderer({
            map: mapInstance,
            suppressMarkers: true,
            polylineOptions: {
              strokeColor: "#FF5722",
              strokeWeight: 5,
              strokeOpacity: 0.7,
            },
          });

        // Create markers
        const restaurantMarkerInstance = new window.google.maps.Marker({
          map: mapInstance,
          icon: {
            url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
            scaledSize: new window.google.maps.Size(40, 40),
          },
        });

        const customerMarkerInstance = new window.google.maps.Marker({
          map: mapInstance,
          icon: {
            url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
            scaledSize: new window.google.maps.Size(40, 40),
          },
        });

        const driverMarkerInstance = new window.google.maps.Marker({
          map: mapInstance,
          icon: {
            url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
            scaledSize: new window.google.maps.Size(40, 40),
          },
          animation: window.google.maps.Animation.BOUNCE,
        });

        // Save instances
        setMap(mapInstance);
        setDirectionsService(directionsServiceInstance);
        setDirectionsRenderer(directionsRendererInstance);
        setRestaurantMarker(restaurantMarkerInstance);
        setCustomerMarker(customerMarkerInstance);
        setDriverMarker(driverMarkerInstance);
        setIsLoading(false);

        // Set initial marker positions
        let validCoordinatesFound = false;

        if (pickupLocation && pickupLocation.coordinates) {
          const restaurantLat =
            Number.parseFloat(pickupLocation.coordinates.lat) || 0;
          const restaurantLng =
            Number.parseFloat(pickupLocation.coordinates.lng) || 0;

          if (
            Math.abs(restaurantLat) > 0.001 ||
            Math.abs(restaurantLng) > 0.001
          ) {
            const restaurantLatLng = { lat: restaurantLat, lng: restaurantLng };
            restaurantMarkerInstance.setPosition(restaurantLatLng);
            validCoordinatesFound = true;

            // Add info window for restaurant
            const restaurantInfoWindow = new window.google.maps.InfoWindow({
              content: `<div style="font-weight: bold;">${
                pickupLocation.address || "Restaurant"
              }</div>`,
            });

            restaurantMarkerInstance.addListener("click", () => {
              restaurantInfoWindow.open(mapInstance, restaurantMarkerInstance);
            });
          } else {
            console.warn(
              "Invalid restaurant coordinates:",
              pickupLocation.coordinates
            );
          }
        }

        if (deliveryLocation && deliveryLocation.coordinates) {
          const customerLat =
            Number.parseFloat(deliveryLocation.coordinates.lat) || 0;
          const customerLng =
            Number.parseFloat(deliveryLocation.coordinates.lng) || 0;

          if (Math.abs(customerLat) > 0.001 || Math.abs(customerLng) > 0.001) {
            const customerLatLng = { lat: customerLat, lng: customerLng };
            customerMarkerInstance.setPosition(customerLatLng);
            validCoordinatesFound = true;

            // Add info window for customer
            const customerInfoWindow = new window.google.maps.InfoWindow({
              content: `<div style="font-weight: bold;">${
                deliveryLocation.address || "Customer"
              }</div>`,
            });

            customerMarkerInstance.addListener("click", () => {
              customerInfoWindow.open(mapInstance, customerMarkerInstance);
            });
          } else {
            console.warn(
              "Invalid customer coordinates:",
              deliveryLocation.coordinates
            );
          }
        }

        // Set bounds to include both markers
        if (validCoordinatesFound) {
          const bounds = new window.google.maps.LatLngBounds();

          if (pickupLocation && pickupLocation.coordinates) {
            const lat = Number.parseFloat(pickupLocation.coordinates.lat) || 0;
            const lng = Number.parseFloat(pickupLocation.coordinates.lng) || 0;

            if (Math.abs(lat) > 0.001 || Math.abs(lng) > 0.001) {
              bounds.extend({ lat, lng });
            }
          }

          if (deliveryLocation && deliveryLocation.coordinates) {
            const lat =
              Number.parseFloat(deliveryLocation.coordinates.lat) || 0;
            const lng =
              Number.parseFloat(deliveryLocation.coordinates.lng) || 0;

            if (Math.abs(lat) > 0.001 || Math.abs(lng) > 0.001) {
              bounds.extend({ lat, lng });
            }
          }

          if (!bounds.isEmpty()) {
            mapInstance.fitBounds(bounds);
          } else {
            // Default center if no valid bounds
            mapInstance.setCenter({ lat: 6.9271, lng: 79.8612 }); // Colombo, Sri Lanka
          }
        } else {
          // Default center if no valid coordinates
          mapInstance.setCenter({ lat: 6.9271, lng: 79.8612 }); // Colombo, Sri Lanka
        }
      } catch (error) {
        console.error("Error initializing Google Maps:", error);
        toast.error("Failed to load maps. Please try again later.");
        setIsLoading(false);
      }
    };

    loadGoogleMaps();

    return () => {
      // Clean up intervals on unmount
      if (locationUpdateInterval.current) {
        clearInterval(locationUpdateInterval.current);
      }
      if (simulationInterval.current) {
        clearInterval(simulationInterval.current);
      }
    };
  }, [pickupLocation, deliveryLocation, useFallbackLocation]);

  // Update driver location and calculate route
  useEffect(() => {
    if (!map || !driverMarker || !directionsService || !directionsRenderer)
      return;

    // If current location is provided, update driver marker
    if (currentLocation) {
      const driverLatLng = {
        lat: Number.parseFloat(currentLocation.lat) || 0,
        lng: Number.parseFloat(currentLocation.lng) || 0,
      };
      driverMarker.setPosition(driverLatLng);
      driverMarker.setVisible(true);

      // Calculate and display route based on the current mode
      calculateRoute(driverLatLng);

      // If we're the delivery person, update our location on the server
      if (isDeliveryPerson && deliveryId) {
        updateDeliveryPersonLocation(driverLatLng);
      }
    } else if (!isDeliveryPerson && deliveryId) {
      // If we're the customer, fetch delivery person's location
      startLocationTrackingCustomer();
    } else {
      driverMarker.setVisible(false);

      // If no driver location, just show route between restaurant and customer
      calculateRestaurantToCustomerRoute();
    }
  }, [
    currentLocation,
    map,
    driverMarker,
    directionsService,
    directionsRenderer,
    routeMode,
    isDeliveryPerson,
    deliveryId,
  ]);

  // Calculate route based on current mode
  const calculateRoute = (driverLocation) => {
    if (!directionsService || !directionsRenderer || !driverLocation) return;

    // For pickup mode, route is from driver to restaurant
    // For delivery mode, route is from driver to customer
    const origin = driverLocation;

    let destination;
    if (routeMode === "pickup") {
      // Route to restaurant
      if (!pickupLocation || !pickupLocation.coordinates) return;

      destination = {
        lat: Number.parseFloat(pickupLocation.coordinates.lat) || 0,
        lng: Number.parseFloat(pickupLocation.coordinates.lng) || 0,
      };

      // Check if we're close to the restaurant, switch to delivery mode
      const distance = calculateDistance(origin, destination);
      if (distance < 0.1) {
        // Less than 100 meters
        setRouteMode("delivery");
        return;
      }
    } else {
      // Route to customer
      if (!deliveryLocation || !deliveryLocation.coordinates) return;

      destination = {
        lat: Number.parseFloat(deliveryLocation.coordinates.lat) || 0,
        lng: Number.parseFloat(deliveryLocation.coordinates.lng) || 0,
      };
    }

    // Validate coordinates to prevent ZERO_RESULTS
    if (Math.abs(origin.lat) < 0.001 && Math.abs(origin.lng) < 0.001) {
      console.warn("Invalid origin coordinates, using fallback");
      // Use a fallback location near the destination
      origin.lat = destination.lat + 0.01;
      origin.lng = destination.lng + 0.01;
    }

    if (
      Math.abs(destination.lat) < 0.001 &&
      Math.abs(destination.lng) < 0.001
    ) {
      console.warn("Invalid destination coordinates, cannot calculate route");
      return;
    }

    console.log("Calculating route from", origin, "to", destination);

    directionsService.route(
      {
        origin,
        destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === "OK") {
          directionsRenderer.setDirections(result);

          // Extract estimated time
          if (
            result.routes &&
            result.routes[0] &&
            result.routes[0].legs &&
            result.routes[0].legs[0]
          ) {
            setEstimatedTime(result.routes[0].legs[0].duration.text);

            // Store route points for simulation
            if (!isDeliveryPerson && !locationUpdateInterval.current) {
              const path = result.routes[0].overview_path;
              routePoints.current = path.map((point) => ({
                lat: point.lat(),
                lng: point.lng(),
              }));

              // Store original ETA in minutes
              originalEta.current =
                result.routes[0].legs[0].duration.value / 60;

              // Start simulation if we have route points
              if (routePoints.current.length > 0) {
                startSimulation();
              }
            }
          }
        } else {
          console.error("Directions request failed:", status);

          // If we get ZERO_RESULTS, try to show a straight line between points
          if (status === "ZERO_RESULTS") {
            console.log("Falling back to straight line path");
            showStraightLinePath(origin, destination);
          }

          // Set a default estimated time
          setEstimatedTime("~30 min");
        }
      }
    );
  };

  // Add a new function to show a straight line path when directions fail
  const showStraightLinePath = (origin, destination) => {
    if (!map) return;

    // Clear existing directions
    directionsRenderer.setDirections({ routes: [] });

    // Create a polyline for a straight path
    const straightPath = new window.google.maps.Polyline({
      path: [origin, destination],
      geodesic: true,
      strokeColor: "#FF5722",
      strokeOpacity: 0.7,
      strokeWeight: 3,
      map: map,
    });

    // Store for cleanup
    return straightPath;
  };

  // Calculate route between restaurant and customer
  const calculateRestaurantToCustomerRoute = () => {
    if (
      !directionsService ||
      !directionsRenderer ||
      !pickupLocation ||
      !deliveryLocation
    )
      return;

    const origin = pickupLocation.coordinates
      ? {
          lat: Number.parseFloat(pickupLocation.coordinates.lat) || 0,
          lng: Number.parseFloat(pickupLocation.coordinates.lng) || 0,
        }
      : null;

    const destination = deliveryLocation.coordinates
      ? {
          lat: Number.parseFloat(deliveryLocation.coordinates.lat) || 0,
          lng: Number.parseFloat(deliveryLocation.coordinates.lng) || 0,
        }
      : null;

    if (!origin || !destination) return;

    directionsService.route(
      {
        origin,
        destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === "OK") {
          directionsRenderer.setDirections(result);

          // Extract estimated time and route points for simulation
          if (
            result.routes &&
            result.routes[0] &&
            result.routes[0].legs &&
            result.routes[0].legs[0]
          ) {
            setEstimatedTime(result.routes[0].legs[0].duration.text);

            // Store route points for simulation
            const path = result.routes[0].overview_path;
            routePoints.current = path.map((point) => ({
              lat: point.lat(),
              lng: point.lng(),
            }));

            // Store original ETA in minutes
            originalEta.current = result.routes[0].legs[0].duration.value / 60;

            // Start simulation if we have route points
            if (routePoints.current.length > 0) {
              startSimulation();
            }
          }
        } else {
          console.error("Directions request failed:", status);
        }
      }
    );
  };

  // Start simulation of delivery person moving along the route
  const startSimulation = () => {
    // Clear any existing simulation
    if (simulationInterval.current) {
      clearInterval(simulationInterval.current);
    }

    // Reset index
    currentPointIndex.current = 0;

    // Set driver marker at starting position
    if (driverMarker && routePoints.current.length > 0) {
      driverMarker.setPosition(routePoints.current[0]);
      driverMarker.setVisible(true);
    }

    // Update position every 2 seconds
    simulationInterval.current = setInterval(() => {
      // Move to next point
      currentPointIndex.current += 1;

      // If we reached the end, stop simulation
      if (currentPointIndex.current >= routePoints.current.length) {
        clearInterval(simulationInterval.current);
        return;
      }

      // Update driver position
      if (driverMarker) {
        const newPosition = routePoints.current[currentPointIndex.current];
        driverMarker.setPosition(newPosition);

        // Update estimated time based on progress
        if (originalEta.current) {
          const progress =
            currentPointIndex.current / routePoints.current.length;
          const remainingMinutes = Math.round(
            originalEta.current * (1 - progress)
          );

          if (remainingMinutes <= 1) {
            setEstimatedTime("1 min");
          } else {
            setEstimatedTime(`${remainingMinutes} mins`);
          }
        }
      }
    }, 2000);
  };

  // Calculate distance between two points in km
  const calculateDistance = (point1, point2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(point2.lat - point1.lat);
    const dLng = deg2rad(point2.lng - point1.lng);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(point1.lat)) *
        Math.cos(deg2rad(point2.lat)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
  };

  // Update delivery person's location on the server
  const updateDeliveryPersonLocation = async (location) => {
    try {
      await fetch(
        `http://localhost:5003/api/deliveries/${deliveryId}/location`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            lat: location.lat,
            lng: location.lng,
          }),
        }
      );
    } catch (error) {
      console.error("Error updating location:", error);
    }
  };

  // Start tracking delivery person's location
  const startLocationTracking = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      useFallbackLocation();
      return;
    }

    // Get current position once
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({
          lat: latitude,
          lng: longitude,
        });
      },
      (error) => {
        console.error("Error getting location:", error);
        toast.error(
          "Using approximate location. Enable location services for better accuracy."
        );
        useFallbackLocation();
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );

    // Set up continuous tracking
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({
          lat: latitude,
          lng: longitude,
        });

        // If there's a selected delivery, update its location on the server
        if (isDeliveryPerson && deliveryId) {
          updateDeliveryLocation(deliveryId, latitude, longitude);
        }
      },
      (error) => {
        console.error("Error tracking location:", error);
        // Don't show repeated errors for watchPosition
        if (!currentLocation && !fallbackLocationUsed) {
          useFallbackLocation();
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      }
    );

    // Clean up on component unmount
    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  };

  // Update the updateDeliveryLocation function to properly update location on the server
  const updateDeliveryLocation = async (deliveryId, lat, lng) => {
    try {
      await fetch(
        `http://localhost:5003/api/deliveries/${deliveryId}/location`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ lat, lng }),
        }
      );
    } catch (error) {
      console.error("Error updating location:", error);
    }
  };

  // Update the startLocationTracking function for customers to properly fetch delivery person's location
  const startLocationTrackingCustomer = () => {
    // Clear any existing interval
    if (locationUpdateInterval.current) {
      clearInterval(locationUpdateInterval.current);
    }

    // Set up polling to fetch delivery person's location
    const fetchDeliveryPersonLocation = async () => {
      try {
        const response = await fetch(
          `http://localhost:5003/api/deliveries/${deliveryId}/location`,
          {
            credentials: "include",
          }
        );

        if (response.ok) {
          const data = await response.json();

          if (data && data.currentLocation) {
            const driverLatLng = {
              lat: Number.parseFloat(data.currentLocation.lat) || 0,
              lng: Number.parseFloat(data.currentLocation.lng) || 0,
            };

            if (driverMarker) {
              driverMarker.setPosition(driverLatLng);
              driverMarker.setVisible(true);

              // Calculate route based on delivery status
              if (data.status === "PICKED_UP" || data.status === "IN_TRANSIT") {
                setRouteMode("delivery");
              } else {
                setRouteMode("pickup");
              }

              calculateRoute(driverLatLng);
            }

            // Update estimated time if we have the driver's location
            if (data.estimatedArrivalTime) {
              setEstimatedTime(data.estimatedArrivalTime);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching delivery person location:", error);
      }
    };

    // Fetch immediately and then set interval
    fetchDeliveryPersonLocation();
    locationUpdateInterval.current = setInterval(
      fetchDeliveryPersonLocation,
      10000
    ); // Every 10 seconds
  };

  useEffect(() => {
    if (isDeliveryPerson) {
      startLocationTracking();
    } else if (deliveryId) {
      startLocationTrackingCustomer();
    }
  }, [isDeliveryPerson, deliveryId, useFallbackLocation]);

  // Toggle between pickup and delivery routes
  const toggleRouteMode = () => {
    setRouteMode((prev) => (prev === "pickup" ? "delivery" : "pickup"));
  };

  return (
    <div className={className}>
      <div className="relative w-full h-full">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50 z-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        )}
        <div
          ref={mapRef}
          className="w-full h-full rounded-md overflow-hidden"
        ></div>

        {estimatedTime && (
          <Card className="absolute bottom-3 left-3 bg-white shadow-md border-none">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="text-sm">
                  <span className="font-medium">ETA: </span>
                  <span>{estimatedTime}</span>
                </div>
                {isDeliveryPerson && (
                  <button
                    className="text-xs bg-gray-100 px-2 py-1 rounded hover:bg-gray-200"
                    onClick={toggleRouteMode}
                  >
                    {routeMode === "pickup" ? "To Restaurant" : "To Customer"}
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DeliveryMap;
