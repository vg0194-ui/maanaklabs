import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiFetch } from "../../api/client";
import { useAuth } from "../../contexts/AuthContext";
import StatusBadge from "../../components/dashboard/StatusBadge";
import SampleGuideSection from "../../components/public/SampleGuideSection";
import { formatCurrency } from "../../utils/formatters";

function loadRazorpayCheckout() {
  if (window.Razorpay) {
    return Promise.resolve(true);
  }

  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

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

  const startPayment = async () => {
    setLoading(true);
    setMessage("");

    try {
      const sdkLoaded = await loadRazorpayCheckout();
      if (!sdkLoaded) {
        throw new Error("Unable to load Razorpay checkout. Please check your connection and try again.");
      }

      const response = await apiFetch("/payments/create-order", {
        method: "POST",
        token,
        body: { requestId },
      });

      const options = {
        key: response.order.key,
        amount: response.order.amount,
        currency: response.order.currency,
        name: response.order.name,
        description: response.order.description,
        image: `${window.location.origin}/images/maanak-labs-logo.png`,
        order_id: response.order.id,
        prefill: response.order.prefill,
        notes: response.order.notes,
        theme: response.order.theme,
        handler: async (checkoutResponse) => {
          try {
            const verification = await apiFetch("/payments/verify", {
              method: "POST",
              token,
              body: {
                requestId,
                ...checkoutResponse,
              },
            });

            setMessage(verification.message);
            await fetchRequest();
          } catch (error) {
            setMessage(error.message);
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            setMessage("Payment window closed before completion.");
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", (event) => {
        setLoading(false);
        setMessage(event.error?.description || "Payment failed. Please try again.");
      });
      razorpay.open();
    } catch (error) {
      setLoading(false);
      setMessage(error.message);
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
          Payments are verified on the server using your Razorpay order, payment ID, and signature. Configure the
          Razorpay webhook to confirm captured payments reliably in production.
        </p>
        {requestData.request.paymentStatus !== "Paid" ? (
          <button type="button" onClick={startPayment} className="btn-primary mt-6" disabled={loading}>
            {loading ? "Opening Razorpay..." : "Pay with Razorpay"}
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

