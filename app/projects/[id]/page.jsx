import { createServerSupabase } from "@/lib/supabase-server"
import ProjectPageClient from "@/components/projects/ProjectPageClient"

// This function runs on the server
export async function generateMetadata({ params }) {
  const supabase = createServerSupabase()

  try {
    const { data: project } = await supabase.from("projects").select("title, description").eq("id", params.id).single()

    if (!project) {
      return {
        title: "Project Not Found - FixIt Finder",
        description: "The requested project could not be found.",
      }
    }

    return {
      title: `${project.title} - FixIt Finder`,
      description: project.description?.substring(0, 160) || "View project details on FixIt Finder",
    }
  } catch (error) {
    console.error("Error generating metadata:", error)
    return {
      title: "Project Details - FixIt Finder",
      description: "View project details on FixIt Finder",
    }
  }
}

export default async function ProjectPage({ params }) {
  const projectId = params.id

  // We'll let the client component handle data fetching
  return <ProjectPageClient projectId={projectId} />
}
