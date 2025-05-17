"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useFavorites } from "@/hooks/use-favorites";
import { motion } from "framer-motion";
import {
  Pizza,
  Home,
  ShoppingBag,
  Heart,
  User,
  Bell,
  Search,
  ChevronRight,
  Star,
  Clock,
  LogOut,
  Utensils,
  Package,
  ChevronDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function UserDashboard() {
  const { user, loading, logout } = useAuth();
  const { getFavoritesCount, getFavoritesByType } = useFavorites();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isLoading, setIsLoading] = useState(true);
  const [restaurants, setRestaurants] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [popularItems, setPopularItems] = useState([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAllRestaurants, setShowAllRestaurants] = useState(false);
  const router = useRouter();

  // Fetch data from APIs
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        console.log("Fetching restaurants");
        const response = await fetch("http://localhost:5001/api/restaurants", {
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          // Filter only verified and available restaurants
          const availableRestaurants = data.filter(
            (restaurant) => restaurant.isVerified && restaurant.isAvailable
          );
          setRestaurants(availableRestaurants);
          return availableRestaurants;
        } else {
          console.error("Failed to fetch restaurants:", await response.text());
          return [];
        }
      } catch (error) {
        console.error("Error fetching restaurants:", error);
        return [];
      }
    };

    // Fetch all orders to get total count and recent ones
    const fetchOrders = async (restaurantsList) => {
      try {
        console.log("Fetching orders from http://localhost:5002/api/orders");
        const response = await fetch("http://localhost:5002/api/orders", {
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setTotalOrders(data.length);

          // Sort by date (newest first) and take the most recent 2
          const sortedOrders = [...data].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );

          // Get restaurant details for each order
          const recentOrdersData = await Promise.all(
            sortedOrders.slice(0, 2).map(async (order) => {
              // Find restaurant details from our restaurants list
              let restaurantDetails = restaurantsList.find(
                (r) => r._id === order.restaurant_id
              );

              // If not found in our list, try to fetch it
              if (!restaurantDetails && order.restaurant_id) {
                try {
                  const restaurantResponse = await fetch(
                    `http://localhost:5001/api/restaurants/${order.restaurant_id}`,
                    {
                      credentials: "include",
                    }
                  );
                  if (restaurantResponse.ok) {
                    restaurantDetails = await restaurantResponse.json();
                  }
                } catch (err) {
                  console.error("Error fetching restaurant details:", err);
                }
              }

              // Get the first menu item image if available
              let itemImage = null;
              if (
                order.items &&
                order.items.length > 0 &&
                order.items[0].menu_item_id
              ) {
                try {
                  const menuItemResponse = await fetch(
                    `http://localhost:5001/api/menu-items/${order.items[0].menu_item_id}`,
                    {
                      credentials: "include",
                    }
                  );
                  if (menuItemResponse.ok) {
                    const menuItem = await menuItemResponse.json();
                    itemImage = menuItem.image;
                  }
                } catch (err) {
                  console.error("Error fetching menu item details:", err);
                }
              }

              return {
                id: order._id,
                restaurant:
                  restaurantDetails?.name ||
                  order.restaurant_name ||
                  "Unknown Restaurant",
                restaurantId: order.restaurant_id,
                items: order.items?.length || 0,
                total: order.total_price || 0,
                status:
                  order.order_status === "DELIVERED"
                    ? "Delivered"
                    : order.order_status === "OUT_FOR_DELIVERY"
                    ? "On the way"
                    : order.order_status,
                date: new Date(order.createdAt).toLocaleString(),
                // Use menu item image, then restaurant image, then fallback
                image:
                  itemImage ||
                  restaurantDetails?.image ||
                  `/placeholder.svg?height=100&width=100&query=${encodeURIComponent(
                    restaurantDetails?.name || "food order"
                  )}`,
              };
            })
          );

          setRecentOrders(recentOrdersData);
        } else {
          console.error("Failed to fetch orders:", await response.text());
          // If API fails, set empty array
          setRecentOrders([]);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
        // If API fails, set empty array
        setRecentOrders([]);
      }
    };

    // Fetch popular menu items from all restaurants
    const fetchPopularItems = async () => {
      try {
        // First get all restaurants
        const restaurantsResponse = await fetch(
          "http://localhost:5001/api/restaurants",
          {
            credentials: "include",
          }
        );

        if (!restaurantsResponse.ok) {
          throw new Error("Failed to fetch restaurants");
        }

        const restaurantsData = await restaurantsResponse.json();
        const verifiedRestaurants = restaurantsData.filter(
          (r) => r.isVerified && r.isAvailable
        );

        // For each restaurant, fetch menu items
        const menuItemsPromises = verifiedRestaurants
          .slice(0, 3)
          .map((restaurant) =>
            fetch(
              `http://localhost:5001/api/menu-items/restaurant/${restaurant._id}`,
              {
                credentials: "include",
              }
            )
              .then((res) => (res.ok ? res.json() : []))
              .then((items) =>
                items.map((item) => ({
                  ...item,
                  restaurant: restaurant.name,
                  restaurantId: restaurant._id,
                }))
              )
              .catch(() => [])
          );

        const allMenuItemsArrays = await Promise.all(menuItemsPromises);

        // Flatten and get unique items
        const allMenuItems = allMenuItemsArrays.flat();

        // Sort by rating or price and take top 4
        const sortedItems = allMenuItems
          .filter((item) => item.isAvailable !== false)
          .sort((a, b) => (b.rating || 4.5) - (a.rating || 4.5))
          .slice(0, 4);

        const formattedItems = sortedItems.map((item) => ({
          id: item._id,
          name: item.name,
          restaurant: item.restaurant,
          restaurantId: item.restaurantId,
          price: item.price,
          rating: item.rating || 4.5,
          image:
            item.image ||
            `/placeholder.svg?height=100&width=100&query=${encodeURIComponent(
              item.name
            )}`,
        }));

        setPopularItems(formattedItems);
      } catch (error) {
        console.error("Error fetching popular items:", error);
        setPopularItems([]);
      }
    };

    if (!loading) {
      // First fetch restaurants, then use that data for orders
      fetchRestaurants()
        .then((restaurantsList) => {
          return Promise.all([
            fetchOrders(restaurantsList),
            fetchPopularItems(),
          ]);
        })
        .then(() => setIsLoading(false))
        .catch(() => setIsLoading(false));
    }
  }, [loading]);

  // Filter restaurants based on search query
  const filteredRestaurants = restaurants.filter(
    (restaurant) =>
      restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (restaurant.description &&
        restaurant.description
          .toLowerCase()
          .includes(searchQuery.toLowerCase())) ||
      (restaurant.cuisine &&
        restaurant.cuisine.some((c) =>
          c.toLowerCase().includes(searchQuery.toLowerCase())
        ))
  );

  // Limit displayed restaurants to 6 unless "Show More" is clicked
  const displayedRestaurants = showAllRestaurants
    ? filteredRestaurants
    : filteredRestaurants.slice(0, 6);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:5000/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      logout();
      router.push("/login");
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed. Please try again.");
    }
  };

  const viewRestaurant = (restaurantId) => {
    router.push(`/dashboard/user/restaurants/${restaurantId}`);
  };

  const viewOrder = (orderId) => {
    router.push(`/dashboard/user/orders/${orderId}`);
  };

  const viewAllMenuItems = () => {
    router.push(`/dashboard/user/menu-items`);
  };

  const viewMenuItem = (restaurantId) => {
    router.push(`/dashboard/user/restaurants/${restaurantId}`);
  };

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
          <p className="text-gray-500 text-sm mb-4">
            Welcome to your food dashboard
          </p>

          <nav className="space-y-1">
            <Button
              variant={activeTab === "dashboard" ? "default" : "ghost"}
              className={`w-full justify-start ${
                activeTab === "dashboard"
                  ? "bg-orange-500 hover:bg-orange-600"
                  : ""
              }`}
              onClick={() => {
                setActiveTab("dashboard");
                router.push("/dashboard/user");
              }}
            >
              <Home className="mr-2 h-5 w-5" />
              Dashboard
            </Button>

            <Button
              variant={activeTab === "orders" ? "default" : "ghost"}
              className={`w-full justify-start ${
                activeTab === "orders"
                  ? "bg-orange-500 hover:bg-orange-600"
                  : ""
              }`}
              onClick={() => {
                setActiveTab("orders");
                router.push("/dashboard/user/orders");
              }}
            >
              <ShoppingBag className="mr-2 h-5 w-5" />
              My Orders
            </Button>

            <Button
              variant={activeTab === "favorites" ? "default" : "ghost"}
              className={`w-full justify-start ${
                activeTab === "favorites"
                  ? "bg-orange-500 hover:bg-orange-600"
                  : ""
              }`}
              onClick={() => {
                setActiveTab("favorites");
                router.push("/dashboard/user/favorites");
              }}
            >
              <Heart className="mr-2 h-5 w-5" />
              Favorites
              {getFavoritesCount() > 0 && (
                <Badge className="ml-auto bg-orange-200 text-orange-700">
                  {getFavoritesCount()}
                </Badge>
              )}
            </Button>

            <Button
              variant={activeTab === "profile" ? "default" : "ghost"}
              className={`w-full justify-start ${
                activeTab === "profile"
                  ? "bg-orange-500 hover:bg-orange-600"
                  : ""
              }`}
              onClick={() => {
                setActiveTab("profile");
                router.push("/dashboard/user/profile");
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
          <Button
            onClick={() => router.push("/dashboard/user/orders")}
            className="w-full flex items-center justify-center gap-2 mt-4"
          >
            <Package className="h-5 w-5" />
            View Orders
          </Button>
        </div>

        <div className="p-4 mt-auto">
          <Card className="bg-orange-500 text-white border-none shadow-md">
            <CardContent className="p-4">
              <div className="flex flex-col items-center gap-2">
                <Pizza className="h-8 w-8" />
                <p className="text-sm font-medium">Get 50% off</p>
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-white text-orange-500 hover:bg-orange-50 w-full"
                >
                  Order Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">
              {isLoading ? (
                <div className="h-8 w-40 bg-gray-200 animate-pulse rounded"></div>
              ) : (
                <motion.span
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  Hello, {user?.name || "Guest"}
                </motion.span>
              )}
            </h1>
            <p className="text-gray-500">Welcome to your food dashboard</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search for food..."
                className="pl-10 w-[300px] bg-white border-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Button size="icon" variant="outline" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-orange-500 rounded-full text-[10px] text-white flex items-center justify-center">
                {recentOrders.length}
              </span>
            </Button>

            <Avatar>
              <AvatarImage src="/diverse-avatars.png" />
              <AvatarFallback className="bg-orange-200 text-orange-700">
                {user?.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Main Content */}
        <motion.div
          variants={container}
          initial="hidden"
          animate={isLoading ? "hidden" : "show"}
          className="flex flex-col gap-6"
        >
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-500 text-sm">Total Orders</p>
                    <h3 className="text-2xl font-bold mt-1">{totalOrders}</h3>
                  </div>
                  <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <ShoppingBag className="h-6 w-6 text-orange-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-500 text-sm">Favorites</p>
                    <h3 className="text-2xl font-bold mt-1">
                      {getFavoritesCount()}
                    </h3>
                  </div>
                  <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                    <Heart className="h-6 w-6 text-red-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-500 text-sm">
                      Available Restaurants
                    </p>
                    <h3 className="text-2xl font-bold mt-1">
                      {restaurants.length}
                    </h3>
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Utensils className="h-6 w-6 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Restaurants Section */}
          <Card className="border-none shadow-md">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle>Restaurants</CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search restaurants..."
                    className="pl-10 w-[250px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className="h-48 bg-gray-200 animate-pulse rounded-lg"
                    ></div>
                  ))}
                </div>
              ) : displayedRestaurants.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {displayedRestaurants.map((restaurant) => (
                      <motion.div
                        key={restaurant._id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ y: -5 }}
                        className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer"
                        onClick={() => viewRestaurant(restaurant._id)}
                      >
                        <div className="h-32 bg-gray-100 relative">
                          <img
                            src={
                              restaurant.image ||
                              `/placeholder.svg?height=200&width=400&query=${
                                encodeURIComponent(restaurant.name) ||
                                "restaurant"
                              }`
                            }
                            alt={restaurant.name}
                            className="w-full h-full object-cover"
                          />
                          {restaurant.cuisine &&
                            restaurant.cuisine.length > 0 && (
                              <Badge className="absolute top-2 right-2 bg-white text-orange-500">
                                {restaurant.cuisine[0]}
                              </Badge>
                            )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-bold text-lg mb-1">
                            {restaurant.name}
                          </h3>
                          <p className="text-sm text-gray-500 line-clamp-1 mb-2">
                            {restaurant.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                              <span className="text-sm font-medium">
                                {restaurant.rating || "New"}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <Clock className="h-3 w-3" />
                              <span>15-30 min</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Show More / Show Less Button */}
                  {filteredRestaurants.length >= 6 && (
                    <div className="mt-6 text-center">
                      <Button
                        onClick={() =>
                          setShowAllRestaurants(!showAllRestaurants)
                        }
                        className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full shadow-md hover:shadow-lg transition-all flex items-center gap-2 mx-auto"
                      >
                        {showAllRestaurants
                          ? "Show Less"
                          : `Show More (${
                              filteredRestaurants.length - 6
                            } more)`}
                        <ChevronDown
                          className={`h-5 w-5 transition-transform ${
                            showAllRestaurants ? "rotate-180" : ""
                          }`}
                        />
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="mx-auto h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                    <Utensils className="h-6 w-6 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-700 mb-1">
                    No Restaurants Found
                  </h3>
                  <p className="text-sm text-gray-500">
                    {searchQuery
                      ? `No restaurants match "${searchQuery}". Try a different search term.`
                      : "There are no restaurants available at the moment. Please check back later."}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card className="border-none shadow-md">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle>Recent Orders</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-orange-500 hover:text-orange-600 hover:bg-orange-50 flex items-center gap-1"
                  onClick={() => router.push("/dashboard/user/orders")}
                >
                  View All <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="h-16 w-16 bg-gray-200 animate-pulse rounded-lg"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 animate-pulse rounded w-1/3"></div>
                        <div className="h-3 bg-gray-200 animate-pulse rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentOrders.length > 0 ? (
                <div className="space-y-4">
                  {recentOrders.map((order, index) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-white transition-colors cursor-pointer"
                      onClick={() => viewOrder(order.id)}
                    >
                      <div className="h-16 w-16 rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={order.image || "/placeholder.svg"}
                          alt={order.restaurant}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h4 className="font-medium">{order.restaurant}</h4>
                          <p className="text-sm text-gray-500">{order.date}</p>
                        </div>
                        <div className="flex justify-between mt-1">
                          <p className="text-sm text-gray-500">
                            {order.items} items · ${order.total.toFixed(2)}
                          </p>
                          <Badge
                            className={
                              order.status === "Delivered"
                                ? "bg-green-100 text-green-700 hover:bg-green-100"
                                : order.status === "On the way"
                                ? "bg-blue-100 text-blue-700 hover:bg-blue-100"
                                : "bg-amber-100 text-amber-700 hover:bg-amber-100"
                            }
                          >
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-700 mb-1">
                    No Orders Yet
                  </h3>
                  <p className="text-sm text-gray-500">
                    You haven't placed any orders yet. Browse restaurants to
                    place your first order.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Popular Items */}
          {popularItems.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Popular Items</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-orange-500 hover:text-orange-600 hover:bg-orange-50 flex items-center gap-1"
                  onClick={viewAllMenuItems}
                >
                  View All <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {popularItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                    className="bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-all cursor-pointer"
                    onClick={() => viewMenuItem(item.restaurantId)}
                  >
                    <div className="relative h-24 w-full mb-2 flex items-center justify-center">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="h-full object-contain"
                      />
                      <Button
                        size="icon"
                        variant="outline"
                        className="absolute top-0 right-0 h-7 w-7 rounded-full bg-white"
                      >
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                    <h4 className="font-medium text-sm line-clamp-1">
                      {item.name}
                    </h4>
                    <p className="text-xs text-gray-500 mb-2">
                      {item.restaurant}
                    </p>
                    <div className="flex justify-between items-center">
                      <p className="font-bold text-orange-500">
                        ${item.price.toFixed(2)}
                      </p>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        <span className="text-xs">{item.rating}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
