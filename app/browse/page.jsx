"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useCategories } from "@/hooks/use-categories"
import { useProviders } from "@/hooks/use-providers"
import ProviderCard from "@/components/browse/ProviderCard"
import CategoryFilter from "@/components/browse/CategoryFilter"
import SearchBar from "@/components/browse/SearchBar"

export default function BrowsePage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // Get search parameters
  const categoryId = searchParams.get("category") ? Number.parseInt(searchParams.get("category")) : null
  const searchQuery = searchParams.get("q") || ""
  const location = searchParams.get("location") || ""

  // Create filters object
  const [filters, setFilters] = useState({
    search: searchQuery,
    location: location,
  })

  // Fetch categories and providers using React Query
  const { categories, isLoading: categoriesLoading } = useCategories()
  const { providers, isLoading: providersLoading, isError, error } = useProviders(filters)

  // Update filters when search params change
  useEffect(() => {
    setFilters({
      search: searchQuery,
      location: location,
    })
  }, [searchQuery, location])

  // Filter providers by category if needed
  const filteredProviders = categoryId
    ? providers.filter((provider) => provider.services?.some((service) => service.category_id === categoryId))
    : providers

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
            {categoriesLoading ? (
              <div className="animate-pulse space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-8 bg-slate-200 rounded"></div>
                ))}
              </div>
            ) : (
              <CategoryFilter categories={categories} selectedCategory={categoryId} />
            )}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-grow">
          {isError ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <p>Error loading providers: {error?.message || "Please try again later."}</p>
            </div>
          ) : providersLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse bg-white rounded-xl shadow-md h-64"></div>
              ))}
            </div>
          ) : filteredProviders.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <h3 className="text-xl font-semibold mb-2">No providers found</h3>
              <p className="text-slate-600">Try adjusting your search criteria or browse all available providers.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProviders.map((provider) => (
                <ProviderCard key={provider.id} provider={provider} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
