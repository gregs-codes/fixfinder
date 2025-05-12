import Link from "next/link"
import { createServerSupabase } from "@/lib/supabase-server"
import CategoryCard from "@/components/home/CategoryCard"
import HowItWorks from "@/components/home/HowItWorks"
import TestimonialSection from "@/components/home/TestimonialSection"

export const dynamic = "force-dynamic"

export default async function Home() {
  const supabase = createServerSupabase()
  let categories = []
  let error = null

  try {
    // Fetch categories
    const { data, error: categoriesError } = await supabase.from("categories").select("*").order("name")

    if (categoriesError) {
      console.error("Error fetching categories:", categoriesError)
      error = categoriesError
    } else {
      categories = data || []
    }
  } catch (err) {
    console.error("Error in Home page:", err)
    error = err
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-teal-500 to-indigo-600 text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Find Local Professionals For Any Job</h1>
              <p className="text-xl mb-8">
                Connect with trusted local service providers for all your home and business needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/browse" className="btn-primary text-center">
                  Find Help
                </Link>
                <Link
                  href="/auth/register?provider=true"
                  className="bg-white text-indigo-600 hover:bg-slate-100 font-semibold py-2 px-4 rounded-lg transition-colors text-center"
                >
                  Join as a Provider
                </Link>
              </div>
            </div>
            <div className="md:w-1/2">
              <div className="relative h-64 md:h-96 rounded-xl overflow-hidden shadow-2xl">
                <img
                  src="/professional-service-provider.png"
                  alt="Professional service provider"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Browse Service Categories</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Find the right professional for any job across a wide range of service categories.
            </p>
          </div>

          {error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p>There was an error loading categories. Please try again later.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
              {categories.length > 0 ? (
                categories.map((category) => <CategoryCard key={category.id} category={category} />)
              ) : (
                <p className="col-span-full text-center text-slate-500">No categories found.</p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <HowItWorks />

      {/* Testimonials */}
      <TestimonialSection />

      {/* CTA Section */}
      <section className="bg-indigo-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who have found reliable service professionals on FixIt Finder.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/browse"
              className="bg-white text-indigo-600 hover:bg-slate-100 font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Find a Professional
            </Link>
            <Link
              href="/auth/register?provider=true"
              className="bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Become a Provider
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
