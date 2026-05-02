import { Link } from "react-router-dom";
import { ArrowRight, FlaskConical } from "lucide-react";

const serviceImageMap = {
  germination: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1200&q=80",
  purity: "https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=1200&q=80",
  moisture: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1200&q=80",
  vigour: "https://images.unsplash.com/photo-1457530378978-8bac673b8062?auto=format&fit=crop&w=1200&q=80",
  health: "https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&w=1200&q=80",
  genetic: "https://images.unsplash.com/photo-1532187643603-ba119ca4109e?auto=format&fit=crop&w=1200&q=80",
  grow: "https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?auto=format&fit=crop&w=1200&q=80",
  default: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
};

function getServiceImage(name = "") {
  const serviceName = name.toLowerCase();

  if (serviceName.includes("germination")) return serviceImageMap.germination;
  if (serviceName.includes("physical purity") || serviceName.includes("purity")) return serviceImageMap.purity;
  if (serviceName.includes("moisture")) return serviceImageMap.moisture;
  if (serviceName.includes("vigour")) return serviceImageMap.vigour;
  if (serviceName.includes("health")) return serviceImageMap.health;
  if (serviceName.includes("genetic")) return serviceImageMap.genetic;
  if (serviceName.includes("grow")) return serviceImageMap.grow;

  return serviceImageMap.default;
}

function ServiceCard({ service }) {
  return (
    <article className="panel flex h-full flex-col overflow-hidden p-0">
      <img
        src={getServiceImage(service.name)}
        alt={service.name}
        className="h-52 w-full object-cover"
      />
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-brand-mist p-3">
            <FlaskConical className="h-5 w-5 text-brand-green" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-blue">Testing service</p>
            <h3 className="mt-3 text-2xl font-bold">{service.name}</h3>
          </div>
        </div>
        <p className="mt-4 flex-1 text-sm leading-7 text-slate-600">{service.description}</p>
        <div className="mt-6 space-y-2 text-sm text-slate-600">
          <p>Required sample: {service.sampleQuantity}</p>
          <p>Estimated time: {service.estimatedTestingTime}</p>
        </div>
        <Link
          to={`/services/${service.slug}`}
          className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-blue"
        >
          View details
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}

export default ServiceCard;
