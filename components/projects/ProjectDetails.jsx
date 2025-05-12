"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSupabase } from "@/lib/supabase-provider"
import { useToast } from "@/components/ui/toast-provider"
import { Calendar, MapPin, DollarSign } from "lucide-react"

export default function ProjectDetails({ project, isClient, userId }) {
  const { supabase } = useSupabase()
  const router = useRouter()
  const { addToast } = useToast()
  const [updating, setUpdating] = useState(false)

  const handleStatusChange = async (newStatus) => {
    if (!isClient) return

    setUpdating(true)

    try {
      const { error } = await supabase.from("projects").update({ status: newStatus }).eq("id", project.id)

      if (error) {
        throw error
      }

      addToast(`Project marked as ${newStatus}`, "success")
      router.refresh()
    } catch (error) {
      addToast(error.message || "Failed to update project status", "error")
    } finally {
      setUpdating(false)
    }
  }

  const statusColors = {
    open: "bg-indigo-100 text-indigo-800",
    in_progress: "bg-teal-100 text-teal-800",
    completed: "bg-slate-100 text-slate-800",
    cancelled: "bg-red-100 text-red-800",
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">{project.title}</h1>

          <div className="mt-2 md:mt-0 flex items-center">
            <span className={`badge ${statusColors[project.status]}`}>
              {project.status.replace("_", " ").charAt(0).toUpperCase() + project.status.replace("_", " ").slice(1)}
            </span>

            {isClient && project.status === "open" && (
              <button
                onClick={() => handleStatusChange("cancelled")}
                disabled={updating}
                className="ml-2 text-sm text-red-600 hover:text-red-800"
              >
                Cancel Project
              </button>
            )}

            {isClient && project.status === "in_progress" && (
              <button
                onClick={() => handleStatusChange("completed")}
                disabled={updating}
                className="ml-2 text-sm text-teal-600 hover:text-teal-800"
              >
                Mark as Completed
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-6">
          {project.category && (
            <div className="flex items-center">
              <span className="text-2xl mr-2">{project.category.icon}</span>
              <span className="text-slate-700">{project.category.name}</span>
            </div>
          )}

          <div className="flex items-center">
            <DollarSign className="h-5 w-5 text-slate-400 mr-1" />
            <span className="text-slate-700 font-semibold">${project.budget}</span>
          </div>

          {project.location && (
            <div className="flex items-center">
              <MapPin className="h-5 w-5 text-slate-400 mr-1" />
              <span className="text-slate-700">{project.location}</span>
            </div>
          )}

          <div className="flex items-center">
            <Calendar className="h-5 w-5 text-slate-400 mr-1" />
            <span className="text-slate-700">Posted on {new Date(project.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Description</h2>
          <div className="text-slate-700 whitespace-pre-line">{project.description}</div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Bids</h2>
          <div className="text-slate-700">
            {project.bids?.length > 0 ? (
              <p>
                {project.bids.length} service provider{project.bids.length !== 1 ? "s" : ""} have bid on this project.
              </p>
            ) : (
              <p>No bids yet. Be the first to bid on this project!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
