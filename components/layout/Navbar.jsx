"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useSupabase } from "@/lib/supabase-provider"
import { Menu, X, User, LogOut, ChevronDown, Settings, Briefcase, LayoutDashboard } from "lucide-react"

export default function Navbar() {
  const { user, userDetails, supabase, loading, error, authChangeComplete } = useSupabase()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [localLoading, setLocalLoading] = useState(true)
  const pathname = usePathname()
  const router = useRouter()
  const userMenuRef = useRef(null)

  useEffect(() => {
    // Only set localLoading to false when authChangeComplete is true
    if (authChangeComplete) {
      setLocalLoading(false)
    }
  }, [authChangeComplete])

  useEffect(() => {
    // Close the user menu when clicking outside
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen)
  }

  const handleSignOut = async () => {
    try {
      setLocalLoading(true)
      await supabase.auth.signOut()
      router.refresh()
      // The auth state change listener will handle updating the UI
    } catch (error) {
      console.error("Error signing out:", error)
      setLocalLoading(false)
    }
  }

  const isActive = (path) => {
    return pathname === path ? "text-teal-600" : "text-slate-700 hover:text-teal-600"
  }

  const getUserName = () => {
    if (userDetails?.full_name) {
      return userDetails.full_name
    }
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name
    }
    return user?.email?.split("@")[0] || "User"
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

            {localLoading ? (
              <div className="flex items-center space-x-3">
                <div className="h-8 w-24 bg-slate-200 animate-pulse rounded-md"></div>
                <div className="h-8 w-8 bg-slate-200 animate-pulse rounded-full"></div>
              </div>
            ) : user ? (
              <>
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={toggleUserMenu}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:text-teal-600 hover:bg-slate-50"
                  >
                    <div className="h-8 w-8 rounded-full bg-teal-500 flex items-center justify-center text-white">
                      <User className="h-5 w-5" />
                    </div>
                    <span>{getUserName()}</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 ring-1 ring-black ring-opacity-5">
                      <Link
                        href="/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        Dashboard
                      </Link>
                      <Link
                        href="/projects"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Briefcase className="h-4 w-4 mr-2" />
                        Projects
                      </Link>
                      <Link
                        href="/chat"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-2"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                        Messages
                      </Link>
                      <Link
                        href={`/profile/${user.id.substring(0, 8)}`}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Profile Settings
                      </Link>
                      <div className="border-t border-gray-100 my-1"></div>
                      <button
                        onClick={() => {
                          handleSignOut()
                          setIsUserMenuOpen(false)
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign out
                      </button>
                    </div>
                  )}
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

            {localLoading ? (
              <div className="px-3 py-2">
                <div className="h-8 w-24 bg-slate-200 animate-pulse rounded-md"></div>
              </div>
            ) : user ? (
              <>
                <Link
                  href="/dashboard"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${isActive("/dashboard")}`}
                  onClick={toggleMenu}
                >
                  <LayoutDashboard className="h-4 w-4 inline mr-2" />
                  Dashboard
                </Link>
                <Link
                  href="/projects"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${isActive("/projects")}`}
                  onClick={toggleMenu}
                >
                  <Briefcase className="h-4 w-4 inline mr-2" />
                  Projects
                </Link>
                <Link
                  href="/chat"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${isActive("/chat")}`}
                  onClick={toggleMenu}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 inline mr-2"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                  Messages
                </Link>
                <Link
                  href={user ? `/profile/${user.id.substring(0, 8)}` : "/profile"}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${isActive("/profile")}`}
                  onClick={toggleMenu}
                >
                  <Settings className="h-4 w-4 inline mr-2" />
                  Profile Settings
                </Link>
                <button
                  onClick={() => {
                    handleSignOut()
                    toggleMenu()
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-teal-600 hover:bg-slate-100"
                >
                  <LogOut className="h-4 w-4 inline mr-2" />
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
