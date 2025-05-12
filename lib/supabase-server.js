import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

// This is used only on the server side, so no singleton pattern is needed
// Each server request should have its own instance for security
export function createServerSupabase() {
  try {
    const cookieStore = cookies()
    return createServerComponentClient({ cookies: () => cookieStore })
  } catch (error) {
    console.error("Error creating server supabase client:", error)
    // Return a dummy client that won't break the app but will return empty data
    return {
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            single: async () => ({ data: null, error: null }),
            order: () => ({ data: [], error: null }),
            data: [],
            error: null,
          }),
          order: () => ({ data: [], error: null }),
          data: [],
          error: null,
        }),
      }),
    }
  }
}
