import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

// Create a single instance of the Supabase client that persists across renders
let supabaseInstance = null

export function getSupabaseClient() {
  if (typeof window === "undefined") {
    // Server-side - create a new instance each time
    return createClientComponentClient()
  }

  // Client-side - use singleton pattern
  if (!supabaseInstance) {
    supabaseInstance = createClientComponentClient()
  }

  return supabaseInstance
}
