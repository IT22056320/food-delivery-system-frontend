"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useFavorites } from "@/hooks/use-favorites";
import { motion } from "framer-motion";
import {
  Pizza,
  Home,
  ShoppingBag,
  Heart,
  User,
  Search,
  Star,
  Clock,
  Trash2,
  LogOut,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

export default function FavoritesPage() {
  const { user, loading, logout } = useAuth();
  const { getAllFavorites, getFavoritesByType, removeFromFavorites } =
    useFavorites();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("favorites");
  const [isLoading, setIsLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Load favorites from localStorage
  useEffect(() => {
    if (!loading) {
      const allFavorites = getAllFavorites();
      setFavorites(allFavorites);
      setIsLoading(false);
    }
  }, [loading, getAllFavorites]);

  // Filter favorites based on type and search query
  const filteredFavorites = favorites.filter((favorite) => {
    // Filter by type
    const matchesType =
      activeFilter === "all" ||
      (activeFilter === "restaurants" && favorite.itemType === "restaurant") ||
      (activeFilter === "menuItems" && favorite.itemType === "menuItem");

    // Filter by search query
    const item = favorite.item;
    const matchesSearch =
      searchQuery === "" ||
      item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description &&
        item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (favorite.itemType === "restaurant" &&
        item.cuisine &&
        item.cuisine.some((c) =>
          c.toLowerCase().includes(searchQuery.toLowerCase())
        ));

    return matchesType && matchesSearch;
  });

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

  const handleRemoveFavorite = (favorite, event) => {
    event.stopPropagation();
    removeFromFavorites(favorite.itemType, favorite.itemId);
    setFavorites(getAllFavorites());
    toast.success(`Removed from favorites`);
  };

  const navigateToRestaurant = (restaurantId) => {
    router.push(`/dashboard/user/restaurants/${restaurantId}`);
  };

  const navigateToMenuItem = (favorite) => {
    // Navigate to the restaurant page that contains this menu item
    if (favorite.item.restaurantId) {
      router.push(`/dashboard/user/restaurants/${favorite.item.restaurantId}`);
    }
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
              {favorites.length > 0 && (
                <Badge className="ml-auto bg-orange-200 text-orange-700">
                  {favorites.length}
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
            <h1 className="text-2xl font-bold">My Favorites</h1>
            <p className="text-gray-500">
              Manage your favorite restaurants and menu items
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarFallback className="bg-orange-200 text-orange-700">
                {user?.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search favorites..."
                className="pl-10 bg-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Favorites Content */}
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle>Your Favorites</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs
              defaultValue="all"
              value={activeFilter}
              onValueChange={setActiveFilter}
            >
              <TabsList className="mb-6">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="restaurants">Restaurants</TabsTrigger>
                <TabsTrigger value="menuItems">Menu Items</TabsTrigger>
              </TabsList>

              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-48 bg-gray-200 animate-pulse rounded-lg"
                    ></div>
                  ))}
                </div>
              ) : filteredFavorites.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredFavorites.map((favorite) => (
                    <motion.div
                      key={`${favorite.itemType}-${favorite.itemId}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ y: -5 }}
                      className="bg-white rounded-lg overflow-hidden shadow-md cursor-pointer relative"
                      onClick={() =>
                        favorite.itemType === "restaurant"
                          ? navigateToRestaurant(favorite.itemId)
                          : navigateToMenuItem(favorite)
                      }
                    >
                      {/* Remove button */}
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8 rounded-full z-10"
                        onClick={(e) => handleRemoveFavorite(favorite, e)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>

                      {favorite.itemType === "restaurant" ? (
                        // Restaurant card
                        <>
                          <div className="h-32 bg-gray-100 relative">
                            <img
                              src={
                                favorite.item.image ||
                                `/placeholder.svg?height=200&width=400&query=${
                                  encodeURIComponent(favorite.item.name) ||
                                  "restaurant"
                                }`
                              }
                              alt={favorite.item.name}
                              className="w-full h-full object-cover"
                            />
                            {favorite.item.cuisine &&
                              favorite.item.cuisine.length > 0 && (
                                <Badge className="absolute top-2 left-2 bg-white text-orange-500">
                                  {favorite.item.cuisine[0]}
                                </Badge>
                              )}
                          </div>
                          <div className="p-4">
                            <h3 className="font-bold text-lg mb-1">
                              {favorite.item.name}
                            </h3>
                            <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                              {favorite.item.description ||
                                "No description available"}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                                <span className="text-sm font-medium">
                                  {favorite.item.rating || "New"}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-sm text-gray-500">
                                <Clock className="h-3 w-3" />
                                <span>15-30 min</span>
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        // Menu item card
                        <>
                          <div className="h-32 bg-gray-100 relative">
                            <img
                              src={
                                favorite.item.image ||
                                `/placeholder.svg?height=200&width=400&query=${
                                  encodeURIComponent(favorite.item.name) ||
                                  "food"
                                }`
                              }
                              alt={favorite.item.name}
                              className="w-full h-full object-cover"
                            />
                            <Badge className="absolute top-2 left-2 bg-orange-500 text-white">
                              {favorite.item.category || "Food"}
                            </Badge>
                          </div>
                          <div className="p-4">
                            <h3 className="font-bold text-lg mb-1">
                              {favorite.item.name}
                            </h3>
                            <p className="text-sm text-gray-500 mb-1">
                              From:{" "}
                              {favorite.item.restaurantName || "Restaurant"}
                            </p>
                            <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                              {favorite.item.description ||
                                "No description available"}
                            </p>
                            <div className="flex items-center justify-between">
                              <p className="font-bold text-orange-500">
                                $
                                {favorite.item.price
                                  ? favorite.item.price.toFixed(2)
                                  : "N/A"}
                              </p>
                              {favorite.item.rating && (
                                <div className="flex items-center gap-1">
                                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                                  <span className="text-sm font-medium">
                                    {favorite.item.rating}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-700 mb-2">
                    No favorites found
                  </h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    {searchQuery
                      ? `No favorites match "${searchQuery}". Try a different search term.`
                      : activeFilter === "all"
                      ? "You haven't added any favorites yet. Browse restaurants and menu items to add them to your favorites."
                      : activeFilter === "restaurants"
                      ? "You haven't added any favorite restaurants yet."
                      : "You haven't added any favorite menu items yet."}
                  </p>
                  <Button
                    className="mt-4 bg-orange-500 hover:bg-orange-600"
                    onClick={() => router.push("/dashboard/user/restaurants")}
                  >
                    Browse Restaurants
                  </Button>
                </div>
              )}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
