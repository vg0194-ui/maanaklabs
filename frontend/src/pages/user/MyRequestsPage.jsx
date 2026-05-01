import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../../api/client";
import { useAuth } from "../../contexts/AuthContext";
import StatusBadge from "../../components/dashboard/StatusBadge";
import { formatCurrency, formatDate } from "../../utils/formatters";

function MyRequestsPage() {
  const { token } = useAuth();
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    apiFetch("/requests", { token })
      .then((response) => setRequests(response.requests))
      .catch(() => setRequests([]));
  }, [token]);

  return (
    <div className="panel p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold">My requests</h1>
        <Link to="/dashboard/new-request" className="btn-primary">
          New request
        </Link>
      </div>
      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-slate-500">
            <tr>
              <th className="pb-3">Request</th>
              <th className="pb-3">Date</th>
              <th className="pb-3">Amount</th>
              <th className="pb-3">Payment</th>
              <th className="pb-3">Status</th>
              <th className="pb-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr key={request._id} className="border-t border-slate-100">
                <td className="py-4 font-semibold text-slate-800">{request.requestNumber}</td>
                <td className="py-4">{formatDate(request.createdAt)}</td>
                <td className="py-4">{formatCurrency(request.totalAmount)}</td>
                <td className="py-4">
                  <StatusBadge status={request.paymentStatus} />
                </td>
                <td className="py-4">
                  <StatusBadge status={request.requestStatus} />
                </td>
                <td className="py-4">
                  {request.paymentStatus === "Paid" ? (
                    <Link to={`/dashboard/requests/${request._id}/documents`} className="text-sm font-semibold text-brand-blue">
                      Documents
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

