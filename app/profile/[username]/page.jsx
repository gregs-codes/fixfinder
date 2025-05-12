export const dynamic = "force-dynamic"

import { notFound } from "next/navigation"
import Link from "next/link"
import { createServerSupabase } from "@/lib/supabase-server"
import { User, MapPin, Phone, Mail, Calendar } from "lucide-react"
import ServiceCard from "@/components/providers/ServiceCard"
import ReviewSection from "@/components/providers/ReviewSection"

export default async function PublicProfile({ params }) {
  const supabase = createServerSupabase()

  // Get the current user
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const currentUserId = session?.user?.id

  // Fetch all users and filter by ID prefix
  // This is more reliable than using LIKE with Supabase
  const { data: users, error: usersError } = await supabase.from("users").select("*")

  if (usersError) {
    console.error("Error fetching users:", usersError)
    notFound()
  }

  // Find the user whose ID starts with the provided username parameter
  const user = users.find((u) => u.id.startsWith(params.username))

  if (!user) {
    notFound()
  }

  // If this is the current user, redirect to the edit profile page
  if (currentUserId === user.id) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-md p-6 text-center">
          <h2 className="text-2xl font-bold mb-4">This is your profile</h2>
          <p className="text-slate-600 mb-6">You can edit your profile information here.</p>
          <Link href="/profile/edit" className="btn-primary">
            Edit Your Profile
          </Link>
        </div>
      </div>
    )
  }

  // Fetch additional user data (services and reviews)
  const { data: services, error: servicesError } = await supabase
    .from("services")
    .select(`
      *,
      category:categories(*)
    `)
    .eq("provider_id", user.id)
    .order("created_at", { ascending: false })

  const { data: reviews, error: reviewsError } = await supabase
    .from("reviews")
    .select(`
      *,
      reviewer:users(id, full_name, avatar_url),
      project:projects(id, title)
    `)
    .eq("provider_id", user.id)
    .order("created_at", { ascending: false })

  // Calculate average rating if this is a provider
  const userReviews = user.is_provider ? reviews || [] : []
  const averageRating =
    userReviews.length > 0 ? userReviews.reduce((sum, review) => sum + review.rating, 0) / userReviews.length : 0

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User info sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md overflow-hidden sticky top-24">
            <div className="p-6">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="h-32 w-32 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden mb-4">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url || "/placeholder.svg"}
                      alt={user.full_name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-16 w-16 text-slate-400" />
                  )}
                </div>

                <h1 className="text-2xl font-bold">{user.full_name}</h1>

                {user.is_provider && <div className="badge bg-teal-100 text-teal-800 mt-2">Service Provider</div>}

                {/* Rating display for providers */}
                {user.is_provider && userReviews.length > 0 && (
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
                      {averageRating.toFixed(1)} ({userReviews.length} reviews)
                    </span>
                  </div>
                )}
              </div>

              {/* Contact info */}
              <div className="space-y-3">
                {user.location && (
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-slate-400 mr-2" />
                    <span className="text-slate-700">{user.location}</span>
                  </div>
                )}

                {user.phone && (
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 text-slate-400 mr-2" />
                    <span className="text-slate-700">{user.phone}</span>
                  </div>
                )}

                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-slate-400 mr-2" />
                  <span className="text-slate-700">{user.email}</span>
                </div>

                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-slate-400 mr-2" />
                  <span className="text-slate-700">Member since {new Date(user.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {user.is_provider && (
                <div className="mt-6 flex flex-col space-y-3">
                  <Link href={`/chat/new?provider=${user.id}`} className="btn-primary w-full">
                    Contact
                  </Link>

                  <Link href={`/projects/new?provider=${user.id}`} className="btn-outline w-full">
                    Request Service
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:col-span-2 space-y-8">
          {/* About section */}
          <section className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">About</h2>
              {user.bio ? (
                <p className="text-slate-700 whitespace-pre-line">{user.bio}</p>
              ) : (
                <p className="text-slate-500 italic">No bio provided.</p>
              )}
            </div>
          </section>

          {/* Services section for providers */}
          {user.is_provider && (
            <section className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">Services Offered</h2>

                {services?.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {services
                      .filter((service) => service.is_active)
                      .map((service) => (
                        <ServiceCard key={service.id} service={service} />
                      ))}
                  </div>
                ) : (
                  <p className="text-slate-500 italic">No services listed.</p>
                )}
              </div>
            </section>
          )}

          {/* Reviews section for providers */}
          {user.is_provider && <ReviewSection reviews={userReviews} providerId={user.id} />}
        </div>
      </div>
    </div>
  )
}
