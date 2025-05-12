"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

// Create a single instance of the Supabase client
let supabaseInstance = null

const getSupabaseClient = () => {
  if (!supabaseInstance) {
    supabaseInstance = createClientComponentClient()
  }
  return supabaseInstance
}

const Context = createContext(undefined)

export function SupabaseProvider({ children }) {
  // Use the singleton instance
  const [supabase] = useState(() => getSupabaseClient())
  const [user, setUser] = useState(null)
  const [userDetails, setUserDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) {
          console.error("Error getting session:", sessionError)
          setError(sessionError)
          setLoading(false)
          return
        }

        setUser(session?.user || null)

        if (session?.user) {
          try {
            const { data, error: profileError } = await supabase
              .from("users")
              .select("*")
              .eq("id", session.user.id)
              .single()

            if (profileError) {
              console.error("Error fetching user profile:", profileError)
              setError(profileError)
            } else {
              setUserDetails(data || null)
            }
          } catch (err) {
            console.error("Error in profile fetch:", err)
            setError(err)
          }
        }

        setLoading(false)
      } catch (err) {
        console.error("Error in getUser:", err)
        setError(err)
        setLoading(false)
      }
    }

    getUser()

    try {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        setUser(session?.user || null)

        if (session?.user) {
          try {
            const { data, error: profileError } = await supabase
              .from("users")
              .select("*")
              .eq("id", session.user.id)
              .single()

            if (profileError) {
              console.error("Error fetching user profile on auth change:", profileError)
              setError(profileError)
            } else {
              setUserDetails(data || null)
            }
          } catch (err) {
            console.error("Error in profile fetch on auth change:", err)
            setError(err)
          }
        } else {
          setUserDetails(null)
        }

        setLoading(false)
      })

      return () => {
        subscription?.unsubscribe()
      }
    } catch (err) {
      console.error("Error setting up auth state change listener:", err)
      setError(err)
      setLoading(false)
    }
  }, [supabase])

  return <Context.Provider value={{ supabase, user, userDetails, loading, error }}>{children}</Context.Provider>
}

export function useSupabase() {
  const context = useContext(Context)
  if (context === undefined) {
    throw new Error("useSupabase must be used inside SupabaseProvider")
  }
  return context
}
