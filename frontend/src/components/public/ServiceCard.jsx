import { Link } from "react-router-dom";
import { ArrowRight, BadgeIndianRupee } from "lucide-react";
import { formatCurrency } from "../../utils/formatters";

function ServiceCard({ service }) {
  return (
    <article className="panel flex h-full flex-col p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-blue">Testing service</p>
          <h3 className="mt-3 text-2xl font-bold">{service.name}</h3>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ${
            service.isActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"
          }`}
        >
          {service.isActive ? "Active" : "Inactive"}
        </span>
      </div>
      <p className="mt-4 flex-1 text-sm leading-7 text-slate-600">{service.description}</p>
      <div className="mt-6 space-y-2 text-sm text-slate-600">
        <p>Required sample: {service.sampleQuantity}</p>
        <p>Estimated time: {service.estimatedTestingTime}</p>
        <p className="flex items-center gap-1 font-semibold text-brand-green">
          <BadgeIndianRupee className="h-4 w-4" />
          {formatCurrency(service.rate)}
        </p>
      </div>
      <Link to={`/services/${service.slug}`} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-blue">
        View details
        <ArrowRight className="h-4 w-4" />
      </Link>
    </article>
  );
}

export default ServiceCard;

