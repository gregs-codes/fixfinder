export default function ServiceCard({ service }) {
  return (
    <div className="border border-slate-200 rounded-lg p-4 hover:border-teal-200 transition-colors">
      <div className="flex items-center mb-2">
        <span className="text-2xl mr-2">{service.category?.icon}</span>
        <h3 className="font-semibold">{service.title}</h3>
      </div>

      {service.description && <p className="text-sm text-slate-600 mb-3">{service.description}</p>}

      {service.hourly_rate && (
        <div className="text-right">
          <span className="text-teal-600 font-semibold">${service.hourly_rate}/hr</span>
        </div>
      )}
    </div>
  )
}
