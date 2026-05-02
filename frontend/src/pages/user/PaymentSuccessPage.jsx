import { useEffect, useState } from "react";
import { Download, ExternalLink } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { apiFetch, API_URL, downloadProtectedFile } from "../../api/client";
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
  const [downloading, setDownloading] = useState("");

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

  const downloadDocument = async (type, label) => {
    setDownloading(type);
    setMessage("");
    try {
      const fileNameBase = requestData.request.requestNumber;
      const config = {
        slips: { path: `/pdfs/requests/${requestId}/sample-slips`, name: `${fileNameBase}-sample-slips.pdf` },
        letter: { path: `/pdfs/requests/${requestId}/request-letter`, name: `${fileNameBase}-request-letter.pdf` },
        address: { path: `/pdfs/requests/${requestId}/address-label`, name: `${fileNameBase}-address-label.pdf` },
      }[type];

      await downloadProtectedFile(config.path, token, config.name);
      setMessage(`${label} downloaded successfully.`);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setDownloading("");
    }
  };

  if (!requestData) {
    return <div className="panel p-8">Loading request...</div>;
  }

  const isPaid = requestData.request.paymentStatus === "Paid";

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
          Complete payment first. After payment you can download sample slips, the request letter, and the lab address
          label before dispatching the master bag to Maanak Labs.
        </p>

        {!isPaid ? (
          <button type="button" onClick={startPayment} className="btn-primary mt-6" disabled={loading}>
            {loading ? "Opening Razorpay..." : "Pay with Razorpay"}
          </button>
        ) : (
          <div className="mt-6 space-y-4">
            <div className="grid gap-3 lg:grid-cols-3">
              <button type="button" onClick={() => downloadDocument("slips", "Sample slips")} className="btn-primary gap-2" disabled={downloading === "slips"}>
                <Download className="h-4 w-4" />
                {downloading === "slips" ? "Downloading..." : "Download Sample Slips"}
              </button>
              <button type="button" onClick={() => downloadDocument("letter", "Request letter")} className="btn-secondary gap-2" disabled={downloading === "letter"}>
                <Download className="h-4 w-4" />
                {downloading === "letter" ? "Downloading..." : "Download Request Letter"}
              </button>
              <button type="button" onClick={() => downloadDocument("address", "Address label")} className="btn-secondary gap-2" disabled={downloading === "address"}>
                <Download className="h-4 w-4" />
                {downloading === "address" ? "Downloading..." : "Download Address Label"}
              </button>
            </div>

            <div className="rounded-3xl bg-slate-50 p-5 text-sm leading-7 text-slate-700">
              <p className="font-semibold text-brand-green">Dispatch instructions</p>
              <ol className="mt-3 list-decimal space-y-2 pl-5">
                <li>Withdraw the sample properly and use the sample weight mentioned in the crop-wise sample size list.</li>
                <li>Put the printed sample slip inside the sample pouch and write the Sample ID on the pouch with a non-erasable marker.</li>
                <li>Seal the sample pouch using thread or another secure method so the pouch does not open in transit.</li>
                <li>Keep all sealed sample pouches in one master bag and place the request letter inside that master bag.</li>
                <li>Close the master bag tightly and paste the address label using tape or glue so it reaches the correct lab address.</li>
              </ol>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <a href={`${API_URL}/public/sample-size-guide.pdf`} target="_blank" rel="noreferrer" className="text-sm font-semibold text-brand-blue">
                  Open crop-wise sample size PDF <ExternalLink className="ml-1 inline h-4 w-4" />
                </a>
                <Link to={`/dashboard/requests/${requestId}/documents`} className="text-sm font-semibold text-brand-blue">
                  Open combined PDF page
                </Link>
              </div>
            </div>
          </div>
        )}

        {message ? <p className="mt-4 text-sm font-medium text-emerald-700">{message}</p> : null}
      </div>

      <SampleGuideSection compact />
    </div>
  );
}

export default PaymentSuccessPage;
