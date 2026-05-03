import { Link } from "react-router-dom";
import { ArrowRight, FlaskConical } from "lucide-react";

const serviceImageMap = {
  "germination-test": "/images/maanak-germination-tray-2.jpeg",
  "physical-purity-test": "/images/maanak-physical-purity-test.jpg",
  "moisture-test": "/images/maanak-moisture-test.jpg",
  "seed-vigour-test": "/images/maanak-seed-vigour-test.jpg",
  "seed-health-test": "https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&w=1200&q=80",
  "genetic-purity-test": "https://images.unsplash.com/photo-1532187643603-ba119ca4109e?auto=format&fit=crop&w=1200&q=80",
  "grow-out-test": "/images/maanak-grow-out-test.jpg",
  "other-seed-quality-tests": "/images/maanak-germination-tray-1.jpeg",
  default: "/images/maanak-lab-setup.jpeg",
};

function getServiceImage(service) {
  if (service?.slug && serviceImageMap[service.slug]) {
    return serviceImageMap[service.slug];
  }

  const serviceName = (service?.name || "").toLowerCase();

  if (serviceName.includes("germination")) return serviceImageMap["germination-test"];
  if (serviceName.includes("physical purity") || serviceName.includes("purity")) {
    return serviceImageMap["physical-purity-test"];
  }
  if (serviceName.includes("moisture")) return serviceImageMap["moisture-test"];
  if (serviceName.includes("vigour")) return serviceImageMap["seed-vigour-test"];
  if (serviceName.includes("health")) return serviceImageMap["seed-health-test"];
  if (serviceName.includes("genetic")) return serviceImageMap["genetic-purity-test"];
  if (serviceName.includes("grow")) return serviceImageMap["grow-out-test"];

  return serviceImageMap.default;
}

function ServiceCard({ service }) {
  return (
    <article className="panel flex h-full flex-col overflow-hidden p-0">
      <img
        src={getServiceImage(service)}
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
