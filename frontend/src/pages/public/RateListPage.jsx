import SectionHeader from "../../components/public/SectionHeader";
import Seo from "../../components/Seo";
import { useSiteData } from "../../contexts/SiteDataContext";
import { formatCurrency, formatDate } from "../../utils/formatters";

function RateListPage() {
  const { rates } = useSiteData();
  const activeRates = rates.filter((rate) => rate.isActive !== false && rate.service?.isActive !== false);

  return (
    <section className="py-16">
      <Seo
        title="Seed Testing Rate List"
        description="View the active Maanak Labs testing rate list with service-wise charges, GST percentage, and effective dates for public reference."
        canonicalPath="/rate-list"
        keywords="seed testing rate list, seed lab charges, germination test charges, moisture test charges"
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Rate list"
          title="Current testing rates"
          description="Only rates that are currently active in the admin panel are shown here for public reference."
        />
        <div className="panel mt-10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-6 py-4">Service</th>
                  <th className="px-6 py-4">Crop</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">GST</th>
                  <th className="px-6 py-4">Effective Date</th>
                </tr>
              </thead>
              <tbody>
                {activeRates.map((rate) => (
                  <tr key={rate._id} className="border-t border-slate-100">
                    <td className="px-6 py-4 font-medium text-slate-800">{rate.service?.name || "Service"}</td>
                    <td className="px-6 py-4">{rate.crop || "All crops"}</td>
                    <td className="px-6 py-4">{formatCurrency(rate.amount)}</td>
                    <td className="px-6 py-4">{rate.gstPercentage}%</td>
                    <td className="px-6 py-4">{formatDate(rate.effectiveDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

export default RateListPage;
