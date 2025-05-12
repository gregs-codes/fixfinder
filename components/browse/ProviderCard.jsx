import Link from "next/link"
import { User } from "lucide-react"

export default function ProviderCard({ provider }) {
  if (!provider) {
    return null
  }

  // Get the first 3 services to display
  const displayServices = provider.services?.slice(0, 3) || []

  return (
    <div className="card hover:shadow-xl transition-shadow">
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0">
            {provider.avatar_url ? (
              <img
                src={provider.avatar_url || "/placeholder.svg?height=64&width=64&query=user"}
                alt={provider.full_name}
                className="h-full w-full object-cover"
              />
            ) : (
              <User className="h-8 w-8 text-slate-400" />
            )}
          </div>

          <div className="flex-grow">
            <h3 className="font-semibold text-lg">{provider.full_name || "Service Provider"}</h3>
            {provider.location && <p className="text-sm text-slate-500 mb-2">📍 {provider.location}</p>}

            {/* Services offered */}
            {displayServices.length > 0 && (
              <div className="mt-3">
                <h4 className="text-sm font-medium text-slate-700 mb-1">Services:</h4>
                <div className="flex flex-wrap gap-2">
                  {displayServices.map((service) => (
                    <span key={service.id} className="badge bg-slate-100 text-slate-700">
                      {service.category?.icon || "🔧"} {service.title || "Service"}
                    </span>
                  ))}
                  {provider.services?.length > 3 && (
                    <span className="badge bg-slate-100 text-slate-700">+{provider.services.length - 3} more</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bio preview */}
        {provider.bio && (
          <div className="mt-4">
            <p className="text-sm text-slate-600 line-clamp-2">{provider.bio}</p>
          </div>
        )}

        <div className="mt-4 flex justify-between items-center">
          <Link
            href={`/profile/${provider.id.substring(0, 8)}`}
            className="text-teal-600 hover:text-teal-700 text-sm font-medium"
          >
            View Profile
          </Link>

          <Link href={`/chat/new?provider=${provider.id}`} className="btn-outline text-sm py-1 px-3">
            Message
          </Link>
        </div>
      </div>
    </div>
  )
}
