"use client"

import { useParams } from "next/navigation"
import { useSupabase } from "@/lib/supabase-provider"
import { useProject } from "@/hooks/use-projects"
import { useBids } from "@/hooks/use-bids"
import ProjectDetails from "@/components/projects/ProjectDetails"
import BidForm from "@/components/projects/BidForm"
import BidsList from "@/components/projects/BidsList"

export default function ProjectPage() {
  const params = useParams()
  const projectId = params.id
  const { user, userDetails } = useSupabase()

  // Fetch project data using React Query
  const { project, isLoading, isError, error, updateProjectStatus, isUpdatingProject } = useProject(projectId)

  // Get bid mutations
  const { addBid, isAddingBid, updateBidStatus, isUpdatingBid } = useBids()

  // Check if user is the client
  const isClient = user?.id === project?.client_id

  // Check if user is a provider who has already bid
  const hasUserBid = project?.bids?.some((bid) => bid.provider_id === user?.id)

  // Check if user is a provider
  const isProvider = userDetails?.is_provider || false

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-12 bg-slate-200 rounded w-1/3"></div>
          <div className="h-64 bg-slate-200 rounded"></div>
          <div className="h-48 bg-slate-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Error loading project: {error?.message || "Project not found"}</p>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Project Not Found</h2>
          <p className="text-slate-600">The project you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Project details */}
        <div className="lg:col-span-2">
          <ProjectDetails
            project={project}
            isClient={isClient}
            userId={user?.id}
            onStatusChange={(newStatus) => updateProjectStatus({ status: newStatus })}
            isUpdating={isUpdatingProject}
          />

          {/* Bids list (visible to client only) */}
          {isClient && project.bids?.length > 0 && (
            <div className="mt-8">
              <BidsList
                bids={project.bids}
                projectId={project.id}
                onAcceptBid={(bidId, providerId) => {
                  // Update bid status
                  updateBidStatus({
                    bidId,
                    updates: { status: "accepted" },
                  })

                  // Update project status
                  updateProjectStatus({
                    status: "in_progress",
                    provider_id: providerId,
                  })

                  // Reject all other bids
                  project.bids
                    .filter((bid) => bid.id !== bidId)
                    .forEach((bid) => {
                      updateBidStatus({
                        bidId: bid.id,
                        updates: { status: "rejected" },
                      })
                    })
                }}
                onRejectBid={(bidId) => {
                  updateBidStatus({
                    bidId,
                    updates: { status: "rejected" },
                  })
                }}
                isUpdating={isUpdatingBid}
              />
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Bid form (for providers who haven't bid yet) */}
          {user && isProvider && !isClient && !hasUserBid && project.status === "open" && (
            <BidForm
              projectId={project.id}
              userId={user.id}
              onSubmit={(bidData) => {
                addBid({
                  project_id: project.id,
                  provider_id: user.id,
                  ...bidData,
                })
              }}
              isSubmitting={isAddingBid}
            />
          )}

          {/* Client info card */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden sticky top-24">
            <div className="p-6">
              <h3 className="font-semibold text-lg mb-4">About the Client</h3>

              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden mr-3">
                  {project.client?.avatar_url ? (
                    <img
                      src={project.client.avatar_url || "/placeholder.svg"}
                      alt={project.client.full_name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-slate-400 text-xs">User</span>
                  )}
                </div>
                <div>
                  <h4 className="font-semibold">{project.client?.full_name}</h4>
                  <p className="text-xs text-slate-500">
                    Member since {new Date(project.client?.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {project.client?.location && <p className="text-sm text-slate-600 mb-2">📍 {project.client.location}</p>}

              {/* Contact button (visible to providers only) */}
              {user && isProvider && !isClient && (
                <div className="mt-4">
                  <a href={`/chat/new?client=${project.client_id}`} className="btn-primary w-full block text-center">
                    Contact Client
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
