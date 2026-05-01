import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiFetch } from "../../api/client";
import { useAuth } from "../../contexts/AuthContext";
import StatusBadge from "../../components/dashboard/StatusBadge";
import SampleGuideSection from "../../components/public/SampleGuideSection";
import { formatCurrency } from "../../utils/formatters";

function PaymentSuccessPage() {
  const { requestId } = useParams();
  const { token } = useAuth();
  const [requestData, setRequestData] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchRequest = async () => {
    const response = await apiFetch(`/requests/${requestId}`, { token });
    setRequestData(response);
  };

  useEffect(() => {
    fetchRequest().catch(() => setRequestData(null));
  }, [requestId, token]);

  const simulatePayment = async () => {
    setLoading(true);
    setMessage("");
    try {
      await apiFetch("/payments/create-order", {
        method: "POST",
        token,
        body: { requestId },
      });
      await apiFetch("/payments/verify", {
        method: "POST",
        token,
        body: { requestId },
      });
      setMessage("Payment completed in demo mode. Replace with official Razorpay verification in production.");
      await fetchRequest();
    } finally {
      setLoading(false);
    }
  };

  if (!requestData) {
    return <div className="panel p-8">Loading request...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="panel p-8">
        <h1 className="text-3xl font-extrabold">Payment and document flow</h1>
        <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
          <p>Request number: {requestData.request.requestNumber}</p>
          <p>Total amount: {formatCurrency(requestData.request.totalAmount)}</p>
          <p>
            Payment: <StatusBadge status={requestData.request.paymentStatus} />
          </p>
          <p>
            Testing status: <StatusBadge status={requestData.request.requestStatus} />
          </p>
        </div>
        <p className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm leading-7 text-slate-600">
          This scaffold uses a placeholder Razorpay-ready flow. Connect the official Razorpay order creation and signature
          verification before going live.
        </p>
        {requestData.request.paymentStatus !== "Paid" ? (
          <button type="button" onClick={simulatePayment} className="btn-primary mt-6" disabled={loading}>
            {loading ? "Processing..." : "Simulate successful payment"}
          </button>
        ) : (
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link to={`/dashboard/requests/${requestId}/documents`} className="btn-primary">
              Open PDF download page
            </Link>
            <Link to="/dashboard/requests" className="btn-secondary">
              Back to requests
            </Link>
          </div>
        )}
        {message ? <p className="mt-4 text-sm font-medium text-emerald-700">{message}</p> : null}
      </div>

      <SampleGuideSection compact />
    </div>
  );
}

export default PaymentSuccessPage;

