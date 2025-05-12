import Link from "next/link"

export default function ProfileNotFound() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-xl shadow-md p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Profile Not Found</h2>
        <p className="text-slate-600 mb-6">The profile you're looking for doesn't exist or has been removed.</p>
        <Link href="/browse" className="btn-primary">
          Browse Service Providers
        </Link>
      </div>
    </div>
  )
}
