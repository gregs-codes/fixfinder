export default function ProjectSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
            <div className="p-6">
              <div className="h-8 bg-slate-200 rounded w-3/4 mb-6"></div>

              <div className="flex flex-wrap gap-4 mb-6">
                <div className="h-6 bg-slate-200 rounded w-24"></div>
                <div className="h-6 bg-slate-200 rounded w-24"></div>
                <div className="h-6 bg-slate-200 rounded w-24"></div>
              </div>

              <div className="mb-6">
                <div className="h-6 bg-slate-200 rounded w-1/4 mb-2"></div>
                <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              </div>

              <div>
                <div className="h-6 bg-slate-200 rounded w-1/4 mb-2"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
            <div className="p-6">
              <div className="h-6 bg-slate-200 rounded w-1/2 mb-4"></div>

              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-slate-200 mr-3"></div>
                <div>
                  <div className="h-4 bg-slate-200 rounded w-24 mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded w-32"></div>
                </div>
              </div>

              <div className="h-4 bg-slate-200 rounded w-3/4 mb-4"></div>

              <div className="h-10 bg-slate-200 rounded w-full mt-4"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
