import Link from "next/link"

export default function CategoryCard({ category }) {
  if (!category) {
    return null
  }

  return (
    <Link href={`/browse?category=${category.id}`} className="card hover:scale-105 transition-transform">
      <div className="p-6 flex flex-col items-center text-center">
        <div className="text-4xl mb-3">{category.icon || "🔧"}</div>
        <h3 className="font-semibold text-lg mb-1">{category.name || "Category"}</h3>
        <p className="text-sm text-slate-500 line-clamp-2">{category.description || "Service category"}</p>
      </div>
    </Link>
  )
}
