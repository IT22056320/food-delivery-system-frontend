import { Inter } from "next/font/google"
import { AuthProvider } from "@/context/auth-context"
import { CartProvider } from "@/hooks/use-cart"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "FoodHub - Food Delivery",
  description: "Order food from your favorite restaurants",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <CartProvider>{children}</CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
