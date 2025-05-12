export const dynamic = "force-dynamic"

import { redirect, notFound } from "next/navigation"
import { createServerSupabase } from "@/lib/supabase-server"
import ChatMessages from "@/components/chat/ChatMessages"
import ChatInput from "@/components/chat/ChatInput"

export default async function ChatRoom({ params }) {
  const supabase = createServerSupabase()

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth/login")
  }

  // Check if user is a participant in this chat
  const { data: participant, error: participantError } = await supabase
    .from("chat_participants")
    .select("*")
    .eq("chat_id", params.id)
    .eq("user_id", session.user.id)
    .single()

  if (participantError || !participant) {
    notFound()
  }

  // Get the other participant
  const { data: otherParticipant } = await supabase
    .from("chat_participants")
    .select(`
      user_id,
      users:users(
        id,
        full_name,
        avatar_url,
        is_provider
      )
    `)
    .eq("chat_id", params.id)
    .neq("user_id", session.user.id)
    .single()

  // Fetch messages
  const { data: messages } = await supabase
    .from("messages")
    .select(`
      *,
      sender:users(
        id,
        full_name,
        avatar_url
      )
    `)
    .eq("chat_id", params.id)
    .order("created_at", { ascending: true })

  // Mark unread messages as read
  await supabase
    .from("messages")
    .update({ is_read: true })
    .eq("chat_id", params.id)
    .neq("sender_id", session.user.id)
    .eq("is_read", false)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col h-[calc(100vh-12rem)]">
        {/* Chat header */}
        <div className="p-4 border-b border-slate-200 flex items-center">
          <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden mr-3">
            {otherParticipant?.users?.avatar_url ? (
              <img
                src={otherParticipant.users.avatar_url || "/placeholder.svg"}
                alt={otherParticipant.users.full_name}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-slate-400 text-xs">User</span>
            )}
          </div>
          <div>
            <h2 className="font-semibold">{otherParticipant?.users?.full_name}</h2>
            <p className="text-xs text-slate-500">
              {otherParticipant?.users?.is_provider ? "Service Provider" : "Client"}
            </p>
          </div>
        </div>

        {/* Chat messages */}
        <ChatMessages messages={messages || []} currentUserId={session.user.id} />

        {/* Chat input */}
        <ChatInput chatId={params.id} userId={session.user.id} />
      </div>
    </div>
  )
}
