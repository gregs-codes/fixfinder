"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSupabase } from "@/lib/supabase-provider"
import { useToast } from "@/components/ui/toast-provider"

export default function NewService() {
  const { supabase, user, userDetails, loading } = useSupabase()
  const router = useRouter()
  const { addToast } = useToast()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [hourlyRate, setHourlyRate] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [categories, setCategories] = useState([])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!loading && !user) {
      router.push("/auth/login")
    }

    // Redirect if not a provider
    if (!loading && userDetails && !userDetails.is_provider) {
      addToast("Only service providers can add services", "error")
      router.push("/dashboard")
    }

    // Fetch categories
    const fetchCategories = async () => {
      const { data } = await supabase.from("categories").select("*").order("name")

      setCategories(data || [])

      // Set default category if available
      if (data?.length > 0) {
        setCategoryId(data[0].id)
      }
    }

    fetchCategories()
  }, [supabase, user, loading, router, userDetails, addToast])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!user) {
      addToast("You must be logged in to add a service", "error")
      return
    }

    if (!userDetails?.is_provider) {
      addToast("Only service providers can add services", "error")
      return
    }

    setSubmitting(true)

    try {
      const { error } = await supabase.from("services").insert({
        provider_id: user.id,
        category_id: Number.parseInt(categoryId),
        title,
        description,
        hourly_rate: Number.parseFloat(hourlyRate),
        is_active: true,
      })

      if (error) {
        throw error
      }

      addToast("Service added successfully!", "success")
      router.push("/dashboard")
    } catch (error) {
      addToast(error.message || "Failed to add service", "error")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-center">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-6">Add a New Service</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">
                Service Title
              </label>
              <input
                type="text"
                id="title"
                className="input w-full"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="e.g., Plumbing Repair"
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-1">
                Category
              </label>
              <select
                id="category"
                className="input w-full"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                rows={4}
                className="input w-full"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                placeholder="Describe your service in detail. Include what you offer, your experience, etc."
              />
            </div>

            <div>
              <label htmlFor="hourly-rate" className="block text-sm font-medium text-slate-700 mb-1">
                Hourly Rate ($)
              </label>
              <input
                type="number"
                id="hourly-rate"
                className="input w-full"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                required
                min="0"
                step="0.01"
                placeholder="e.g., 50"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button type="button" onClick={() => router.back()} className="btn-outline" disabled={submitting}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? "Adding..." : "Add Service"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
