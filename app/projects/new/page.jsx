"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSupabase } from "@/lib/supabase-provider"
import { useToast } from "@/components/ui/toast-provider"

export default function NewProject() {
  const { supabase, user, userDetails, loading } = useSupabase()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { addToast } = useToast()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [budget, setBudget] = useState("")
  const [location, setLocation] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [categories, setCategories] = useState([])
  const [submitting, setSubmitting] = useState(false)

  // Get provider ID from query params if available
  const providerId = searchParams.get("provider")

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!loading && !user) {
      router.push("/auth/login")
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

    // Set user's location if available
    if (userDetails?.location) {
      setLocation(userDetails.location)
    }
  }, [supabase, user, loading, router, userDetails])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!user) {
      addToast("You must be logged in to post a project", "error")
      return
    }

    setSubmitting(true)

    try {
      // Create the project
      const { data: project, error } = await supabase
        .from("projects")
        .insert({
          client_id: user.id,
          category_id: categoryId ? Number.parseInt(categoryId) : null,
          title,
          description,
          budget: Number.parseFloat(budget),
          location,
          status: "open",
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      // If a provider was specified, create a chat with them
      if (providerId && project) {
        // Create a new chat
        const { data: chat, error: chatError } = await supabase.from("chats").insert({}).select().single()

        if (chatError) {
          throw chatError
        }

        // Add both users as participants
        const { error: participantsError } = await supabase.from("chat_participants").insert([
          { chat_id: chat.id, user_id: user.id },
          { chat_id: chat.id, user_id: providerId },
        ])

        if (participantsError) {
          throw participantsError
        }

        // Send initial message
        const { error: messageError } = await supabase.from("messages").insert({
          chat_id: chat.id,
          sender_id: user.id,
          content: `I've just posted a new project: "${title}". Would you be interested in providing a quote?`,
        })

        if (messageError) {
          throw messageError
        }
      }

      addToast("Project posted successfully!", "success")
      router.push("/dashboard")
    } catch (error) {
      addToast(error.message || "Failed to post project", "error")
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
          <h1 className="text-3xl font-bold mb-6">Post a New Project</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">
                Project Title
              </label>
              <input
                type="text"
                id="title"
                className="input w-full"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="e.g., Bathroom Plumbing Repair"
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
                Project Description
              </label>
              <textarea
                id="description"
                rows={5}
                className="input w-full"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                placeholder="Describe your project in detail. Include what needs to be done, materials required, timeline, etc."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="budget" className="block text-sm font-medium text-slate-700 mb-1">
                  Budget ($)
                </label>
                <input
                  type="number"
                  id="budget"
                  className="input w-full"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  required
                  min="0"
                  step="0.01"
                  placeholder="e.g., 500"
                />
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-slate-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  className="input w-full"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., New York, NY or 10001"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button type="button" onClick={() => router.back()} className="btn-outline" disabled={submitting}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? "Posting..." : "Post Project"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
