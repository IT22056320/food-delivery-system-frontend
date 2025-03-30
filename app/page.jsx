"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, useScroll, useTransform } from "framer-motion"
import {
  Pizza,
  ChevronRight,
  Star,
  Clock,
  MapPin,
  ArrowRight,
  Search,
  Menu,
  X,
  Check,
  Phone,
  ShoppingBag,
  Utensils,
  Truck,
  Plus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

// Sample data for the homepage
const popularRestaurants = [
  {
    id: 1,
    name: "Burger Palace",
    image: "https://www.avikalp.com/cdn/shop/products/MWZ2987_wallpaper1.jpg?v=1653192524",
    rating: 4.8,
    deliveryTime: "15-20 min",
    category: "American",
  },
  {
    id: 2,
    name: "Pizza Heaven",
    image: "https://homedecoram.com/cdn/shop/files/03copy_130b3fc3-37bc-4bf6-a1e9-3b6e52ceb77f.jpg?v=1685709580",
    rating: 4.6,
    deliveryTime: "20-30 min",
    category: "Italian",
  },
  {
    id: 3,
    name: "Taco Fiesta",
    image: "https://w0.peakpx.com/wallpaper/1019/191/HD-wallpaper-restaurant-and-bar-with-gorgeous-view-city-restaurant-view-bar.jpg",
    rating: 4.5,
    deliveryTime: "25-35 min",
    category: "Mexican",
  },
  {
    id: 4,
    name: "Sushi World",
    image: "https://wallpapers.com/images/featured/restaurant-background-2ez77umko2vj5w02.jpg",
    rating: 4.9,
    deliveryTime: "30-40 min",
    category: "Japanese",
  },
]

const popularDishes = [
  {
    id: 1,
    name: "Double Cheeseburger",
    image: "https://t4.ftcdn.net/jpg/02/84/46/89/360_F_284468940_1bg6BwgOfjCnE3W0wkMVMVqddJgtMynE.jpg",
    price: 12.99,
    restaurant: "Burger Palace",
  },
  {
    id: 2,
    name: "Pepperoni Pizza",
    image: "https://wallpapers.com/images/hd/food-4k-1pf6px6ryqfjtnyr.jpg",
    price: 14.5,
    restaurant: "Pizza Heaven",
  },
  {
    id: 3,
    name: "Chicken Tacos",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT-ekdyba1rwZUwQM1evga5o0pXaINZugJQUQ&s",
    price: 10.99,
    restaurant: "Taco Fiesta",
  },
  {
    id: 4,
    name: "California Roll",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT-ekdyba1rwZUwQM1evga5o0pXaINZugJQUQ&s",
    price: 16.99,
    restaurant: "Sushi World",
  },
]

const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    image: "/placeholder.svg?height=60&width=60",
    text: "FoodHub has completely changed how I order food. The delivery is always on time and the food arrives hot!",
    rating: 5,
  },
  {
    id: 2,
    name: "Michael Chen",
    image: "/placeholder.svg?height=60&width=60",
    text: "I love the variety of restaurants available. I've discovered so many new favorite places through this app.",
    rating: 5,
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    image: "/placeholder.svg?height=60&width=60",
    text: "The app is so easy to use and the customer service is excellent. Highly recommend!",
    rating: 4,
  },
]

export default function Homepage() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Scroll animations
  const { scrollYProgress } = useScroll()
  const heroImageY = useTransform(scrollYProgress, [0, 0.2], [0, 50])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 to-amber-50">
      {/* Navbar */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? "bg-white shadow-md py-2" : "bg-transparent py-4"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2">
              <Pizza className={`h-8 w-8 ${isScrolled ? "text-orange-500" : "text-black"}`} />
              <span className={`font-bold text-xl ${isScrolled ? "text-gray-800" : "text-black"}`}>FoodHub</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <Link
                href="#restaurants"
                className={`font-medium ${isScrolled ? "text-gray-600 hover:text-orange-500" : "text-black hover:text-orange-200"}`}
              >
                Restaurants
              </Link>
              <Link
                href="#how-it-works"
                className={`font-medium ${isScrolled ? "text-gray-600 hover:text-orange-500" : "text-black hover:text-orange-200"}`}
              >
                How It Works
              </Link>
              <Link
                href="#about"
                className={`font-medium ${isScrolled ? "text-gray-600 hover:text-orange-500" : "text-black hover:text-orange-200"}`}
              >
                About Us
              </Link>
            </nav>

            <div className="hidden md:flex items-center gap-4">
              <Link href="/login">
                <Button variant={isScrolled ? "outline" : "secondary"} className="font-medium">
                  Log In
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-orange-500 hover:bg-orange-600 text-white font-medium">Sign Up</Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? (
                <X className={`h-6 w-6 ${isScrolled ? "text-gray-800" : "text-black"}`} />
              ) : (
                <Menu className={`h-6 w-6 ${isScrolled ? "text-gray-800" : "text-black"}`} />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-16 left-0 right-0 bg-white shadow-lg z-40 p-4 md:hidden"
        >
          <nav className="flex flex-col gap-4">
            <Link
              href="#restaurants"
              className="font-medium text-gray-600 hover:text-orange-500 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Restaurants
            </Link>
            <Link
              href="#how-it-works"
              className="font-medium text-gray-600 hover:text-orange-500 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              How It Works
            </Link>
            <Link
              href="#about"
              className="font-medium text-gray-600 hover:text-orange-500 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              About Us
            </Link>
            <div className="flex flex-col gap-2 pt-2 border-t">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full justify-center font-medium">
                  Log In
                </Button>
              </Link>
              <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full justify-center bg-orange-500 hover:bg-orange-600 text-white font-medium">
                  Sign Up
                </Button>
              </Link>
            </div>
          </nav>
        </motion.div>
      )}

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-amber-600 -z-10"></div>

        {/* Decorative circles */}
        <div className="absolute top-20 right-10 h-32 w-32 rounded-full bg-orange-300 opacity-20 -z-10"></div>
        <div className="absolute bottom-10 left-10 h-40 w-40 rounded-full bg-orange-300 opacity-20 -z-10"></div>

        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="md:w-1/2 text-white mb-10 md:mb-0"
            >
              <Badge className="bg-white text-orange-500 mb-4">Order Now</Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
                Delicious Food <br />
                <span className="text-amber-200">Delivered Fast</span>
              </h1>
              <p className="text-lg md:text-xl mb-8 text-orange-100 max-w-md">
                Order from your favorite restaurants and get food delivered to your doorstep in minutes.
              </p>

              <div className="bg-white p-2 rounded-lg flex items-center max-w-md">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input placeholder="Enter your delivery address" className="border-none pl-10 h-12 bg-transparent" />
                </div>
                <Button className="bg-orange-500 hover:bg-orange-600 h-12 px-6">Find Food</Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              style={{ y: heroImageY }}
              className="md:w-1/2 relative"
            >
              <div className="relative">
                <img
                  src="https://png.pngtree.com/thumb_back/fh260/background/20230612/pngtree-variety-of-indian-food-in-front-of-a-dark-wooden-table-image_2930880.jpg"
                  alt="Delicious Food"
                  className="rounded-lg shadow-xl"
                />

                {/* Floating elements */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="absolute -bottom-6 -left-6 bg-white p-3 rounded-lg shadow-lg flex items-center gap-3"
                >
                  <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <Truck className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Delivery Time</p>
                    <p className="font-medium text-gray-800">15-30 min</p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="absolute -top-6 -right-6 bg-white p-3 rounded-lg shadow-lg"
                >
                  <div className="flex items-center gap-1">
                    <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                    <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                    <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                    <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                    <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">4.8 out of 5 stars</p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="bg-orange-100 text-orange-500 mb-2">Why Choose Us</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Food Delivery Made Simple</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We make food ordering fast, simple and free - no matter if you order online or cash
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Utensils className="h-8 w-8 text-orange-500" />,
                title: "Wide Selection",
                description: "Choose from hundreds of restaurants with a variety of cuisines to satisfy any craving.",
              },
              {
                icon: <Truck className="h-8 w-8 text-orange-500" />,
                title: "Fast Delivery",
                description:
                  "Our delivery partners ensure your food arrives hot and fresh in the shortest time possible.",
              },
              {
                icon: <ShoppingBag className="h-8 w-8 text-orange-500" />,
                title: "Easy Ordering",
                description: "Order with just a few taps and track your delivery in real-time from the app.",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="h-14 w-14 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Restaurants Section */}
      <section id="restaurants" className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-10">
            <div>
              <Badge className="bg-orange-100 text-orange-500 mb-2">Top Rated</Badge>
              <h2 className="text-3xl md:text-4xl font-bold">Popular Restaurants</h2>
            </div>
            <Button
              variant="ghost"
              className="text-orange-500 hover:text-orange-600 hover:bg-orange-50 hidden md:flex items-center gap-1"
            >
              View All <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularRestaurants.map((restaurant, index) => (
              <motion.div
                key={restaurant.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all"
              >
                <div className="h-48 overflow-hidden">
                  <img
                    src={restaurant.image || "/placeholder.svg"}
                    alt={restaurant.name}
                    className="w-full h-full object-cover transition-transform hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg">{restaurant.name}</h3>
                    <Badge className="bg-orange-100 text-orange-500">{restaurant.category}</Badge>
                  </div>
                  <div className="flex items-center gap-1 mb-3">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-medium">{restaurant.rating}</span>
                    <span className="text-gray-400 mx-2">•</span>
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{restaurant.deliveryTime}</span>
                  </div>
                  <Button className="w-full bg-orange-500 hover:bg-orange-600 mt-2">Order Now</Button>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Button variant="outline" className="text-orange-500 border-orange-500">
              View All Restaurants
            </Button>
          </div>
        </div>
      </section>

      {/* Popular Dishes Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-10">
            <div>
              <Badge className="bg-orange-100 text-orange-500 mb-2">Most Ordered</Badge>
              <h2 className="text-3xl md:text-4xl font-bold">Popular Dishes</h2>
            </div>
            <Button
              variant="ghost"
              className="text-orange-500 hover:text-orange-600 hover:bg-orange-50 hidden md:flex items-center gap-1"
            >
              View All <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {popularDishes.map((dish, index) => (
              <motion.div
                key={dish.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
                className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all"
              >
                <div className="flex justify-center mb-4">
                  <img src={dish.image || "/placeholder.svg"} alt={dish.name} className="h-24 w-24 object-contain" />
                </div>
                <h3 className="font-bold text-lg mb-1 line-clamp-1">{dish.name}</h3>
                <p className="text-sm text-gray-500 mb-2">{dish.restaurant}</p>
                <div className="flex justify-between items-center">
                  <p className="font-bold text-orange-500">${dish.price.toFixed(2)}</p>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-full">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="bg-orange-100 text-orange-500 mb-2">Simple Steps</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Getting your favorite food delivered to your doorstep is easier than ever
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Choose a Restaurant",
                description: "Browse through hundreds of restaurants and cuisines near you.",
                icon: <Search className="h-8 w-8 text-orange-500" />,
              },
              {
                step: "02",
                title: "Place Your Order",
                description: "Select your favorite dishes and add them to your cart.",
                icon: <ShoppingBag className="h-8 w-8 text-orange-500" />,
              },
              {
                step: "03",
                title: "Enjoy Your Food",
                description: "Your order will be delivered to your doorstep in no time.",
                icon: <Utensils className="h-8 w-8 text-orange-500" />,
              },
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="bg-orange-50 rounded-xl p-8 relative z-10">
                  <div className="absolute -top-4 -left-4 h-12 w-12 bg-orange-500 text-white rounded-lg flex items-center justify-center font-bold text-xl">
                    {step.step}
                  </div>
                  <div className="h-16 w-16 bg-orange-100 rounded-full flex items-center justify-center mb-4 mt-4">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>

                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 z-0">
                    <ArrowRight className="h-8 w-8 text-orange-300" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="bg-orange-100 text-orange-500 mb-2">Testimonials</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Customers Say</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Don't just take our word for it, hear what our satisfied customers have to say
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < testimonial.rating ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
                    />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 italic">"{testimonial.text}"</p>
                <div className="flex items-center gap-3">
                  <img
                    src={testimonial.image || "/placeholder.svg"}
                    alt={testimonial.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-bold">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500">Happy Customer</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* App Download Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-orange-600 to-amber-600 text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="md:w-1/2 mb-10 md:mb-0"
            >
              <Badge className="bg-white text-orange-500 mb-4">Mobile App</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Download Our App For <br />
                <span className="text-amber-200">Easy Food Ordering</span>
              </h2>
              <p className="text-lg mb-8 text-orange-100 max-w-md">
                Get the full experience with our mobile app. Order food, track delivery, and get exclusive deals.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="bg-black hover:bg-gray-900 text-white h-14 px-6 flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M17.707 10.708L16.293 9.294l-2.293 2.293-2.293-2.293-1.414 1.414 2.293 2.293-2.293 2.293 1.414 1.414 2.293-2.293 2.293 2.293 1.414-1.414-2.293-2.293z" />
                    <path
                      d="M18.944 2.038c-.192-.193-.464-.283-.79-.283-.217 0-.446.06-.68.173-.75.363-1.52 1.025-2.16 1.682-.518.535-.938 1.068-1.22 1.523-.308.5-.434.86-.434 1.2 0 .354.14.66.42.915.28.256.63.397 1.04.397.39 0 .75-.15 1.06-.433.31-.286.71-.702 1.19-1.246.48-.544.87-1.142 1.17-1.763.3-.62.45-1.18.45-1.67 0-.4-.14-.72-.42-.96l-.63.465zm-2.76 2.96c-.34.435-.66.78-.93 1.04-.27.26-.46.39-.57.39-.06 0-.12-.02-.17-.07-.05-.04-.08-.11-.08-.2 0-.14.07-.36.22-.66.15-.3.37-.63.67-.99.3-.36.6-.68.9-.96.3-.
28.55-.48.74-.6.1-.06.18-.09.25-.09.08 0 .14.03.19.08.05.05.08.11.08.19 0 .12-.05.3-.16.53-.11.23-.27.5-.49.81-.22.31-.42.57-.62.77z"
                    />
                    <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" />
                  </svg>
                  <div className="text-left">
                    <p className="text-xs">Download on the</p>
                    <p className="font-medium">App Store</p>
                  </div>
                </Button>
                <Button className="bg-black hover:bg-gray-900 text-white h-14 px-6 flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M3.609 1.814L13.792 12 3.609 22.186c-.181.181-.29.423-.29.684v.065c0 .26.109.503.29.684.181.181.423.29.684.29h.065c.26 0 .503-.109.684-.29L15.207 13.06c.181-.181.29-.423.29-.684v-.065c0-.26-.109-.503-.29-.684L5.042 1.29c-.181-.181-.423-.29-.684-.29h-.065c-.26 0-.503.109-.684.29z" />
                  </svg>
                  <div className="text-left">
                    <p className="text-xs">GET IT ON</p>
                    <p className="font-medium">Google Play</p>
                  </div>
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="md:w-1/2 flex justify-center"
            >
              <img
                src="/placeholder.svg?height=500&width=300"
                alt="Mobile App"
                className="max-h-[500px] rounded-xl shadow-2xl"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="about" className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                <Badge className="bg-orange-100 text-orange-500 mb-4 w-fit">Get Started</Badge>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Order Your Favorite Food?</h2>
                <p className="text-gray-600 mb-8">
                  Create an account now and get your first delivery fee waived. Plus, receive exclusive offers and
                  discounts!
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/register">
                    <Button className="bg-orange-500 hover:bg-orange-600 text-white font-medium h-12 px-6">
                      Sign Up Now
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button variant="outline" className="font-medium h-12 px-6">
                      Log In
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="md:w-1/2 bg-orange-500 p-8 md:p-12 flex flex-col justify-center text-white">
                <h3 className="text-2xl font-bold mb-6">Why Join FoodHub?</h3>
                <ul className="space-y-4">
                  {[
                    "Free delivery on your first 3 orders",
                    "Exclusive restaurant deals and discounts",
                    "24/7 customer support",
                    "Loyalty rewards program",
                    "Easy tracking of your orders",
                  ].map((item, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="flex items-center gap-3"
                    >
                      <div className="h-6 w-6 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="h-4 w-4 text-orange-500" />
                      </div>
                      <span>{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white pt-16 pb-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Pizza className="h-8 w-8 text-orange-500" />
                <span className="font-bold text-xl">FoodHub</span>
              </div>
              <p className="text-gray-400 mb-6">
                Delivering delicious food from the best restaurants to your doorstep.
              </p>
              <div className="flex gap-4">
                {["facebook", "twitter", "instagram", "youtube"].map((social) => (
                  <a
                    key={social}
                    href="#"
                    className="h-10 w-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-orange-500 transition-colors"
                  >
                    <span className="sr-only">{social}</span>
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.477 2 2 6.477 2 12c0 5.523 4.477 10 10 10s10-4.477 10-10c0-5.523-4.477-10-10-10z" />
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-6">Quick Links</h3>
              <ul className="space-y-4">
                {["Home", "About Us", "Restaurants", "How It Works", "FAQs"].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-6">Contact Us</h3>
              <ul className="space-y-4 text-gray-400">
                <li className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <span>123 Food Street, Cuisine City, FC 12345</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-orange-500 flex-shrink-0" />
                  <span>+1 (555) 123-4567</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-orange-500 flex-shrink-0"
                  >
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                  <span>support@foodhub.com</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-6">Newsletter</h3>
              <p className="text-gray-400 mb-4">Subscribe to our newsletter for the latest updates and offers.</p>
              <div className="flex">
                <Input
                  placeholder="Your email"
                  className="bg-gray-800 border-gray-700 text-white rounded-r-none focus-visible:ring-orange-500"
                />
                <Button className="bg-orange-500 hover:bg-orange-600 rounded-l-none">Subscribe</Button>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm mb-4 md:mb-0">
                © {new Date().getFullYear()} FoodHub. All rights reserved.
              </p>
              <div className="flex gap-6">
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Privacy Policy
                </a>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Terms of Service
                </a>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Cookie Policy
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

