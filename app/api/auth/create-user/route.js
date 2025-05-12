import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request) {
  try {
    const requestData = await request.json()
    const { user_id, email, full_name, is_provider } = requestData

    // Create a Supabase client with server-side privileges
    const supabase = createRouteHandlerClient({ cookies })

    // Insert the user into the users table
    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          id: user_id,
          email,
          full_name,
          is_provider: is_provider || false,
          is_admin: false,
        },
      ])
      .select()

    if (error) {
      console.error("Error creating user profile:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Server error creating user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
