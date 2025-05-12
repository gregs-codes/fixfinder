"use client"

import Link from "next/link"
import { useSupabase } from "@/lib/supabase-provider"

export default function AuthRequired({ children }) {
  const { user, loading, error } = useSupabase()

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-md p-6 text-center">
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h2>
          <p className="text-slate-600 mb-4">
            There was an error with the authentication system. Please try again later.
          </p>
          <div className="flex justify-center">
            <Link href="/" className="btn-primary">
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-md p-6 text-center">
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="text-slate-600 mb-6">
            You need to be logged in to access this page. Please log in or create an account.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/auth/login" className="btn-primary">
              Log In
            </Link>
            <Link href="/auth/register" className="btn-outline">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return children
}
