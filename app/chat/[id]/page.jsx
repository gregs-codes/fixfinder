export const dynamic = "force-dynamic"

import { redirect, notFound } from "next/navigation"
import { createServerSupabase } from "@/lib/supabase-server"
import ChatMessages from "@/components/chat/ChatMessages"
import ChatInput from "@/components/chat/ChatInput"
import TypingIndicator from "@/components/chat/TypingIndicator"

export default async function ChatRoom({ params }) {
  const supabase = createServerSupabase()

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth/login")
  }

  try {
    // Check if user is a participant in this chat with a direct query
    const { data: participant, error: participantError } = await supabase
      .from("chat_participants")
      .select("id")
      .eq("chat_id", params.id)
      .eq("user_id", session.user.id)
      .single()

    if (participantError || !participant) {
      notFound()
    }

    // Get the other participant with our stored procedure
    const { data: otherParticipant, error: otherParticipantError } = await supabase
      .rpc("get_other_chat_participant", {
        p_chat_id: Number.parseInt(params.id),
        p_user_id: session.user.id,
      })
      .single()

    if (otherParticipantError) {
      console.error("Error fetching other participant:", otherParticipantError)
    }

    // Fetch messages with reactions
    const { data: messages, error: messagesError } = await supabase
      .from("messages")
      .select(`
        *,
        sender:users(
          id,
          full_name,
          avatar_url
        ),
        reactions:message_reactions(
          id,
          emoji,
          user_id,
          users(
            id,
            full_name
          )
        )
      `)
      .eq("chat_id", params.id)
      .order("created_at", { ascending: true })

    if (messagesError) {
      console.error("Error fetching messages:", messagesError)
    }

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
              {otherParticipant?.avatar_url ? (
                <img
                  src={otherParticipant.avatar_url || "/placeholder.svg"}
                  alt={otherParticipant.full_name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-slate-400 text-xs">User</span>
              )}
            </div>
            <div>
              <h2 className="font-semibold">{otherParticipant?.full_name || "User"}</h2>
              <p className="text-xs text-slate-500">{otherParticipant?.is_provider ? "Service Provider" : "Client"}</p>
            </div>
          </div>

          {/* Chat messages */}
          <ChatMessages messages={messages || []} currentUserId={session.user.id} />

          {/* Typing indicator */}
          <TypingIndicator
            chatId={params.id}
            currentUserId={session.user.id}
            otherParticipantName={otherParticipant?.full_name}
          />

          {/* Chat input */}
          <ChatInput chatId={params.id} userId={session.user.id} />
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error in chat room:", error)
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-md p-6 text-center">
          <h2 className="text-xl font-semibold text-red-500">Error loading chat</h2>
          <p className="mt-2 text-slate-600">There was a problem loading this chat. Please try again later.</p>
        </div>
      </div>
    )
  }
}
