import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import SampleGuideSection from "../../components/public/SampleGuideSection";
import StatCard from "../../components/dashboard/StatCard";
import StatusBadge from "../../components/dashboard/StatusBadge";
import { useAuth } from "../../contexts/AuthContext";
import { apiFetch } from "../../api/client";
import { formatCurrency, formatDate } from "../../utils/formatters";

function UserDashboardPage() {
  const { token, user } = useAuth();
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    apiFetch("/requests", { token })
      .then((response) => setRequests(response.requests))
      .catch(() => setRequests([]));
  }, [token]);

  const metrics = useMemo(
    () => ({
      total: requests.length,
      paid: requests.filter((item) => item.paymentStatus === "Paid").length,
      pending: requests.filter((item) => item.paymentStatus === "Pending").length,
      value: requests.reduce((sum, item) => sum + Number(item.totalAmount || 0), 0),
    }),
    [requests]
  );

  return (
    <div className="space-y-6">
      <div className="panel p-8">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-brand-blue">Welcome</p>
        <h1 className="mt-3 text-3xl font-extrabold">Hello, {user?.name}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
          Start a new request, complete payment, download your branded sample documents, and track testing progress
          online.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link to="/dashboard/new-request" className="btn-primary">
            Create new request
          </Link>
          <Link to="/dashboard/requests" className="btn-secondary">
            View request history
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Requests" value={metrics.total} />
        <StatCard label="Paid Requests" value={metrics.paid} />
        <StatCard label="Pending Payments" value={metrics.pending} />
        <StatCard label="Request Value" value={formatCurrency(metrics.value)} />
      </div>

      <div className="panel p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Recent requests</h2>
          <Link to="/dashboard/requests" className="text-sm font-semibold text-brand-blue">
            View all
          </Link>
        </div>
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-slate-500">
              <tr>
                <th className="pb-3">Request</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {requests.slice(0, 5).map((request) => (
                <tr key={request._id} className="border-t border-slate-100">
                  <td className="py-4 font-semibold text-slate-800">{request.requestNumber}</td>
                  <td className="py-4">{formatDate(request.createdAt)}</td>
                  <td className="py-4">{formatCurrency(request.totalAmount)}</td>
                  <td className="py-4">
                    <StatusBadge status={request.requestStatus} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="panel p-8">
        <h2 className="text-2xl font-bold">After payment, follow this packing flow</h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          Use the same guide shown in the PDF and document download page to make sure your samples reach the lab correctly.
        </p>
      </div>
      <SampleGuideSection compact />
    </div>
  );
}

export default UserDashboardPage;

