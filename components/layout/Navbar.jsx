"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSupabase } from "@/lib/supabase-provider"
import { Menu, X, User, LogOut } from "lucide-react"

export default function Navbar() {
  const { user, userDetails, supabase, loading, error } = useSupabase()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const isActive = (path) => {
    return pathname === path ? "text-teal-600" : "text-slate-700 hover:text-teal-600"
  }

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-teal-600">FixIt</span>
              <span className="text-2xl font-bold text-indigo-600">Finder</span>
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/browse" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive("/browse")}`}>
              Find Help
            </Link>
            <Link href="/projects" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive("/projects")}`}>
              Projects
            </Link>
            {!loading && user ? (
              <>
                <Link
                  href="/dashboard"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${isActive("/dashboard")}`}
                >
                  Dashboard
                </Link>
                <Link href="/chat" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive("/chat")}`}>
                  Messages
                </Link>
                <div className="relative ml-3">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={handleSignOut}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                    >
                      <LogOut className="h-4 w-4 mr-1" />
                      Sign out
                    </button>
                    <Link
                      href={user ? `/profile/${user.id.substring(0, 8)}` : "/profile"}
                      className="flex items-center"
                    >
                      <div className="h-8 w-8 rounded-full bg-teal-500 flex items-center justify-center text-white">
                        <User className="h-5 w-5" />
                      </div>
                    </Link>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:text-teal-600"
                >
                  Login
                </Link>
                <Link href="/auth/register" className="btn-primary">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-700 hover:text-teal-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              href="/browse"
              className={`block px-3 py-2 rounded-md text-base font-medium ${isActive("/browse")}`}
              onClick={toggleMenu}
            >
              Find Help
            </Link>
            <Link
              href="/projects"
              className={`block px-3 py-2 rounded-md text-base font-medium ${isActive("/projects")}`}
              onClick={toggleMenu}
            >
              Projects
            </Link>
            {!loading && user ? (
              <>
                <Link
                  href="/dashboard"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${isActive("/dashboard")}`}
                  onClick={toggleMenu}
                >
                  Dashboard
                </Link>
                <Link
                  href="/chat"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${isActive("/chat")}`}
                  onClick={toggleMenu}
                >
                  Messages
                </Link>
                <Link
                  href={user ? `/profile/${user.id.substring(0, 8)}` : "/profile"}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${isActive("/profile")}`}
                  onClick={toggleMenu}
                >
                  Profile
                </Link>
                <button
                  onClick={() => {
                    handleSignOut()
                    toggleMenu()
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-teal-600 hover:bg-slate-100"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-teal-600"
                  onClick={toggleMenu}
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="block px-3 py-2 rounded-md text-base font-medium bg-teal-600 text-white hover:bg-teal-700"
                  onClick={toggleMenu}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
