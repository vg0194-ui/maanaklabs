import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { apiFetch } from "../../api/client";
import StatCard from "../../components/dashboard/StatCard";
import { formatCurrency } from "../../utils/formatters";

function AdminDashboardPage() {
  const { token } = useAuth();
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    apiFetch("/admin/dashboard", { token })
      .then((response) => setMetrics(response.metrics))
      .catch(() => setMetrics(null));
  }, [token]);

  if (!metrics) {
    return <div className="panel p-8">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="panel p-8">
        <h1 className="text-3xl font-extrabold">Admin dashboard</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          Monitor request volume, payment flow, testing progress, and revenue from one place.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Requests" value={metrics.totalRequests} />
        <StatCard label="Pending Payments" value={metrics.pendingPayments} />
        <StatCard label="Paid Requests" value={metrics.paidRequests} />
        <StatCard label="Samples Awaited" value={metrics.samplesAwaited} />
        <StatCard label="Samples Received" value={metrics.samplesReceived} />
        <StatCard label="Under Testing" value={metrics.underTesting} />
        <StatCard label="Completed Reports" value={metrics.completedReports} />
        <StatCard label="Revenue Summary" value={formatCurrency(metrics.revenueSummary)} />
      </div>
    </div>
  );
}

export default AdminDashboardPage;

