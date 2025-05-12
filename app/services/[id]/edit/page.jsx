"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useSupabase } from "@/lib/supabase-provider"
import { useToast } from "@/components/ui/toast-provider"

export default function EditService() {
  const { supabase, user, loading } = useSupabase()
  const router = useRouter()
  const params = useParams()
  const { addToast } = useToast()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [hourlyRate, setHourlyRate] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [isActive, setIsActive] = useState(true)
  const [categories, setCategories] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [loadingService, setLoadingService] = useState(true)

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!loading && !user) {
      router.push("/auth/login")
    }

    // Fetch service details
    const fetchService = async () => {
      const { data: service, error } = await supabase.from("services").select("*").eq("id", params.id).single()

      if (error || !service) {
        addToast("Service not found", "error")
        router.push("/dashboard")
        return
      }

      // Check if user is the owner of this service
      if (service.provider_id !== user?.id) {
        addToast("You do not have permission to edit this service", "error")
        router.push("/dashboard")
        return
      }

      setTitle(service.title || "")
      setDescription(service.description || "")
      setHourlyRate(service.hourly_rate || "")
      setCategoryId(service.category_id || "")
      setIsActive(service.is_active || false)
      setLoadingService(false)
    }

    // Fetch categories
    const fetchCategories = async () => {
      const { data } = await supabase.from("categories").select("*").order("name")

      setCategories(data || [])
    }

    if (user) {
      fetchService()
      fetchCategories()
    }
  }, [supabase, user, loading, router, params.id, addToast])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!user) {
      addToast("You must be logged in to update a service", "error")
      return
    }

    setSubmitting(true)

    try {
      const { error } = await supabase
        .from("services")
        .update({
          category_id: Number.parseInt(categoryId),
          title,
          description,
          hourly_rate: Number.parseFloat(hourlyRate),
          is_active: isActive,
        })
        .eq("id", params.id)
        .eq("provider_id", user.id)

      if (error) {
        throw error
      }

      addToast("Service updated successfully!", "success")
      router.push("/dashboard")
    } catch (error) {
      addToast(error.message || "Failed to update service", "error")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading || loadingService) {
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
          <h1 className="text-3xl font-bold mb-6">Edit Service</h1>

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
              />
            </div>

            <div className="flex items-center">
              <input
                id="is-active"
                type="checkbox"
                className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-slate-300 rounded"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              <label htmlFor="is-active" className="ml-2 block text-sm text-slate-900">
                Service is active and available for booking
              </label>
            </div>

            <div className="flex justify-end space-x-3">
              <button type="button" onClick={() => router.back()} className="btn-outline" disabled={submitting}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
