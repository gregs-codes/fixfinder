import { redirect } from "next/navigation"
import { createServerSupabase } from "@/lib/supabase-server"
import ChatList from "@/components/chat/ChatList"
import EmptyState from "@/components/chat/EmptyState"

export const dynamic = "force-dynamic"

export default async function ChatPage() {
  const supabase = createServerSupabase()

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth/login")
  }

  // Fetch user's chats
  const { data: chats } = await supabase
    .from("chat_participants")
    .select(`
      chat_id,
      chats!inner(
        id,
        created_at,
        messages(
          id,
          content,
          sender_id,
          is_read,
          created_at
        )
      ),
      participants:chat_participants!inner(
        user_id,
        users!inner(
          id,
          full_name,
          avatar_url,
          is_provider
        )
      )
    `)
    .eq("user_id", session.user.id)
    .order("chats.created_at", { ascending: false })

  // Process chats to get the other participant and latest message
  const processedChats = chats?.map((chat) => {
    // Get the other participant (not the current user)
    const otherParticipants = chat.participants.filter((p) => p.user_id !== session.user.id)
    const otherUser = otherParticipants[0]?.users

    // Get the latest message
    const messages = chat.chats.messages || []
    const sortedMessages = [...messages].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    const latestMessage = sortedMessages[0]

    // Count unread messages
    const unreadCount = messages.filter((m) => m.sender_id !== session.user.id && !m.is_read).length

    return {
      id: chat,
    }
  })

  return chats?.length > 0 ? <ChatList chats={processedChats} /> : <EmptyState />
}
