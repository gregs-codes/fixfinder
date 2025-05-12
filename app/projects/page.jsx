import { Suspense } from "react"
import { createServerSupabase } from "@/lib/supabase-server"
import Link from "next/link"
import { Briefcase, Plus, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function ProjectsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Projects</h1>
        <Link
          href="/projects/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Link>
      </div>

      <Suspense fallback={<ProjectsLoading />}>
        <ProjectsList />
      </Suspense>
    </div>
  )
}

function ProjectsLoading() {
  return (
    <div className="animate-pulse">
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {[...Array(3)].map((_, i) => (
            <li key={i} className="px-6 py-4">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-8 w-24 bg-gray-200 rounded"></div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

async function ProjectsList() {
  const supabase = createServerSupabase()

  // Get the current user
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.user) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              Please sign in to view your projects.{" "}
              <Link href="/auth/login" className="font-medium underline text-yellow-700 hover:text-yellow-600">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Get user details to determine if they're a provider
  const { data: userDetails } = await supabase.from("users").select("*").eq("id", session.user.id).single()

  const isProvider = userDetails?.is_provider || session.user.user_metadata?.is_provider

  // Fetch projects based on user role
  const { data: projects, error } = await supabase
    .from("projects")
    .select("*, client:client_id(*), provider:provider_id(*), category:category_id(*)")
    .or(isProvider ? `provider_id.eq.${session.user.id}` : `client_id.eq.${session.user.id}`)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching projects:", error)
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-red-700">There was an error loading your projects. Please try again later.</p>
          </div>
        </div>
      </div>
    )
  }

  // Sample projects for empty state
  const sampleProjects = [
    {
      id: "sample-1",
      title: "Kitchen Renovation",
      description: "Complete kitchen remodel including new cabinets, countertops, and appliances",
      status: "open",
      created_at: new Date().toISOString(),
      budget: "$15,000 - $20,000",
      location: "Seattle, WA",
      client: { full_name: "Sample Client" },
      provider: isProvider ? { full_name: "You" } : { full_name: "Sample Provider" },
      category: { name: "Home Improvement" },
      isSample: true,
    },
    {
      id: "sample-2",
      title: "Weekly House Cleaning",
      description: "Regular cleaning service for a 3-bedroom house",
      status: "in_progress",
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      budget: "$150 per week",
      location: "Portland, OR",
      client: { full_name: "Sample Client" },
      provider: isProvider ? { full_name: "You" } : { full_name: "Sample Provider" },
      category: { name: "Cleaning" },
      isSample: true,
    },
    {
      id: "sample-3",
      title: "Lawn Maintenance",
      description: "Lawn mowing, edging, and general yard maintenance",
      status: "completed",
      created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      budget: "$80 per visit",
      location: "Vancouver, WA",
      client: { full_name: "Sample Client" },
      provider: isProvider ? { full_name: "You" } : { full_name: "Sample Provider" },
      category: { name: "Landscaping" },
      isSample: true,
    },
  ]

  // Use sample projects if no real projects exist
  const displayProjects = projects && projects.length > 0 ? projects : sampleProjects
  const showSampleNotice = projects && projects.length === 0

  return (
    <>
      {showSampleNotice && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                You don't have any projects yet. Here are some sample projects to help you get started.
                {isProvider ? (
                  <>
                    {" "}
                    Browse{" "}
                    <Link href="/browse" className="font-medium underline text-blue-700 hover:text-blue-600">
                      open projects
                    </Link>{" "}
                    to find work.
                  </>
                ) : (
                  <>
                    {" "}
                    <Link href="/projects/new" className="font-medium underline text-blue-700 hover:text-blue-600">
                      Create a new project
                    </Link>{" "}
                    to get started.
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {displayProjects.map((project) => (
            <li key={project.id}>
              <Link href={project.isSample ? "#" : `/projects/${project.id}`} className="block hover:bg-gray-50">
                <div className="px-6 py-4 flex items-center">
                  <div className="min-w-0 flex-1 flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-full bg-teal-100 flex items-center justify-center">
                        <Briefcase className="h-6 w-6 text-teal-600" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1 px-4">
                      <div>
                        <p className="text-lg font-medium text-gray-900 truncate">{project.title}</p>
                        <p className="mt-1 text-sm text-gray-500 truncate">{project.description}</p>
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          <p>{project.category?.name || "General"}</p>
                          <span className="mx-2">•</span>
                          <p>{project.location || "Remote"}</p>
                          <span className="mx-2">•</span>
                          <p>{project.budget || "Budget not specified"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="ml-5 flex-shrink-0">
                      {project.status === "open" && (
                        <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          <Clock className="h-4 w-4 mr-1" />
                          Open
                        </span>
                      )}
                      {project.status === "in_progress" && (
                        <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          In Progress
                        </span>
                      )}
                      {project.status === "completed" && (
                        <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Completed
                        </span>
                      )}
                      {project.status === "cancelled" && (
                        <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-red-100 text-red-800">
                          <XCircle className="h-4 w-4 mr-1" />
                          Cancelled
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
