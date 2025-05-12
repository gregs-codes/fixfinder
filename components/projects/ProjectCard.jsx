"use client"

import { useQueryClient } from "@tanstack/react-query"
import Link from "next/link"
import { Calendar, MapPin, DollarSign } from "lucide-react"
import { prefetchProject } from "@/utils/prefetch-utils"

export default function ProjectCard({ project }) {
  const queryClient = useQueryClient()

  const handleMouseEnter = () => {
    // Prefetch the project data when hovering over the card
    prefetchProject(queryClient, project.id)
  }

  if (!project) return null

  const statusColors = {
    open: "bg-green-100 text-green-800",
    in_progress: "bg-blue-100 text-blue-800",
    completed: "bg-gray-100 text-gray-800",
    cancelled: "bg-red-100 text-red-800",
  }

  return (
    <Link
      href={`/projects/${project.id}`}
      className="block hover:shadow-lg transition-shadow"
      onMouseEnter={handleMouseEnter}
    >
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-semibold">{project.title}</h3>
            <span className={`badge ${statusColors[project.status]}`}>
              {project.status.replace("_", " ").charAt(0).toUpperCase() + project.status.replace("_", " ").slice(1)}
            </span>
          </div>

          <p className="text-slate-600 mb-4 line-clamp-2">{project.description}</p>

          <div className="flex flex-wrap gap-3 text-sm text-slate-500">
            {project.category && (
              <div className="flex items-center">
                <span className="mr-1">{project.category.icon}</span>
                <span>{project.category.name}</span>
              </div>
            )}

            <div className="flex items-center">
              <DollarSign className="h-4 w-4 mr-1" />
              <span>${project.budget}</span>
            </div>

            {project.location && (
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{project.location}</span>
              </div>
            )}

            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{new Date(project.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
