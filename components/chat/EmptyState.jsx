import Link from "next/link"
import { MessageSquare } from "lucide-react"

export default function EmptyState() {
  return (
    <div className="bg-white rounded-xl shadow-md p-8 text-center">
      <div className="flex justify-center mb-4">
        <MessageSquare className="h-16 w-16 text-slate-300" />
      </div>
      <h2 className="text-2xl font-semibold mb-2">No messages yet</h2>
      <p className="text-slate-600 mb-6">
        Start a conversation with a service provider or client to get help with your projects.
      </p>
      <div className="flex justify-center">
        <Link href="/browse" className="btn-primary">
          Find Service Providers
        </Link>
      </div>
    </div>
  )
}
