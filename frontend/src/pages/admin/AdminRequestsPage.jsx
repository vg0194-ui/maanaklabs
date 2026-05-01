import { useEffect, useState } from "react";
import { apiFetch, uploadFile } from "../../api/client";
import { useAuth } from "../../contexts/AuthContext";
import StatusBadge from "../../components/dashboard/StatusBadge";

const statuses = [
  "Request Created",
  "Payment Pending",
  "Payment Completed",
  "Sample Awaited",
  "Sample Received",
  "Under Testing",
  "Report Generated",
  "Completed",
  "Rejected",
];

function AdminRequestsPage() {
  const { token } = useAuth();
  const [requests, setRequests] = useState([]);
  const [filters, setFilters] = useState({
    date: "",
    user: "",
    crop: "",
    variety: "",
    paymentStatus: "",
    testingStatus: "",
  });
  const [message, setMessage] = useState("");

  const fetchRequests = async () => {
    const query = new URLSearchParams(Object.entries(filters).filter(([, value]) => value)).toString();
    const response = await apiFetch(`/admin/requests${query ? `?${query}` : ""}`, { token });
    setRequests(response.requests);
  };

  useEffect(() => {
    fetchRequests().catch(() => setRequests([]));
  }, [token]);

  const handleStatusChange = async (requestId, requestStatus) => {
    await apiFetch(`/admin/requests/${requestId}/status`, {
      method: "PATCH",
      token,
      body: { requestStatus },
    });
    setMessage("Request status updated.");
    fetchRequests();
  };

  const handleUpload = async (requestId, file) => {
    if (!file) return;
    await uploadFile(`/reports/${requestId}/upload`, file, token);
    setMessage("Report uploaded.");
    fetchRequests();
  };

  return (
    <div className="panel p-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold">Requests</h1>
          <p className="mt-2 text-sm text-slate-600">Filter, update status, and upload final reports.</p>
        </div>
        <div className="grid gap-3 md:grid-cols-3 xl:w-[760px]">
          {Object.entries(filters).map(([field, value]) =>
            field === "paymentStatus" || field === "testingStatus" ? (
              <select key={field} className="field" value={value} onChange={(event) => setFilters({ ...filters, [field]: event.target.value })}>
                <option value="">{field === "paymentStatus" ? "All payment statuses" : "All testing statuses"}</option>
                {(field === "paymentStatus" ? ["Pending", "Paid"] : statuses).map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            ) : (
              <input key={field} className="field" placeholder={field} value={value} onChange={(event) => setFilters({ ...filters, [field]: event.target.value })} />
            )
          )}
          <button type="button" className="btn-primary" onClick={() => fetchRequests()}>
            Apply filters
          </button>
        </div>
      </div>
      {message ? <p className="mt-4 text-sm font-medium text-emerald-700">{message}</p> : null}
      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-slate-500">
            <tr>
              <th className="pb-3">Request</th>
              <th className="pb-3">User</th>
              <th className="pb-3">Payment</th>
              <th className="pb-3">Status</th>
              <th className="pb-3">Update</th>
              <th className="pb-3">Report</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr key={request._id} className="border-t border-slate-100 align-top">
                <td className="py-4 font-semibold text-slate-800">{request.requestNumber}</td>
                <td className="py-4">
                  <div>{request.contactName}</div>
                  <div className="text-slate-500">{request.contactEmail}</div>
                </td>
                <td className="py-4">
                  <StatusBadge status={request.paymentStatus} />
                </td>
                <td className="py-4">
                  <StatusBadge status={request.requestStatus} />
                </td>
                <td className="py-4">
                  <select
                    className="field min-w-52"
                    value={request.requestStatus}
                    onChange={(event) => handleStatusChange(request._id, event.target.value)}
                  >
                    {statuses.map((status) => (
                      <option key={status}>{status}</option>
                    ))}
                  </select>
                </td>
                <td className="py-4">
                  <input type="file" accept="application/pdf" onChange={(event) => handleUpload(request._id, event.target.files?.[0])} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminRequestsPage;

