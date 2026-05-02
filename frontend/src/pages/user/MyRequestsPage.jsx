import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch, downloadProtectedFile } from "../../api/client";
import { useAuth } from "../../contexts/AuthContext";
import StatusBadge from "../../components/dashboard/StatusBadge";
import { formatCurrency, formatDate } from "../../utils/formatters";

function MyRequestsPage() {
  const { token } = useAuth();
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState("");
  const [downloading, setDownloading] = useState("");

  useEffect(() => {
    apiFetch("/requests", { token })
      .then((response) => setRequests(response.requests))
      .catch(() => setRequests([]));
  }, [token]);

  const handleDownload = async (request, type) => {
    setDownloading(`${request._id}-${type}`);
    setMessage("");

    try {
      await downloadProtectedFile(
        type === "report" ? `/reports/${request._id}/download` : `/reports/${request._id}/invoice-download`,
        token,
        `${request.requestNumber}-${type}.pdf`
      );
    } catch (error) {
      setMessage(error.message);
    } finally {
      setDownloading("");
    }
  };

  return (
    <div className="panel p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold">Report section</h1>
          <p className="mt-2 text-sm text-slate-600">
            Track request ID, number of samples, testing status, and download report or invoice when uploaded by admin.
          </p>
        </div>
        <Link to="/dashboard/new-request" className="btn-primary">
          New request
        </Link>
      </div>
      {message ? <p className="mt-4 text-sm font-medium text-emerald-700">{message}</p> : null}
      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-slate-500">
            <tr>
              <th className="pb-3">Request ID</th>
              <th className="pb-3">Date</th>
              <th className="pb-3">No. of sample</th>
              <th className="pb-3">Amount</th>
              <th className="pb-3">Status</th>
              <th className="pb-3">Report</th>
              <th className="pb-3">Invoice</th>
              <th className="pb-3">Download Documents</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr key={request._id} className="border-t border-slate-100 align-top">
                <td className="py-4 font-semibold text-slate-800">{request.requestNumber}</td>
                <td className="py-4">{formatDate(request.createdAt)}</td>
                <td className="py-4">{request.sampleCount || request.totalSamples || 0}</td>
                <td className="py-4">{formatCurrency(request.totalAmount)}</td>
                <td className="py-4">
                  <div className="flex flex-col gap-2">
                    <StatusBadge status={request.paymentStatus} />
                    <StatusBadge status={request.requestStatus} />
                  </div>
                </td>
                <td className="py-4">
                  {request.hasReport ? (
                    <button
                      type="button"
                      onClick={() => handleDownload(request, "report")}
                      className="text-sm font-semibold text-brand-blue"
                      disabled={downloading === `${request._id}-report`}
                    >
                      {downloading === `${request._id}-report` ? "Downloading..." : "Download report"}
                    </button>
                  ) : (
                    <span className="text-sm text-slate-500">Reporting awaiting</span>
                  )}
                </td>
                <td className="py-4">
                  {request.hasInvoice ? (
                    <button
                      type="button"
                      onClick={() => handleDownload(request, "invoice")}
                      className="text-sm font-semibold text-brand-blue"
                      disabled={downloading === `${request._id}-invoice`}
                    >
                      {downloading === `${request._id}-invoice` ? "Downloading..." : "Download invoice"}
                    </button>
                  ) : (
                    <span className="text-sm text-slate-500">Invoice generation pending</span>
                  )}
                </td>
                <td className="py-4">
                  {request.paymentStatus === "Paid" ? (
                    <Link to={`/dashboard/requests/${request._id}/documents`} className="text-sm font-semibold text-brand-blue">
                      Download Documents
                    </Link>
                  ) : (
                    <Link to={`/dashboard/payment-success/${request._id}`} className="text-sm font-semibold text-brand-blue">
                      Pay now
                    </Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MyRequestsPage;
