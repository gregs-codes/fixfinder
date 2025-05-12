import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request) {
  try {
    // Get userId from query params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "Missing userId parameter" }, { status: 400 })
    }

    console.log("Checking if user exists:", userId)

    // Create a Supabase client
    const supabase = createRouteHandlerClient({ cookies })

    // Check if the user exists
    const { data, error } = await supabase.from("users").select("*").eq("id", userId).maybeSingle()

    if (error) {
      console.error("Error checking user:", error)
      return NextResponse.json({ exists: false, error: error.message }, { status: 500 })
    }

    if (data) {
      console.log("User found:", data.id)
      return NextResponse.json({ exists: true, data })
    }

    // Try with service role key if available
    try {
      // This would use the service role key if configured in your environment
      // For now, we'll just return not found
      console.log("User not found in database")
      return NextResponse.json({ exists: false })
    } catch (serviceError) {
      console.error("Error with service role check:", serviceError)
      return NextResponse.json({ exists: false, error: "Service role check failed" }, { status: 500 })
    }
  } catch (error) {
    console.error("Server error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
