export const dynamic = "force-dynamic"

import Link from "next/link"
import { notFound } from "next/navigation"
import { createServerSupabase } from "@/lib/supabase-server"
import { User, MapPin, Phone, Mail, Calendar } from "lucide-react"
import ServiceCard from "@/components/providers/ServiceCard"
import ReviewSection from "@/components/providers/ReviewSection"

export default async function ProviderProfile({ params }) {
  const supabase = createServerSupabase()

  // Fetch provider details
  const { data: provider, error } = await supabase
    .from("users")
    .select(`
      *,
      services:services(
        *,
        category:categories(*)
      ),
      reviews:reviews(
        *,
        reviewer:users(id, full_name, avatar_url),
        project:projects(id, title)
      )
    `)
    .eq("id", params.id)
    .eq("is_provider", true)
    .single()

  if (error || !provider) {
    notFound()
  }

  // Calculate average rating
  const reviews = provider.reviews || []
  const averageRating =
    reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Provider info sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md overflow-hidden sticky top-24">
            <div className="p-6">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="h-32 w-32 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden mb-4">
                  {provider.avatar_url ? (
                    <img
                      src={provider.avatar_url || "/placeholder.svg"}
                      alt={provider.full_name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-16 w-16 text-slate-400" />
                  )}
                </div>

                <h1 className="text-2xl font-bold">{provider.full_name}</h1>

                {/* Rating display */}
                {reviews.length > 0 && (
                  <div className="flex items-center mt-2">
                    <div className="flex text-yellow-400">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`h-5 w-5 ${star <= Math.round(averageRating) ? "text-yellow-400" : "text-slate-300"}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-slate-600">
                      {averageRating.toFixed(1)} ({reviews.length} reviews)
                    </span>
                  </div>
                )}
              </div>

              {/* Contact info */}
              <div className="space-y-3">
                {provider.location && (
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-slate-400 mr-2" />
                    <span className="text-slate-700">{provider.location}</span>
                  </div>
                )}

                {provider.phone && (
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 text-slate-400 mr-2" />
                    <span className="text-slate-700">{provider.phone}</span>
                  </div>
                )}

                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-slate-400 mr-2" />
                  <span className="text-slate-700">{provider.email}</span>
                </div>

                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-slate-400 mr-2" />
                  <span className="text-slate-700">
                    Member since {new Date(provider.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex flex-col space-y-3">
                <Link href={`/chat/new?provider=${provider.id}`} className="btn-primary w-full">
                  Contact
                </Link>

                <Link href={`/projects/new?provider=${provider.id}`} className="btn-outline w-full">
                  Request Service
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:col-span-2 space-y-8">
          {/* About section */}
          <section className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">About</h2>
              {provider.bio ? (
                <p className="text-slate-700 whitespace-pre-line">{provider.bio}</p>
              ) : (
                <p className="text-slate-500 italic">No bio provided.</p>
              )}
            </div>
          </section>

          {/* Services section */}
          <section className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Services Offered</h2>

              {provider.services?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {provider.services.map((service) => (
                    <ServiceCard key={service.id} service={service} />
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 italic">No services listed.</p>
              )}
            </div>
          </section>

          {/* Reviews section */}
          <ReviewSection reviews={reviews} providerId={provider.id} />
        </div>
      </div>
    </div>
  )
}
