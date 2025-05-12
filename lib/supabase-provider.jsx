"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { getSupabaseClient } from "./supabase-singleton"

const Context = createContext(undefined)

// Cache for user profiles to reduce API calls
const userProfileCache = new Map()

export function SupabaseProvider({ children }) {
  const [supabase] = useState(() => getSupabaseClient())
  const [user, setUser] = useState(null)
  const [userDetails, setUserDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [authChangeComplete, setAuthChangeComplete] = useState(false)

  const fetchUserProfile = async (userId) => {
    try {
      // Check cache first
      if (userProfileCache.has(userId)) {
        console.log("Using cached user profile")
        return userProfileCache.get(userId)
      }

      console.log("Fetching user profile for:", userId)

      // First try to get the user with the service role key if available
      // This bypasses RLS policies
      let userData = null

      try {
        // Try to get user with normal client (subject to RLS)
        const { data, error: profileError } = await supabase.from("users").select("*").eq("id", userId).maybeSingle()

        if (profileError) {
          console.warn("Error fetching user with client:", profileError)
          // We'll continue and try the API route
        } else if (data) {
          console.log("Found user in database:", data.id)
          userData = data
        }
      } catch (err) {
        console.warn("Error in client user fetch:", err)
        // Continue to API route
      }

      // If we found the user, cache and return
      if (userData) {
        userProfileCache.set(userId, userData)
        return userData
      }

      // If we couldn't find the user with the client, try the API route
      // which can use the service role key
      console.log("User not found with client, trying API route")

      // Get auth user for metadata
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (!authUser) {
        console.error("No authenticated user found")
        return null
      }

      // Create a fallback user object in case API fails
      const fallbackUser = {
        id: userId,
        email: authUser.email,
        full_name: authUser.user_metadata?.full_name || authUser.email?.split("@")[0] || "New User",
        is_provider: authUser.user_metadata?.is_provider || false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        _isFallback: true,
      }

      try {
        // First check if user exists via API
        const checkResponse = await fetch(`/api/users/check?userId=${userId}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        })

        let checkResult
        try {
          checkResult = await checkResponse.json()
        } catch (jsonError) {
          console.error("Error parsing check response:", jsonError)
          userProfileCache.set(userId, fallbackUser)
          return fallbackUser
        }

        // If user exists, return it
        if (checkResult.exists && checkResult.data) {
          console.log("User found via API check:", checkResult.data.id)
          userProfileCache.set(userId, checkResult.data)
          return checkResult.data
        }

        // If user doesn't exist, create it
        console.log("User not found, creating via API")
        const createResponse = await fetch("/api/users/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
            email: authUser.email,
            full_name: authUser.user_metadata?.full_name || authUser.email?.split("@")[0] || "New User",
            is_provider: authUser.user_metadata?.is_provider || false,
          }),
        })

        let createResult
        try {
          createResult = await createResponse.json()
        } catch (jsonError) {
          console.error("Error parsing create response:", jsonError)
          userProfileCache.set(userId, fallbackUser)
          return fallbackUser
        }

        if (createResult.success && createResult.data) {
          console.log("User created successfully:", createResult.data.id)
          userProfileCache.set(userId, createResult.data)
          return createResult.data
        }

        // If creation failed but we have fallback data
        if (createResult.fallbackData) {
          console.log("Using fallback data from API")
          userProfileCache.set(userId, createResult.fallbackData)
          return createResult.fallbackData
        }

        // Last resort fallback
        console.log("Using local fallback user")
        userProfileCache.set(userId, fallbackUser)
        return fallbackUser
      } catch (err) {
        console.error("Error in API operations:", err)
        userProfileCache.set(userId, fallbackUser)
        return fallbackUser
      }
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
