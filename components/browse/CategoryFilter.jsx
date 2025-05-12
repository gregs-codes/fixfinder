"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"

export default function CategoryFilter({ categories, selectedCategory }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleCategoryChange = (categoryId) => {
    const params = new URLSearchParams(searchParams)

    if (categoryId) {
      params.set("category", categoryId)
    } else {
      params.delete("category")
    }

    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="space-y-2">
      <div
        className={`cursor-pointer p-2 rounded-md ${!selectedCategory ? "bg-teal-50 text-teal-700" : "hover:bg-slate-50"}`}
        onClick={() => handleCategoryChange(null)}
      >
        All Categories
      </div>

      {categories.map((category) => (
        <div
          key={category.id}
          className={`cursor-pointer p-2 rounded-md flex items-center ${
            selectedCategory === category.id ? "bg-teal-50 text-teal-700" : "hover:bg-slate-50"
          }`}
          onClick={() => handleCategoryChange(category.id)}
        >
          <span className="mr-2">{category.icon}</span>
          {category.name}
        </div>
      ))}
    </div>
  )
}
