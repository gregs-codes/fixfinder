export const dynamic = "force-dynamic"

import { notFound } from "next/navigation"
import { createServerSupabase } from "@/lib/supabase-server"
import ProjectDetails from "@/components/projects/ProjectDetails"
import BidForm from "@/components/projects/BidForm"
import BidsList from "@/components/projects/BidsList"

export default async function ProjectPage({ params }) {
  const supabase = createServerSupabase()

  // Get the current user
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const userId = session?.user?.id

  // Fetch project details
  const { data: project, error } = await supabase
    .from("projects")
    .select(`
      *,
      category:categories(*),
      client:users!projects_client_id_fkey(id, full_name, avatar_url, email, phone, location),
      bids:project_bids(
        *,
        provider:users(id, full_name, avatar_url)
      )
    `)
    .eq("id", params.id)
    .single()

  if (error || !project) {
    notFound()
  }

  // Get user details if logged in
  let userDetails = null
  if (userId) {
    const { data } = await supabase.from("users").select("*").eq("id", userId).single()

    userDetails = data
  }

  // Check if user is the client
  const isClient = userId === project.client_id

  // Check if user is a provider who has already bid
  const hasUserBid = project.bids?.some((bid) => bid.provider_id === userId)

  // Check if user is a provider
  const isProvider = userDetails?.is_provider || false

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Project details */}
        <div className="lg:col-span-2">
          <ProjectDetails project={project} isClient={isClient} userId={userId} />

          {/* Bids list (visible to client only) */}
          {isClient && project.bids?.length > 0 && (
            <div className="mt-8">
              <BidsList bids={project.bids} projectId={project.id} />
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Bid form (for providers who haven't bid yet) */}
          {userId && isProvider && !isClient && !hasUserBid && project.status === "open" && (
            <BidForm projectId={project.id} userId={userId} />
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
              {userId && isProvider && !isClient && (
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
