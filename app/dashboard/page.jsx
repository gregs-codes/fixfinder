export const dynamic = "force-dynamic"

import { createServerSupabase } from "@/lib/supabase-server"
import ClientDashboard from "@/components/dashboard/ClientDashboard"
import ProviderDashboard from "@/components/dashboard/ProviderDashboard"
import AuthRequired from "@/components/auth/AuthRequired"

export default async function Dashboard() {
  const supabase = createServerSupabase()
  let user = null
  let error = null

  try {
    // Check if user is authenticated
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      console.error("Error getting session:", sessionError)
      error = sessionError
    } else if (session) {
      // Get user details
      const { data, error: userError } = await supabase.from("users").select("*").eq("id", session.user.id).single()

      if (userError) {
        console.error("Error fetching user:", userError)
        error = userError
      } else {
        user = data
      }
    }
  } catch (err) {
    console.error("Error in Dashboard:", err)
    error = err
  }

  return (
    <AuthRequired>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

        {error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>Error loading dashboard: {error.message || "Please try again later."}</p>
          </div>
        ) : user ? (
          user.is_provider ? (
            <ProviderDashboard userId={user.id} />
          ) : (
            <ClientDashboard userId={user.id} />
          )
        ) : (
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <p className="text-slate-600">Loading user data...</p>
          </div>
        )}
      </div>
    </AuthRequired>
  )
}
