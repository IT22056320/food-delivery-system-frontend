import "@/styles/globals.css";
import { AuthProvider } from "@/context/auth-context"; // ✅ Import your AuthProvider

export const metadata = {
  title: "Foode Auth Portal",
  description: "Secure login for admins and users",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
