"use client"

import { useCategories } from "@/hooks/use-categories"
import CategoryCard from "@/components/home/CategoryCard"

export default function ClientCategoriesGrid() {
  const { categories, isLoading, isError } = useCategories()

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse bg-white rounded-xl h-40"></div>
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        <p>There was an error loading categories. Please try again later.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
      {categories.length > 0 ? (
        categories.map((category) => <CategoryCard key={category.id} category={category} />)
      ) : (
        <p className="col-span-full text-center text-slate-500">No categories found.</p>
      )}
    </div>
  )
}
