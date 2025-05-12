import { redirect } from "next/navigation"
import { createServerSupabase } from "@/lib/supabase-server"

export default async function NewChat() {
  const supabase = createServerSupabase()

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth/login")
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-xl shadow-md p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Start a New Conversation</h1>
        <p className="text-slate-600 mb-6">
          You can start a conversation with a service provider or client from their profile page.
        </p>
        <div className="flex flex-col space-y-4 max-w-md mx-auto">
          <div className="bg-slate-100 p-4 rounded-lg">
            <h2 className="font-semibold mb-2">Find Service Providers</h2>
            <p className="text-sm text-slate-600 mb-3">
              Browse service providers and start a conversation from their profile.
            </p>
            <a
              href="/browse"
              className="inline-block bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 transition-colors"
            >
              Browse Providers
            </a>
          </div>

          <div className="bg-slate-100 p-4 rounded-lg">
            <h2 className="font-semibold mb-2">View Your Projects</h2>
            <p className="text-sm text-slate-600 mb-3">
              Check your projects and contact providers who have bid on them.
            </p>
            <a
              href="/projects"
              className="inline-block bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 transition-colors"
            >
              My Projects
            </a>
          </div>

          <div className="bg-slate-100 p-4 rounded-lg">
            <h2 className="font-semibold mb-2">View Existing Conversations</h2>
            <p className="text-sm text-slate-600 mb-3">Return to your existing conversations.</p>
            <a
              href="/chat"
              className="inline-block bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 transition-colors"
            >
              My Conversations
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
