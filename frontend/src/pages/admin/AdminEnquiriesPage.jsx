import { useEffect, useState } from "react";
import { apiFetch } from "../../api/client";
import { useAuth } from "../../contexts/AuthContext";
import { formatDate } from "../../utils/formatters";

const statusStyles = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  sent: "bg-emerald-50 text-emerald-700 border-emerald-200",
  partial: "bg-sky-50 text-sky-700 border-sky-200",
  failed: "bg-rose-50 text-rose-700 border-rose-200",
  not_configured: "bg-slate-100 text-slate-600 border-slate-200",
};

function AdminEnquiriesPage() {
  const { token } = useAuth();
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiFetch("/admin/enquiries", { token })
      .then((response) => setEnquiries(response.enquiries || []))
      .catch(() => setEnquiries([]))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return <div className="panel p-8">Loading enquiries...</div>;
  }

  return (
    <div className="panel p-6">
      <div>
        <h1 className="text-3xl font-extrabold">Enquiries</h1>
        <p className="mt-2 text-sm text-slate-600">
          Review website enquiries saved from the quick enquiry form, including delivery status for admin and acknowledgement emails.
        </p>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-slate-500">
            <tr>
              <th className="pb-3">Date</th>
              <th className="pb-3">Name</th>
              <th className="pb-3">Mobile</th>
              <th className="pb-3">Email</th>
              <th className="pb-3">Message</th>
              <th className="pb-3">Email Status</th>
              <th className="pb-3">Email Error</th>
            </tr>
          </thead>
          <tbody>
            {enquiries.map((enquiry) => (
              <tr key={enquiry._id} className="border-t border-slate-100 align-top">
                <td className="py-4 whitespace-nowrap">{formatDate(enquiry.createdAt)}</td>
                <td className="py-4 font-medium text-slate-800">{enquiry.name}</td>
                <td className="py-4 whitespace-nowrap">{enquiry.mobile}</td>
                <td className="py-4 whitespace-nowrap">{enquiry.email}</td>
                <td className="py-4 min-w-[280px] max-w-[420px] whitespace-pre-wrap text-slate-700">{enquiry.message}</td>
                <td className="py-4">
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${
                      statusStyles[enquiry.emailStatus] || statusStyles.pending
                    }`}
                  >
                    {(enquiry.emailStatus || "pending").replace("_", " ")}
                  </span>
                </td>
                <td className="py-4 max-w-[260px] whitespace-pre-wrap text-slate-500">
                  {enquiry.emailError || "No error"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!enquiries.length ? (
        <div className="mt-6 rounded-3xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
          No enquiries have been submitted yet.
        </div>
      ) : null}
    </div>
  );
}

export default AdminEnquiriesPage;
