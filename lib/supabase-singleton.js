import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

// Global variable to store the singleton instance
let supabaseInstance = null

/**
 * Returns a singleton instance of the Supabase client
 * This ensures only one GoTrueClient is created in the browser context
 */
export function getSupabaseClient() {
  // For server-side rendering, always create a new instance
  // This prevents sharing between different user requests
  if (typeof window === "undefined") {
    return createClientComponentClient()
  }

  // For client-side, create the instance once and reuse it
  if (!supabaseInstance) {
    console.log("Creating new Supabase client instance")
    supabaseInstance = createClientComponentClient()
  }

  return supabaseInstance
}

// Export a pre-initialized instance for direct imports
export const supabaseClient = typeof window !== "undefined" ? getSupabaseClient() : null
