import Link from "next/link"
import { User } from "lucide-react"

export default function ChatList({ chats, currentUserId }) {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="divide-y divide-slate-200">
        {chats.map((chat) => (
          <Link key={chat.id} href={`/chat/${chat.id}`} className="block hover:bg-slate-50 transition-colors">
            <div className="p-4 flex items-start">
              <div className="relative">
                <div className="h-12 w-12 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden mr-3">
                  {chat.otherUser?.avatar_url ? (
                    <img
                      src={chat.otherUser.avatar_url || "/placeholder.svg"}
                      alt={chat.otherUser.full_name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-6 w-6 text-slate-400" />
                  )}
                </div>
                {chat.unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {chat.unreadCount}
                  </span>
                )}
              </div>

              <div className="flex-grow min-w-0">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-semibold truncate">{chat.otherUser?.full_name}</h3>
                  {chat.latestMessage && (
                    <span className="text-xs text-slate-500">
                      {new Date(chat.latestMessage.created_at).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {chat.latestMessage ? (
                  <p
                    className={`text-sm truncate ${
                      chat.latestMessage.sender_id !== currentUserId && !chat.latestMessage.is_read
                        ? "font-semibold text-slate-900"
                        : "text-slate-500"
                    }`}
                  >
                    {chat.latestMessage.sender_id === currentUserId ? "You: " : ""}
                    {chat.latestMessage.content}
                  </p>
                ) : (
                  <p className="text-sm text-slate-500 italic">No messages yet</p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
