export default function TestimonialSection() {
  const testimonials = [
    {
      quote:
        "I found an amazing electrician through FixIt Finder. The whole process was smooth and the work was completed on time and within budget.",
      author: "Sarah Johnson",
      role: "Homeowner",
      image: "/placeholder.svg?key=44to7",
    },
    {
      quote:
        "As a plumber, FixIt Finder has helped me connect with new clients in my area. The platform is easy to use and has been great for my business.",
      author: "Michael Rodriguez",
      role: "Plumbing Professional",
      image: "/placeholder.svg?key=2jj27",
    },
    {
      quote:
        "I needed urgent HVAC repair and found a professional within hours through FixIt Finder. Excellent service and communication!",
      author: "David Chen",
      role: "Business Owner",
      image: "/placeholder.svg?key=5pas1",
    },
  ]

  return (
    <section className="py-16 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">What People Are Saying</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Hear from our satisfied customers and service providers about their experiences with FixIt Finder.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="card p-6">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full overflow-hidden mr-4">
                  <img
                    src={testimonial.image || "/placeholder.svg"}
                    alt={testimonial.author}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-semibold">{testimonial.author}</h4>
                  <p className="text-sm text-slate-500">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-slate-700 italic">"{testimonial.quote}"</p>
              <div className="mt-4 flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
