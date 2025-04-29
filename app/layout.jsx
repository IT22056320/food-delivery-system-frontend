import { Inter } from "next/font/google"
import { AuthProvider } from "@/context/auth-context"
import { CartProvider } from "@/hooks/use-cart"
import "./globals.css"
import GoogleMapsLoader from "@/components/google-maps-loader"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "FoodHub - Food Delivery",
  description: "Order food from your favorite restaurants",
}

export default function RootLayout({ children }) {

  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "YOUR_GOOGLE_MAPS_API_KEY"
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <GoogleMapsLoader apiKey={googleMapsApiKey}>
            <CartProvider>{children}</CartProvider>
          </GoogleMapsLoader>
        </AuthProvider>
      </body>
    </html>
  )
}
