import { createServerSupabase } from "@/lib/supabase-server"
import ProviderCard from "@/components/browse/ProviderCard"
import CategoryFilter from "@/components/browse/CategoryFilter"
import SearchBar from "@/components/browse/SearchBar"

export const dynamic = "force-dynamic"

export default async function BrowsePage({ searchParams }) {
  const supabase = createServerSupabase()

  // Get query parameters
  const categoryId = searchParams.category ? Number.parseInt(searchParams.category) : null
  const searchQuery = searchParams.q || ""
  const location = searchParams.location || ""

  let categories = []
  let providers = []
  let error = null

  try {
    // Fetch categories for the filter
    const { data: categoriesData, error: categoriesError } = await supabase.from("categories").select("*").order("name")

    if (categoriesError) {
      console.error("Error fetching categories:", categoriesError)
      error = categoriesError
    } else {
      categories = categoriesData || []
    }

    // Build the query for providers
    let query = supabase
      .from("users")
      .select(`
        *,
        services:services(
          *,
          category:categories(*)
        )
      `)
      .eq("is_provider", true)

    // Apply category filter if provided
    if (categoryId) {
      query = query.eq("services.category_id", categoryId)
    }

    // Apply search query if provided
    if (searchQuery) {
      query = query.or(`full_name.ilike.%${searchQuery}%,bio.ilike.%${searchQuery}%`)
    }

    // Apply location filter if provided
    if (location) {
      query = query.or(`location.ilike.%${location}%,zip_code.ilike.%${location}%`)
    }

    // Execute the query
    const { data: providersData, error: providersError } = await query

    if (providersError) {
      console.error("Error fetching providers:", providersError)
      error = providersError
    } else {
      providers = providersData || []
    }
  } catch (err) {
    console.error("Error in Browse page:", err)
    error = err
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Find Service Providers</h1>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Filters sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-md p-4 mb-4">
            <h2 className="font-semibold text-lg mb-4">Search</h2>
            <SearchBar />
          </div>

          <div className="bg-white rounded-xl shadow-md p-4">
            <h2 className="font-semibold text-lg mb-4">Filter by Category</h2>
            <CategoryFilter categories={categories} selectedCategory={categoryId} />
          </div>
        </div>

        {/* Main content */}
        <div className="flex-grow">
          {error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <p>Error loading providers: {error.message || "Please try again later."}</p>
            </div>
          ) : providers.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <h3 className="text-xl font-semibold mb-2">No providers found</h3>
              <p className="text-slate-600">Try adjusting your search criteria or browse all available providers.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {providers.map((provider) => (
                <ProviderCard key={provider.id} provider={provider} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
