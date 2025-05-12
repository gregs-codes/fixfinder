import { createServerSupabase } from "@/lib/supabase-server"
import Link from "next/link"
import { Briefcase, MessageSquare, DollarSign } from "lucide-react"

export default async function ProviderDashboard({ userId }) {
  const supabase = createServerSupabase()

  // Fetch provider's services
  const { data: services } = await supabase
    .from("services")
    .select(`
      *,
      category:categories(*)
    `)
    .eq("provider_id", userId)
    .order("created_at", { ascending: false })

  // Fetch provider's bids
  const { data: bids } = await supabase
    .from("project_bids")
    .select(`
      *,
      project:projects(
        *,
        category:categories(*),
        client:users(id, full_name, avatar_url)
      )
    `)
    .eq("provider_id", userId)
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

  // Group bids by status
  const pendingBids = bids?.filter((b) => b.status === "pending") || []
  const acceptedBids = bids?.filter((b) => b.status === "accepted") || []

  return (
    <div className="space-y-8">
      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="font-semibold text-lg mb-2">Active Services</h3>
          <div className="flex items-center">
            <Briefcase className="h-8 w-8 text-teal-500 mr-3" />
            <span className="text-3xl font-bold">{services?.filter((s) => s.is_active).length || 0}</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="font-semibold text-lg mb-2">Pending Bids</h3>
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-indigo-500 mr-3" />
            <span className="text-3xl font-bold">{pendingBids.length}</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="font-semibold text-lg mb-2">Unread Messages</h3>
          <div className="flex items-center">
            <div className="relative">
              <MessageSquare className="h-8 w-8 text-indigo-500 mr-3" />
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

      {/* Services section */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Your Services</h2>
            <Link href="/services/new" className="btn-primary">
              Add New Service
            </Link>
          </div>

          {services?.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-500 mb-4">You haven't added any services yet.</p>
              <Link href="/services/new" className="btn-primary">
                Add Your First Service
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services?.map((service) => (
                <div
                  key={service.id}
                  className="border border-slate-200 rounded-lg p-4 hover:border-teal-200 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{service.title}</h4>
                      {service.category && (
                        <div className="flex items-center mt-1">
                          <span className="badge bg-slate-100 text-slate-700">
                            {service.category.icon} {service.category.name}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-teal-600 font-semibold">${service.hourly_rate}/hr</div>
                      <div className="text-xs text-slate-500">
                        {service.is_active ? (
                          <span className="text-green-600">Active</span>
                        ) : (
                          <span className="text-red-600">Inactive</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {service.description && (
                    <p className="text-sm text-slate-600 mt-2 line-clamp-2">{service.description}</p>
                  )}

                  <div className="mt-4 flex justify-end">
                    <Link
                      href={`/services/${service.id}/edit`}
                      className="text-teal-600 hover:text-teal-700 text-sm font-medium"
                    >
                      Edit Service
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bids section */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">Your Bids</h2>

          {bids?.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-500 mb-4">You haven't placed any bids yet.</p>
              <Link href="/browse" className="btn-primary">
                Browse Projects
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {pendingBids.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-3">Pending Bids</h3>
                  <div className="space-y-4">
                    {pendingBids.map((bid) => (
                      <BidCard key={bid.id} bid={bid} />
                    ))}
                  </div>
                </div>
              )}

              {acceptedBids.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-3">Accepted Bids</h3>
                  <div className="space-y-4">
                    {acceptedBids.map((bid) => (
                      <BidCard key={bid.id} bid={bid} />
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

function BidCard({ bid }) {
  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    accepted: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  }

  return (
    <div className="border border-slate-200 rounded-lg p-4 hover:border-teal-200 transition-colors">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-semibold">{bid.project?.title}</h4>
          <div className="flex items-center mt-1 space-x-2">
            {bid.project?.category && (
              <span className="badge bg-slate-100 text-slate-700">
                {bid.project.category.icon} {bid.project.category.name}
              </span>
            )}
            <span className={`badge ${statusColors[bid.status]}`}>
              {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-teal-600 font-semibold">${bid.bid_amount}</div>
          <div className="text-xs text-slate-500">Bid on {new Date(bid.created_at).toLocaleDateString()}</div>
        </div>
      </div>

      {bid.message && <p className="text-sm text-slate-600 mt-2 line-clamp-2">{bid.message}</p>}

      <div className="mt-4 flex justify-between items-center">
        <div className="flex items-center">
          <span className="text-sm text-slate-600 mr-2">Client:</span>
          <span className="text-sm font-medium">{bid.project?.client?.full_name}</span>
        </div>
        <Link href={`/projects/${bid.project_id}`} className="text-teal-600 hover:text-teal-700 text-sm font-medium">
          View Project
        </Link>
      </div>
    </div>
  )
}
