import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

// Simple delay function for retries
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export async function POST(request) {
  let requestData = null
  try {
    requestData = await request.json()
    const { user_id, email, full_name, is_provider } = requestData

    if (!user_id || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    console.log("Creating user:", user_id, email)

    // Create a Supabase client
    const supabase = createRouteHandlerClient({ cookies })

    // Create a fallback user object
    const fallbackUser = {
      id: user_id,
      email,
      full_name: full_name || email.split("@")[0],
      is_provider: is_provider || false,
      is_admin: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      _isFallback: true,
    }

    // Check again if the user exists (double-check)
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("*")
      .eq("id", user_id)
      .maybeSingle()

    if (checkError) {
      console.error("Error checking for existing user:", checkError)
    } else if (existingUser) {
      console.log("User already exists, returning existing user")
      return NextResponse.json({ success: true, data: existingUser })
    }

    // Try to create the user with retries for rate limiting
    let retries = 3
    let lastError = null

    while (retries > 0) {
      try {
        // Try to insert the user
        const { data, error } = await supabase
          .from("users")
          .insert({
            id: user_id,
            email,
            full_name: full_name || email.split("@")[0],
            is_provider: is_provider || false,
            is_admin: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (error) {
          // If it's an RLS error, we'll use the fallback
          if (error.message.includes("violates row-level security policy")) {
            console.warn("RLS policy violation, using fallback user")
            return NextResponse.json({
              success: false,
              error: error.message,
              fallbackData: fallbackUser,
            })
          }
          throw error
        }

        console.log("User created successfully:", data.id)
        return NextResponse.json({ success: true, data })
      } catch (error) {
        lastError = error
        console.error(`Attempt ${4 - retries}/3 failed:`, error)

        // If it's a rate limit error, wait and retry
        if (
          error.message?.includes("Too Many Requests") ||
          error.status === 429 ||
          (typeof error.message === "string" && error.message.includes("Too Many R"))
        ) {
          retries--
          if (retries > 0) {
            // Exponential backoff: 1s, 2s, 4s
            const backoffTime = 1000 * Math.pow(2, 3 - retries)
            console.log(`Rate limited, retrying in ${backoffTime}ms...`)
            await delay(backoffTime)
            continue
          }
        } else {
          // For other errors, don't retry
          break
        }
      }
    }

    // If we get here, all attempts failed
    console.error("All attempts to create user failed:", lastError)
    return NextResponse.json({
      success: false,
      error: lastError?.message || "Failed to create user after multiple attempts",
      fallbackData: fallbackUser,
    })
  } catch (error) {
    console.error("Server error creating user:", error)
    // Return a generic fallback user to prevent app from breaking
    const fallbackUser = {
      id: requestData?.user_id,
      email: requestData?.email || "unknown@example.com",
      full_name: requestData?.full_name || "Unknown User",
      is_provider: false,
      is_admin: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      _isFallback: true,
    }
    return NextResponse.json({
      success: false,
      error: "Internal server error",
      fallbackData: fallbackUser,
    })
  }
}
