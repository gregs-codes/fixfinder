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

  // Special case for /chat/new - redirect to the new chat page
  if (params.id === "new") {
    redirect("/chat/new-conversation")
  }

  try {
    // Check if the chat ID is valid
    const chatId = Number.parseInt(params.id)
    if (isNaN(chatId)) {
      console.error("Invalid chat ID:", params.id)
      notFound()
    }

    // First check if the chat exists
    const { data: chat, error: chatError } = await supabase.from("chats").select("id").eq("id", chatId).single()

    if (chatError || !chat) {
      console.error("Chat not found:", chatError)
      notFound()
    }

    // Check if user is a participant using a direct query
    const { data: participants, error: participantError } = await supabase
      .from("chat_participants")
      .select("id")
      .eq("chat_id", chatId)
      .eq("user_id", session.user.id)

    if (participantError) {
      console.error("Error checking participant:", participantError)
      notFound()
    }

    // If no participants found, user is not a participant
    if (!participants || participants.length === 0) {
      console.error("User is not a participant in this chat")
      notFound()
    }

    // Get the other participant with a direct query
    const { data: otherParticipants, error: otherParticipantError } = await supabase
      .from("chat_participants")
      .select(`
        user_id,
        users:user_id(
          id,
          full_name,
          avatar_url,
          is_provider
        )
      `)
      .eq("chat_id", chatId)
      .neq("user_id", session.user.id)

    if (otherParticipantError) {
      console.error("Error fetching other participant:", otherParticipantError)
    }

    // Get the first other participant
    const otherParticipant = otherParticipants && otherParticipants.length > 0 ? otherParticipants[0].users : null

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
      .eq("chat_id", chatId)
      .order("created_at", { ascending: true })

    if (messagesError) {
      console.error("Error fetching messages:", messagesError)
    }

    // Mark unread messages as read
    await supabase
      .from("messages")
      .update({ is_read: true })
      .eq("chat_id", chatId)
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
            chatId={chatId}
            currentUserId={session.user.id}
            otherParticipantName={otherParticipant?.full_name}
          />

          {/* Chat input */}
          <ChatInput chatId={chatId} userId={session.user.id} />
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
