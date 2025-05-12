import { Inter } from "next/font/google"
import "./globals.css"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { SupabaseProvider } from "@/lib/supabase-provider"
import { ToastProvider } from "@/components/ui/toast-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "FixIt Finder - Local Service Marketplace",
  description: "Connect with local service professionals for your home and business needs",
    generator: 'v0.dev'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <SupabaseProvider>
          <ToastProvider>
            <Navbar />
            <main className="flex-grow">{children}</main>
            <Footer />
          </ToastProvider>
        </SupabaseProvider>
      </body>
    </html>
  )
}
