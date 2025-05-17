"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import {
  getMyRestaurants,
  updateRestaurantAvailability,
  deleteRestaurant,
} from "@/lib/restaurant-api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Pizza,
  Plus,
  Search,
  Edit,
  Trash2,
  MapPin,
  Phone,
  Mail,
  Clock,
  Store,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function MyRestaurantsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [restaurantToDelete, setRestaurantToDelete] = useState(null);
  const [activeTab, setActiveTab] = useState("my-restaurants");

  useEffect(() => {
    if (!loading && user?.role !== "restaurant_owner") {
      router.push("/");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setIsLoading(true);
        const data = await getMyRestaurants();
        setRestaurants(data);
        setFilteredRestaurants(data);
      } catch (error) {
        toast.error("Failed to fetch restaurants");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user && !loading) {
      fetchRestaurants();
    }
  }, [user, loading]);

  useEffect(() => {
    // Apply search filter
    if (searchQuery) {
      const filtered = restaurants.filter(
        (restaurant) =>
          restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          restaurant.address
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          restaurant.cuisine.some((c) =>
            c.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
      setFilteredRestaurants(filtered);
    } else {
      setFilteredRestaurants(restaurants);
    }
  }, [searchQuery, restaurants]);

  const handleToggleAvailability = async (restaurant) => {
    try {
      const updatedRestaurant = await updateRestaurantAvailability(
        restaurant._id,
        !restaurant.isAvailable
      );

      // Update local state
      const updatedRestaurants = restaurants.map((r) =>
        r._id === updatedRestaurant._id ? updatedRestaurant : r
      );
      setRestaurants(updatedRestaurants);

      toast.success(
        `${restaurant.name} is now ${
          updatedRestaurant.isAvailable ? "available" : "unavailable"
        }`
      );
    } catch (error) {
      toast.error("Failed to update availability");
      console.error(error);
    }
  };

  const confirmDelete = (restaurant) => {
    setRestaurantToDelete(restaurant);
    setDeleteDialogOpen(true);
  };

  const handleDeleteRestaurant = async () => {
    if (!restaurantToDelete) return;

    try {
      await deleteRestaurant(restaurantToDelete._id);

      // Update local state
      const updatedRestaurants = restaurants.filter(
        (r) => r._id !== restaurantToDelete._id
      );
      setRestaurants(updatedRestaurants);

      toast.success(`${restaurantToDelete.name} has been deleted`);
      setDeleteDialogOpen(false);
      setRestaurantToDelete(null);
    } catch (error) {
      toast.error("Failed to delete restaurant");
      console.error(error);
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
          <p className="text-gray-500 text-sm mb-4">Restaurant Dashboard</p>

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
                router.push("/dashboard/restaurant");
              }}
            >
              <Store className="mr-2 h-5 w-5" />
              Dashboard
            </Button>

            <Button
              variant={activeTab === "my-restaurants" ? "default" : "ghost"}
              className={`w-full justify-start ${
                activeTab === "my-restaurants"
                  ? "bg-orange-500 hover:bg-orange-600"
                  : ""
              }`}
              onClick={() => {
                setActiveTab("my-restaurants");
                router.push("/dashboard/restaurant/my-restaurants");
              }}
            >
              <Store className="mr-2 h-5 w-5" />
              My Restaurants
            </Button>

            <Button
              variant={activeTab === "menu" ? "default" : "ghost"}
              className={`w-full justify-start ${
                activeTab === "menu" ? "bg-orange-500 hover:bg-orange-600" : ""
              }`}
              onClick={() => {
                setActiveTab("menu");
                router.push("/dashboard/restaurant/menu");
              }}
            >
              <Pizza className="mr-2 h-5 w-5" />
              Menu Items
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
                router.push("/dashboard/restaurant/orders");
              }}
            >
              <Clock className="mr-2 h-5 w-5" />
              Orders
            </Button>

            <Button
              variant={activeTab === "settings" ? "default" : "ghost"}
              className={`w-full justify-start ${
                activeTab === "settings"
                  ? "bg-orange-500 hover:bg-orange-600"
                  : ""
              }`}
              onClick={() => {
                setActiveTab("settings");
                router.push("/dashboard/restaurant/settings");
              }}
            >
              <Clock className="mr-2 h-5 w-5" />
              Settings
            </Button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">My Restaurants</h1>
              <p className="text-gray-500">Manage your restaurant listings</p>
            </div>
            <Button
              onClick={() => router.push("/dashboard/restaurant/create")}
              className="bg-orange-500 hover:bg-orange-600"
            >
              <Plus className="h-4 w-4 mr-2" /> Add New Restaurant
            </Button>
          </div>

          <Card className="border-none shadow-xl mb-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Your Restaurants</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search restaurants..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-12">
                  <Pizza className="h-10 w-10 text-orange-500 animate-spin mx-auto mb-4" />
                  <p className="text-lg">Loading your restaurants...</p>
                </div>
              ) : filteredRestaurants.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredRestaurants.map((restaurant) => (
                    <Card key={restaurant._id} className="overflow-hidden">
                      <CardContent className="p-0">
                        {/* Restaurant Image */}
                        <div className="w-full h-48 bg-gray-100">
                          {restaurant.image ? (
                            <img
                              src={restaurant.image || "/placeholder.svg"}
                              alt={restaurant.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Store className="h-16 w-16 text-gray-300" />
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-lg">
                              {restaurant.name}
                            </h3>
                            <div className="flex gap-2">
                              <Badge
                                className={
                                  restaurant.isVerified
                                    ? "bg-green-100 text-green-700"
                                    : "bg-gray-100 text-gray-700"
                                }
                              >
                                {restaurant.isVerified
                                  ? "Verified"
                                  : "Unverified"}
                              </Badge>
                              <Badge
                                className={
                                  restaurant.isAvailable
                                    ? "bg-green-100 text-green-700"
                                    : "bg-gray-100 text-gray-700"
                                }
                              >
                                {restaurant.isAvailable ? "Open" : "Closed"}
                              </Badge>
                            </div>
                          </div>
                          <div className="space-y-2 mb-4">
                            <div className="flex items-start gap-2 text-sm">
                              <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                              <span className="text-gray-600">
                                {restaurant.address}
                              </span>
                            </div>
                            <div className="flex items-start gap-2 text-sm">
                              <Phone className="h-4 w-4 text-gray-500 mt-0.5" />
                              <span className="text-gray-600">
                                {restaurant.phone}
                              </span>
                            </div>
                            <div className="flex items-start gap-2 text-sm">
                              <Mail className="h-4 w-4 text-gray-500 mt-0.5" />
                              <span className="text-gray-600">
                                {restaurant.email}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {restaurant.cuisine.map((cuisine, index) => (
                              <Badge key={index} variant="outline">
                                {cuisine}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <span className="text-sm">Available</span>
                              <Switch
                                checked={restaurant.isAvailable}
                                onCheckedChange={() =>
                                  handleToggleAvailability(restaurant)
                                }
                                className="data-[state=checked]:bg-orange-500"
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8"
                                onClick={() =>
                                  router.push(
                                    `/dashboard/restaurant/edit/${restaurant._id}`
                                  )
                                }
                              >
                                <Edit className="h-4 w-4 mr-1" /> Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-red-500 border-red-500 hover:bg-red-50"
                                onClick={() => confirmDelete(restaurant)}
                              >
                                <Trash2 className="h-4 w-4 mr-1" /> Delete
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="mx-auto h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                    <Store className="h-6 w-6 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-700 mb-1">
                    No Restaurants Found
                  </h3>
                  {searchQuery ? (
                    <p className="text-sm text-gray-500 mb-4">
                      Try adjusting your search criteria
                    </p>
                  ) : (
                    <>
                      <p className="text-sm text-gray-500 mb-4">
                        You haven't added any restaurants yet.
                      </p>
                      <Button
                        onClick={() =>
                          router.push("/dashboard/restaurant/create")
                        }
                        className="bg-orange-500 hover:bg-orange-600"
                      >
                        <Plus className="h-4 w-4 mr-2" /> Add First Restaurant
                      </Button>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {restaurantToDelete?.name}. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRestaurant}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
