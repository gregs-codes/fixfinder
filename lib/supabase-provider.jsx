"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { getSupabaseClient } from "./supabase-singleton"

const Context = createContext(undefined)

export function SupabaseProvider({ children }) {
  // Use the singleton instance
  const [supabase] = useState(() => getSupabaseClient())
  const [user, setUser] = useState(null)
  const [userDetails, setUserDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [authChangeComplete, setAuthChangeComplete] = useState(false)

  const fetchUserProfile = async (userId) => {
    try {
      // Use proper headers and format for the request
      const { data, error: profileError } = await supabase.from("users").select("*").eq("id", userId).single()

      if (profileError) {
        console.error("Error fetching user profile:", profileError)
        setError(profileError)
        return null
      }

      return data
    } catch (err) {
      console.error("Error in profile fetch:", err)
      setError(err)
      return null
    }
  }

  useEffect(() => {
    const getUser = async () => {
      try {
        setLoading(true)
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) {
          console.error("Error getting session:", sessionError)
          setError(sessionError)
          setLoading(false)
          setAuthChangeComplete(true)
          return
        }

        setUser(session?.user || null)

        if (session?.user) {
          const profileData = await fetchUserProfile(session.user.id)
          setUserDetails(profileData)
        }

        setLoading(false)
        setAuthChangeComplete(true)
      } catch (err) {
        console.error("Error in getUser:", err)
        setError(err)
        setLoading(false)
        setAuthChangeComplete(true)
      }
    }

    getUser()

    try {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.email)
        setUser(session?.user || null)

        if (session?.user) {
          const profileData = await fetchUserProfile(session.user.id)
          setUserDetails(profileData)
        } else {
          setUserDetails(null)
        }

        setLoading(false)
        setAuthChangeComplete(true)
      })

      return () => {
        subscription?.unsubscribe()
      }
    } catch (err) {
      console.error("Error setting up auth state change listener:", err)
      setError(err)
      setLoading(false)
      setAuthChangeComplete(true)
    }
  }, [supabase])

  return (
    <Context.Provider
      value={{
        supabase,
        user,
        userDetails,
        loading,
        error,
        authChangeComplete,
      }}
    >
      {children}
    </Context.Provider>
  )
}

export function useSupabase() {
  const context = useContext(Context)
  if (context === undefined) {
    throw new Error("useSupabase must be used inside SupabaseProvider")
  }
  return context
}
