"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useFavorites } from "@/hooks/use-favorites";
import {
  Pizza,
  Home,
  ShoppingBag,
  Heart,
  User,
  Search,
  Star,
  ArrowLeft,
  Filter,
  ChevronDown,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AllMenuItems() {
  const { user, loading, logout } = useAuth();
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();
  const [activeTab, setActiveTab] = useState("menu-items");
  const [isLoading, setIsLoading] = useState(true);
  const [menuItems, setMenuItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("popularity"); // popularity, price-low, price-high, rating
  const router = useRouter();

  // Fetch all menu items from all restaurants
  useEffect(() => {
    const fetchAllMenuItems = async () => {
      try {
        setIsLoading(true);

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
        const menuItemsPromises = verifiedRestaurants.map((restaurant) =>
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
        const allMenuItems = allMenuItemsArrays
          .flat()
          .filter((item) => item.isAvailable !== false);

        // Format the menu items
        const formattedItems = allMenuItems.map((item) => ({
          id: item._id,
          name: item.name,
          description: item.description,
          restaurant: item.restaurant,
          restaurantId: item.restaurantId,
          price: item.price,
          rating: item.rating || 4.5,
          image:
            item.image ||
            `/placeholder.svg?height=100&width=100&query=${encodeURIComponent(
              item.name
            )}`,
          category: item.category || "Main",
          popularity: item.popularity || Math.floor(Math.random() * 100) + 1, // Random popularity if not available
        }));

        setMenuItems(formattedItems);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching menu items:", error);
        setMenuItems([]);
        setIsLoading(false);
      }
    };

    if (!loading) {
      fetchAllMenuItems();
    }
  }, [loading]);

  // Filter and sort menu items
  const filteredAndSortedMenuItems = menuItems
    .filter(
      (item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.restaurant.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description &&
          item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.category &&
          item.category.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      switch (sortOption) {
        case "popularity":
          return b.popularity - a.popularity;
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "rating":
          return b.rating - a.rating;
        default:
          return b.popularity - a.popularity;
      }
    });

  const handleFavoriteToggle = (e, item) => {
    e.stopPropagation();

    if (isFavorite("menuItem", item.id)) {
      removeFavorite("menuItem", item.id);
    } else {
      addFavorite("menuItem", {
        id: item.id,
        name: item.name,
        restaurant: item.restaurant,
        restaurantId: item.restaurantId,
        price: item.price,
        image: item.image,
        rating: item.rating,
      });
    }
  };

  const viewMenuItem = (restaurantId) => {
    router.push(`/dashboard/user/restaurants/${restaurantId}`);
  };

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:5000/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
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
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => router.push("/dashboard/user")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Popular Menu Items</h1>
              <p className="text-gray-500">
                Discover the most popular dishes from all restaurants
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search menu items..."
                className="pl-10 w-[300px] bg-white border-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="bg-white flex items-center gap-2"
                >
                  <Filter className="h-4 w-4" />
                  Sort by
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSortOption("popularity")}>
                  Most Popular
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOption("rating")}>
                  Highest Rated
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOption("price-low")}>
                  Price: Low to High
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOption("price-high")}>
                  Price: High to Low
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Avatar>
              <AvatarImage src="/diverse-avatars.png" />
              <AvatarFallback className="bg-orange-200 text-orange-700">
                {user?.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Menu Items Grid */}
        <div className="mt-6">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array(12)
                .fill(0)
                .map((_, index) => (
                  <div
                    key={index}
                    className="bg-gray-200 animate-pulse rounded-lg h-64"
                  ></div>
                ))}
            </div>
          ) : filteredAndSortedMenuItems.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredAndSortedMenuItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer"
                  onClick={() => viewMenuItem(item.restaurantId)}
                >
                  <div className="h-40 relative">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                    <Button
                      size="icon"
                      variant="outline"
                      className={`absolute top-2 right-2 h-8 w-8 rounded-full ${
                        isFavorite("menuItem", item.id)
                          ? "bg-red-500 text-white hover:bg-red-600 border-none"
                          : "bg-white hover:bg-gray-100"
                      }`}
                      onClick={(e) => handleFavoriteToggle(e, item)}
                    >
                      <Heart
                        className={`h-4 w-4 ${
                          isFavorite("menuItem", item.id) ? "fill-white" : ""
                        }`}
                      />
                    </Button>
                    {item.category && (
                      <Badge className="absolute bottom-2 left-2 bg-white text-orange-500">
                        {item.category}
                      </Badge>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-1 line-clamp-1">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">
                      {item.restaurant}
                    </p>
                    <div className="flex justify-between items-center">
                      <p className="font-bold text-orange-500">
                        ${item.price.toFixed(2)}
                      </p>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        <span className="text-sm">
                          {item.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="mx-auto h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Pizza className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-700 mb-2">
                No Menu Items Found
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {searchQuery
                  ? `No menu items match "${searchQuery}". Try a different search term.`
                  : "There are no menu items available at the moment. Please check back later."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
