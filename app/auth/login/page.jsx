"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSupabase } from "@/lib/supabase-provider"
import { useToast } from "@/components/ui/toast-provider"

export default function Login() {
  const { supabase, error: supabaseError } = useSupabase()
  const router = useRouter()
  const { addToast } = useToast()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [needsVerification, setNeedsVerification] = useState(false)

  // Add this useEffect hook after the state declarations
  useEffect(() => {
    // Check if demo accounts exist and create them if needed
    const checkDemoAccounts = async () => {
      try {
        // Try to sign in with demo client account to check if it exists
        const { error: clientError } = await supabase.auth.signInWithPassword({
          email: "demo.client@example.com",
          password: "demo123password",
        })

        // If there's an error, the account might not exist
        if (clientError) {
          console.log("Demo client account might not exist")
        }

        // Try to sign in with demo provider account to check if it exists
        const { error: providerError } = await supabase.auth.signInWithPassword({
          email: "demo.provider@example.com",
          password: "demo123password",
        })

        // If there's an error, the account might not exist
        if (providerError) {
          console.log("Demo provider account might not exist")
        }

        // Sign out if we managed to sign in during the check
        await supabase.auth.signOut()
      } catch (err) {
        console.error("Error checking demo accounts:", err)
      }
    }

    // Only run this check once when the component mounts
    checkDemoAccounts()
  }, [supabase])

  // For demo purposes, let's add a function to log in with a demo account
  const loginWithDemo = async (type) => {
    setLoading(true)
    setError(null)

    try {
      let demoEmail, demoPassword

      if (type === "client") {
        demoEmail = "demo.client@example.com"
        demoPassword = "demo123password" // Update with correct credentials
      } else {
        demoEmail = "demo.provider@example.com"
        demoPassword = "demo123password" // Update with correct credentials
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: demoEmail,
        password: demoPassword,
      })

      if (error) {
        throw error
      }

      addToast(`Successfully logged in as demo ${type}!`, "success")
      router.push("/dashboard")
    } catch (err) {
      console.error("Demo login error:", err)
      setError(`Demo accounts are not available at the moment. Please use regular login or create a new account.`)
      addToast(
        `Demo accounts are not available at the moment. Please use regular login or create a new account.`,
        "error",
      )
    } finally {
      setLoading(false)
    }
  }

  // Update the handleLogin function to provide better error messages
  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setNeedsVerification(false)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      addToast("Successfully logged in!", "success")
      router.push("/dashboard")
    } catch (err) {
      console.error("Login error:", err)

      // Provide more specific error messages
      if (err.message.includes("Email not confirmed")) {
        setNeedsVerification(true)
        setError("Your email has not been verified. Please check your inbox for a verification link.")
        addToast("Your email has not been verified. Please check your inbox for a verification link.", "error")
      } else if (err.message.includes("Invalid login credentials")) {
        setError("Invalid email or password. Please check your credentials and try again.")
        addToast("Invalid email or password. Please check your credentials and try again.", "error")
      } else {
        setError(err.message || "An error occurred during login")
        addToast(err.message || "An error occurred during login", "error")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleResendVerification = async () => {
    if (!email) {
      setError("Please enter your email address to resend verification")
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email,
      })

      if (error) throw error

      addToast("Verification email resent. Please check your inbox.", "success")
    } catch (err) {
      console.error("Error resending verification:", err)
      setError(err.message || "Failed to resend verification email")
      addToast(err.message || "Failed to resend verification email", "error")
    } finally {
      setLoading(false)
    }
  }

  if (supabaseError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-md">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">Authentication Error</h2>
            <p className="mt-2 text-center text-sm text-red-600">
              There was an error with the authentication system. Please try again later.
            </p>
          </div>
          <div className="flex justify-center">
            <Link href="/" className="btn-primary">
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">Sign in to your account</h2>
          <p className="mt-2 text-center text-sm text-slate-600">
            Or{" "}
            <Link href="/auth/register" className="font-medium text-teal-600 hover:text-teal-500">
              create a new account
            </Link>
          </p>
        </div>

        {/* Demo accounts section */}
        <div className="border-t border-b border-slate-200 py-4">
          <p className="text-center text-sm text-slate-600 mb-3">Try a demo account:</p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <button onClick={() => loginWithDemo("client")} disabled={loading} className="btn-outline text-sm">
              Demo Client
            </button>
            <button onClick={() => loginWithDemo("provider")} disabled={loading} className="btn-outline text-sm">
              Demo Provider
            </button>
          </div>
          <p className="text-center text-xs text-slate-500 mt-2">
            Note: Demo accounts may not be available in all environments.
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{error}</p>
            {needsVerification && (
              <button
                onClick={handleResendVerification}
                disabled={loading}
                className="mt-2 text-sm font-medium text-red-800 hover:text-red-900"
              >
                Resend verification email
              </button>
            )}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-slate-300 placeholder-slate-500 text-slate-900 rounded-t-md focus:outline-none focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-slate-300 placeholder-slate-500 text-slate-900 rounded-b-md focus:outline-none focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-slate-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-900">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <Link href="/auth/forgot-password" className="font-medium text-teal-600 hover:text-teal-500">
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-teal-300"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
