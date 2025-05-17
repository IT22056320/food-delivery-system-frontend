"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import {
  Pizza,
  Home,
  ShoppingBag,
  Heart,
  User,
  LogOut,
  Package,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit,
  Camera,
  Save,
  X,
  Shield,
  BellIcon,
  CreditCard,
  Clock,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useFavorites } from "@/hooks/use-favorites";

export default function UserProfile() {
  const { user, loading, logout } = useAuth();
  const { getFavoritesCount } = useFavorites();
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    birthday: "",
  });
  const [orderStats, setOrderStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
  });
  const router = useRouter();

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (loading) return;

      try {
        // Fetch user profile from API
        const response = await fetch(
          "http://localhost:5000/api/users/profile",
          {
            credentials: "include",
          }
        );

        if (response.ok) {
          const data = await response.json();
          setProfileData(data);

          // Initialize form data with user profile data
          setFormData({
            name: data.name || "",
            email: data.email || "",
            phone: data.phone || "",
            address: data.address?.street || "",
            city: data.address?.city || "",
            state: data.address?.state || "",
            zipCode: data.address?.zipCode || "",
            birthday: data.birthday
              ? new Date(data.birthday).toISOString().split("T")[0]
              : "",
          });
        } else {
          console.error("Failed to fetch user profile:", await response.text());
          // If API fails, use user data from auth context as fallback
          if (user) {
            setProfileData(user);
            setFormData({
              name: user.name || "",
              email: user.email || "",
              phone: user.phone || "",
              address: "",
              city: "",
              state: "",
              zipCode: "",
              birthday: "",
            });
          }
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        // Use user data from auth context as fallback
        if (user) {
          setProfileData(user);
          setFormData({
            name: user.name || "",
            email: user.email || "",
            phone: user.phone || "",
            address: "",
            city: "",
            state: "",
            zipCode: "",
            birthday: "",
          });
        }
      }
    };

    // Fetch order statistics
    const fetchOrderStats = async () => {
      try {
        const response = await fetch("http://localhost:5002/api/orders", {
          credentials: "include",
        });

        if (response.ok) {
          const orders = await response.json();

          const completed = orders.filter(
            (order) =>
              order.order_status === "DELIVERED" ||
              order.order_status === "COMPLETED"
          ).length;

          const inProgress = orders.filter(
            (order) =>
              order.order_status !== "DELIVERED" &&
              order.order_status !== "COMPLETED" &&
              order.order_status !== "CANCELLED"
          ).length;

          setOrderStats({
            total: orders.length,
            completed,
            inProgress,
          });
        }
      } catch (error) {
        console.error("Error fetching order statistics:", error);
      }
    };

    Promise.all([fetchUserProfile(), fetchOrderStats()])
      .then(() => setIsLoading(false))
      .catch(() => setIsLoading(false));
  }, [loading, user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setIsLoading(true);

      // Format the data for the API
      const updatedProfile = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: {
          street: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
        },
        birthday: formData.birthday,
      };

      // Send update to API
      const response = await fetch("http://localhost:5000/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(updatedProfile),
      });

      if (response.ok) {
        const updatedData = await response.json();
        setProfileData(updatedData);
        setIsEditing(false);
        toast.success("Profile updated successfully");
      } else {
        toast.error("Failed to update profile");
        console.error("Failed to update profile:", await response.text());
      }
    } catch (error) {
      toast.error("Error updating profile");
      console.error("Error updating profile:", error);
    } finally {
      setIsLoading(false);
    }
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

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid date";

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getJoinedDate = () => {
    if (!profileData || !profileData.createdAt) return "Unknown";

    const date = new Date(profileData.createdAt);
    if (isNaN(date.getTime())) return "Unknown";

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
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
        <header className="mb-8">
          <h1 className="text-2xl font-bold mb-2">
            {isLoading ? (
              <div className="h-8 w-40 bg-gray-200 animate-pulse rounded"></div>
            ) : (
              <motion.span
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                My Profile
              </motion.span>
            )}
          </h1>
          <p className="text-gray-500">
            Manage your account settings and preferences
          </p>
        </header>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <div className="h-[400px] bg-gray-200 animate-pulse rounded-lg"></div>
            </div>
            <div className="md:col-span-2">
              <div className="h-[500px] bg-gray-200 animate-pulse rounded-lg"></div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Profile Card */}
            <div className="md:col-span-1">
              <Card className="border-none shadow-md">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center">
                    <div className="relative mb-4">
                      <Avatar className="h-24 w-24 border-4 border-white shadow-md">
                        <AvatarImage
                          src={profileData?.avatar || "/diverse-avatars.png"}
                        />
                        <AvatarFallback className="bg-orange-200 text-orange-700 text-2xl">
                          {getInitials(profileData?.name)}
                        </AvatarFallback>
                      </Avatar>
                      <Button
                        size="icon"
                        variant="outline"
                        className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-white shadow-sm"
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                    </div>
                    <h2 className="text-xl font-bold">{profileData?.name}</h2>
                    <p className="text-gray-500 text-sm mb-4">
                      {profileData?.email}
                    </p>

                    <div className="grid grid-cols-3 w-full gap-2 mb-6">
                      <div className="flex flex-col items-center p-2 bg-orange-50 rounded-lg">
                        <span className="text-lg font-bold text-orange-500">
                          {orderStats.total}
                        </span>
                        <span className="text-xs text-gray-500">Orders</span>
                      </div>
                      <div className="flex flex-col items-center p-2 bg-green-50 rounded-lg">
                        <span className="text-lg font-bold text-green-500">
                          {orderStats.completed}
                        </span>
                        <span className="text-xs text-gray-500">Completed</span>
                      </div>
                      <div className="flex flex-col items-center p-2 bg-blue-50 rounded-lg">
                        <span className="text-lg font-bold text-blue-500">
                          {getFavoritesCount()}
                        </span>
                        <span className="text-xs text-gray-500">Favorites</span>
                      </div>
                    </div>

                    <div className="w-full space-y-3">
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium">
                            {profileData?.email}
                          </p>
                          <p className="text-xs text-gray-500">Email</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium">
                            {profileData?.phone || "Not set"}
                          </p>
                          <p className="text-xs text-gray-500">Phone</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium">
                            {profileData?.address?.street ? (
                              <>
                                {profileData.address.street},{" "}
                                {profileData.address.city},{" "}
                                {profileData.address.state}{" "}
                                {profileData.address.zipCode}
                              </>
                            ) : (
                              "Not set"
                            )}
                          </p>
                          <p className="text-xs text-gray-500">Address</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium">
                            {formatDate(profileData?.birthday)}
                          </p>
                          <p className="text-xs text-gray-500">Birthday</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium">
                            Member since {getJoinedDate()}
                          </p>
                          <p className="text-xs text-gray-500">Joined</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Profile Details */}
            <div className="md:col-span-2">
              <Tabs defaultValue="personal" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="personal">Personal Info</TabsTrigger>
                  <TabsTrigger value="security">Security</TabsTrigger>
                  <TabsTrigger value="preferences">Preferences</TabsTrigger>
                </TabsList>

                <TabsContent value="personal">
                  <Card className="border-none shadow-md">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle>Personal Information</CardTitle>
                          <CardDescription>
                            Update your personal details
                          </CardDescription>
                        </div>
                        {!isEditing ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1"
                            onClick={() => setIsEditing(true)}
                          >
                            <Edit className="h-4 w-4" />
                            Edit Profile
                          </Button>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-1"
                              onClick={() => setIsEditing(false)}
                            >
                              <X className="h-4 w-4" />
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              className="flex items-center gap-1 bg-orange-500 hover:bg-orange-600"
                              onClick={handleSaveProfile}
                              disabled={isLoading}
                            >
                              <Save className="h-4 w-4" />
                              Save
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            {isEditing ? (
                              <Input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="Your full name"
                              />
                            ) : (
                              <div className="p-2 bg-gray-50 rounded-md">
                                {profileData?.name || "Not set"}
                              </div>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            {isEditing ? (
                              <Input
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="Your email address"
                              />
                            ) : (
                              <div className="p-2 bg-gray-50 rounded-md">
                                {profileData?.email || "Not set"}
                              </div>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            {isEditing ? (
                              <Input
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                placeholder="Your phone number"
                              />
                            ) : (
                              <div className="p-2 bg-gray-50 rounded-md">
                                {profileData?.phone || "Not set"}
                              </div>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="birthday">Birthday</Label>
                            {isEditing ? (
                              <Input
                                id="birthday"
                                name="birthday"
                                type="date"
                                value={formData.birthday}
                                onChange={handleInputChange}
                              />
                            ) : (
                              <div className="p-2 bg-gray-50 rounded-md">
                                {formatDate(profileData?.birthday)}
                              </div>
                            )}
                          </div>
                        </div>

                        <Separator className="my-4" />

                        <div className="space-y-2">
                          <Label htmlFor="address">Address</Label>
                          {isEditing ? (
                            <Input
                              id="address"
                              name="address"
                              value={formData.address}
                              onChange={handleInputChange}
                              placeholder="Street address"
                            />
                          ) : (
                            <div className="p-2 bg-gray-50 rounded-md">
                              {profileData?.address?.street || "Not set"}
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="city">City</Label>
                            {isEditing ? (
                              <Input
                                id="city"
                                name="city"
                                value={formData.city}
                                onChange={handleInputChange}
                                placeholder="City"
                              />
                            ) : (
                              <div className="p-2 bg-gray-50 rounded-md">
                                {profileData?.address?.city || "Not set"}
                              </div>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="state">State</Label>
                            {isEditing ? (
                              <Input
                                id="state"
                                name="state"
                                value={formData.state}
                                onChange={handleInputChange}
                                placeholder="State"
                              />
                            ) : (
                              <div className="p-2 bg-gray-50 rounded-md">
                                {profileData?.address?.state || "Not set"}
                              </div>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="zipCode">ZIP Code</Label>
                            {isEditing ? (
                              <Input
                                id="zipCode"
                                name="zipCode"
                                value={formData.zipCode}
                                onChange={handleInputChange}
                                placeholder="ZIP Code"
                              />
                            ) : (
                              <div className="p-2 bg-gray-50 rounded-md">
                                {profileData?.address?.zipCode || "Not set"}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="security">
                  <Card className="border-none shadow-md">
                    <CardHeader>
                      <CardTitle>Security Settings</CardTitle>
                      <CardDescription>
                        Manage your account security
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <h3 className="text-lg font-medium">
                            Change Password
                          </h3>
                          <p className="text-sm text-gray-500">
                            Update your password to keep your account secure
                          </p>
                          <div className="grid grid-cols-1 gap-4 mt-4">
                            <div className="space-y-2">
                              <Label htmlFor="current-password">
                                Current Password
                              </Label>
                              <Input
                                id="current-password"
                                type="password"
                                placeholder="Enter current password"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="new-password">New Password</Label>
                              <Input
                                id="new-password"
                                type="password"
                                placeholder="Enter new password"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="confirm-password">
                                Confirm New Password
                              </Label>
                              <Input
                                id="confirm-password"
                                type="password"
                                placeholder="Confirm new password"
                              />
                            </div>
                          </div>
                          <Button className="mt-4 bg-orange-500 hover:bg-orange-600">
                            Update Password
                          </Button>
                        </div>

                        <Separator />

                        <div className="space-y-2">
                          <h3 className="text-lg font-medium">
                            Two-Factor Authentication
                          </h3>
                          <p className="text-sm text-gray-500">
                            Add an extra layer of security to your account
                          </p>
                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center gap-2">
                              <Shield className="h-5 w-5 text-gray-400" />
                              <div>
                                <p className="text-sm font-medium">
                                  Two-Factor Authentication
                                </p>
                                <p className="text-xs text-gray-500">
                                  Protect your account with 2FA
                                </p>
                              </div>
                            </div>
                            <Switch />
                          </div>
                        </div>

                        <Separator />

                        <div className="space-y-2">
                          <h3 className="text-lg font-medium">
                            Login Sessions
                          </h3>
                          <p className="text-sm text-gray-500">
                            Manage your active sessions
                          </p>
                          <div className="mt-4 space-y-3">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                                  <Shield className="h-4 w-4 text-green-500" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium">
                                    Current Session
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Web Browser •{" "}
                                    {new Date().toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                                Active
                              </Badge>
                            </div>
                          </div>
                          <Button variant="outline" className="mt-2 w-full">
                            Log Out All Devices
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="preferences">
                  <Card className="border-none shadow-md">
                    <CardHeader>
                      <CardTitle>Preferences</CardTitle>
                      <CardDescription>
                        Manage your notification and app preferences
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <h3 className="text-lg font-medium">Notifications</h3>
                          <p className="text-sm text-gray-500">
                            Choose what notifications you receive
                          </p>
                          <div className="space-y-3 mt-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <BellIcon className="h-5 w-5 text-gray-400" />
                                <div>
                                  <p className="text-sm font-medium">
                                    Order Updates
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Receive updates about your orders
                                  </p>
                                </div>
                              </div>
                              <Switch defaultChecked />
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Pizza className="h-5 w-5 text-gray-400" />
                                <div>
                                  <p className="text-sm font-medium">
                                    Special Offers
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Receive special offers and promotions
                                  </p>
                                </div>
                              </div>
                              <Switch defaultChecked />
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Mail className="h-5 w-5 text-gray-400" />
                                <div>
                                  <p className="text-sm font-medium">
                                    Email Notifications
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Receive email notifications
                                  </p>
                                </div>
                              </div>
                              <Switch defaultChecked />
                            </div>
                          </div>
                        </div>

                        <Separator />

                        <div className="space-y-2">
                          <h3 className="text-lg font-medium">
                            Payment Methods
                          </h3>
                          <p className="text-sm text-gray-500">
                            Manage your payment methods
                          </p>
                          <div className="mt-4 space-y-3">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                                  <CreditCard className="h-4 w-4 text-blue-500" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium">
                                    Visa ending in 4242
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Expires 12/25
                                  </p>
                                </div>
                              </div>
                              <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                                Default
                              </Badge>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            className="mt-2 flex items-center gap-1"
                          >
                            <CreditCard className="h-4 w-4" />
                            Add Payment Method
                          </Button>
                        </div>

                        <Separator />

                        <div className="space-y-2">
                          <h3 className="text-lg font-medium">
                            Language & Region
                          </h3>
                          <p className="text-sm text-gray-500">
                            Set your preferred language and region
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div className="space-y-2">
                              <Label htmlFor="language">Language</Label>
                              <select
                                id="language"
                                className="w-full p-2 border border-gray-200 rounded-md"
                                defaultValue="en"
                              >
                                <option value="en">English</option>
                                <option value="es">Spanish</option>
                                <option value="fr">French</option>
                                <option value="de">German</option>
                              </select>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="region">Region</Label>
                              <select
                                id="region"
                                className="w-full p-2 border border-gray-200 rounded-md"
                                defaultValue="us"
                              >
                                <option value="us">United States</option>
                                <option value="ca">Canada</option>
                                <option value="uk">United Kingdom</option>
                                <option value="au">Australia</option>
                              </select>
                            </div>
                          </div>
                          <Button className="mt-4 bg-orange-500 hover:bg-orange-600">
                            Save Preferences
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
