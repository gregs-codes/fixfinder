"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSupabase } from "@/lib/supabase-provider"
import { useToast } from "@/components/ui/toast-provider"

export default function NewChat() {
  const { supabase, user, loading } = useSupabase()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { addToast } = useToast()

  const [recipientId, setRecipientId] = useState("")
  const [message, setMessage] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [providers, setProviders] = useState([])

  // Get provider or client ID from query params if available
  const providerId = searchParams.get("provider")
  const clientId = searchParams.get("client")

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!loading && !user) {
      router.push("/auth/login")
    }

    // Set recipient ID from query params if available
    if (providerId) {
      setRecipientId(providerId)
    } else if (clientId) {
      setRecipientId(clientId)
    }

    // Fetch providers for dropdown
    const fetchProviders = async () => {
      const { data } = await supabase
        .from("users")
        .select("id, full_name, is_provider")
        .neq("id", user?.id)
        .order("full_name")

      setProviders(data || [])
    }

    if (user) {
      fetchProviders()
    }
  }, [supabase, user, loading, router, providerId, clientId])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!user) {
      addToast("You must be logged in to send a message", "error")
      return
    }

    if (!recipientId) {
      addToast("Please select a recipient", "error")
      return
    }

    setSubmitting(true)

    try {
      // Check if a chat already exists between these users
      const { data: existingChats } = await supabase.from("chat_participants").select("chat_id").eq("user_id", user.id)

      const chatIds = existingChats?.map((c) => c.chat_id) || []

      if (chatIds.length > 0) {
        const { data: existingChat } = await supabase
          .from("chat_participants")
          .select("chat_id")
          .eq("user_id", recipientId)
          .in("chat_id", chatIds)
          .single()

        if (existingChat) {
          // Chat already exists, send message to existing chat
          await supabase.from("messages").insert({
            chat_id: existingChat.chat_id,
            sender_id: user.id,
            content: message,
            is_read: false,
          })

          router.push(`/chat/${existingChat.chat_id}`)
          return
        }
      }

      // Create a new chat
      const { data: chat, error: chatError } = await supabase.from("chats").insert({}).select().single()

      if (chatError) {
        throw chatError
      }

      // Add both users as participants
      const { error: participantsError } = await supabase.from("chat_participants").insert([
        { chat_id: chat.id, user_id: user.id },
        { chat_id: chat.id, user_id: recipientId },
      ])

      if (participantsError) {
        throw participantsError
      }

      // Send initial message
      const { error: messageError } = await supabase.from("messages").insert({
        chat_id: chat.id,
        sender_id: user.id,
        content: message,
        is_read: false,
      })

      if (messageError) {
        throw messageError
      }

      router.push(`/chat/${chat.id}`)
    } catch (error) {
      addToast(error.message || "Failed to start chat", "error")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-center">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-6">New Message</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="recipient" className="block text-sm font-medium text-slate-700 mb-1">
                Recipient
              </label>
              <select
                id="recipient"
                className="input w-full"
                value={recipientId}
                onChange={(e) => setRecipientId(e.target.value)}
                required
                disabled={!!providerId || !!clientId}
              >
                <option value="">Select a recipient</option>
                {providers.map((provider) => (
                  <option key={provider.id} value={provider.id}>
                    {provider.full_name} {provider.is_provider ? "(Provider)" : "(Client)"}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-1">
                Message
              </label>
              <textarea
                id="message"
                rows={5}
                className="input w-full"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                placeholder="Type your message here..."
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button type="button" onClick={() => router.back()} className="btn-outline" disabled={submitting}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? "Sending..." : "Send Message"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
