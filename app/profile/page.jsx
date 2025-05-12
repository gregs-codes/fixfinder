"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSupabase } from "@/lib/supabase-provider"

export default function ProfileRedirect() {
  const { user, loading } = useSupabase()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (user) {
        // Redirect to edit profile
        router.push("/profile/edit")
      } else {
        // Redirect to login
        router.push("/auth/login?redirect=/profile")
      }
    }
  }, [user, loading, router])

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-xl shadow-md p-6">
        <p className="text-center">Loading...</p>
      </div>
    </div>
  )
}
