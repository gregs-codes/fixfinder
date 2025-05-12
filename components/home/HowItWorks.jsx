export default function HowItWorks() {
  const steps = [
    {
      icon: "🔍",
      title: "Search",
      description: "Browse through our categories or search for a specific service you need.",
    },
    {
      icon: "👥",
      title: "Connect",
      description: "View profiles, compare rates, and connect with the right professional.",
    },
    {
      icon: "💬",
      title: "Communicate",
      description: "Discuss your project details directly through our messaging system.",
    },
    {
      icon: "✅",
      title: "Complete",
      description: "Get your project done by skilled professionals and leave a review.",
    },
  ]

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">How It Works</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            FixIt Finder makes it easy to find and hire local service professionals in just a few simple steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="card p-6 flex flex-col items-center text-center">
              <div className="text-4xl mb-4">{step.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-slate-600">{step.description}</p>
              <div className="mt-4 w-8 h-8 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center font-bold">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
