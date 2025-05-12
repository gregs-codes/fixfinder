import { createServerSupabase } from "@/lib/supabase-server"
import Link from "next/link"
import { Clock, CheckCircle, XCircle } from "lucide-react"

export default async function ClientDashboard({ userId }) {
  const supabase = createServerSupabase()

  // Fetch client's projects
  const { data: projects } = await supabase
    .from("projects")
    .select(`
      *,
      category:categories(*),
      bids:project_bids(
        *,
        provider:users(id, full_name, avatar_url)
      )
    `)
    .eq("client_id", userId)
    .order("created_at", { ascending: false })

  // Fetch unread messages count
  const { data: chats } = await supabase
    .from("chat_participants")
    .select(`
      chat_id,
      chats!inner(
        messages!inner(
          id,
          is_read,
          sender_id
        )
      )
    `)
    .eq("user_id", userId)
    .neq("chats.messages.sender_id", userId)
    .eq("chats.messages.is_read", false)

  const unreadMessagesCount =
    chats?.reduce((count, chat) => {
      return count + chat.chats.messages.length
    }, 0) || 0

  // Group projects by status
  const openProjects = projects?.filter((p) => p.status === "open") || []
  const inProgressProjects = projects?.filter((p) => p.status === "in_progress") || []
  const completedProjects = projects?.filter((p) => p.status === "completed") || []

  return (
    <div className="space-y-8">
      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="font-semibold text-lg mb-2">Open Projects</h3>
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-indigo-500 mr-3" />
            <span className="text-3xl font-bold">{openProjects.length}</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="font-semibold text-lg mb-2">Active Projects</h3>
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-teal-500 mr-3" />
            <span className="text-3xl font-bold">{inProgressProjects.length}</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="font-semibold text-lg mb-2">Unread Messages</h3>
          <div className="flex items-center">
            <div className="relative">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-indigo-500 mr-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
              {unreadMessagesCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadMessagesCount}
                </span>
              )}
            </div>
            <Link href="/chat" className="text-indigo-600 hover:text-indigo-800 font-medium">
              View Messages
            </Link>
          </div>
        </div>
      </div>

      {/* Projects section */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Your Projects</h2>
            <Link href="/projects/new" className="btn-primary">
              Post New Project
            </Link>
          </div>

          {projects?.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-500 mb-4">You haven't posted any projects yet.</p>
              <Link href="/projects/new" className="btn-primary">
                Post Your First Project
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {openProjects.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center">
                    <Clock className="h-5 w-5 text-indigo-500 mr-2" />
                    Open Projects
                  </h3>
                  <div className="space-y-4">
                    {openProjects.map((project) => (
                      <ProjectCard key={project.id} project={project} />
                    ))}
                  </div>
                </div>
              )}

              {inProgressProjects.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center">
                    <CheckCircle className="h-5 w-5 text-teal-500 mr-2" />
                    In Progress
                  </h3>
                  <div className="space-y-4">
                    {inProgressProjects.map((project) => (
                      <ProjectCard key={project.id} project={project} />
                    ))}
                  </div>
                </div>
              )}

              {completedProjects.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center">
                    <XCircle className="h-5 w-5 text-slate-500 mr-2" />
                    Completed
                  </h3>
                  <div className="space-y-4">
                    {completedProjects.map((project) => (
                      <ProjectCard key={project.id} project={project} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ProjectCard({ project }) {
  const statusColors = {
    open: "bg-indigo-100 text-indigo-800",
    in_progress: "bg-teal-100 text-teal-800",
    completed: "bg-slate-100 text-slate-800",
    cancelled: "bg-red-100 text-red-800",
  }

  return (
    <div className="border border-slate-200 rounded-lg p-4 hover:border-teal-200 transition-colors">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-semibold text-lg">{project.title}</h4>
          <div className="flex items-center mt-1 space-x-2">
            {project.category && (
              <span className="badge bg-slate-100 text-slate-700">
                {project.category.icon} {project.category.name}
              </span>
            )}
            <span className={`badge ${statusColors[project.status]}`}>
              {project.status.replace("_", " ").charAt(0).toUpperCase() + project.status.replace("_", " ").slice(1)}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-teal-600 font-semibold">${project.budget}</div>
          <div className="text-xs text-slate-500">Posted on {new Date(project.created_at).toLocaleDateString()}</div>
        </div>
      </div>

      {project.description && <p className="text-sm text-slate-600 mt-2 line-clamp-2">{project.description}</p>}

      <div className="mt-4 flex justify-between items-center">
        <div>
          <span className="text-sm text-slate-600">
            {project.bids?.length || 0} bid{project.bids?.length !== 1 ? "s" : ""}
          </span>
        </div>
        <Link href={`/projects/${project.id}`} className="text-teal-600 hover:text-teal-700 text-sm font-medium">
          View Details
        </Link>
      </div>
    </div>
  )
}
