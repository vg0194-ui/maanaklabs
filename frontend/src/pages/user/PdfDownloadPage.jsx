import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { API_URL, apiFetch, downloadProtectedFile } from "../../api/client";
import { useAuth } from "../../contexts/AuthContext";
import SampleGuideSection from "../../components/public/SampleGuideSection";
import StatusBadge from "../../components/dashboard/StatusBadge";

const documentConfigs = {
  combined: {
    label: "Download combined PDF",
    path: (requestId) => `/pdfs/requests/${requestId}/combined`,
    fileName: (requestNumber) => `${requestNumber}.pdf`,
    className: "btn-primary",
  },
  slips: {
    label: "Sample slips",
    path: (requestId) => `/pdfs/requests/${requestId}/sample-slips`,
    fileName: (requestNumber) => `${requestNumber}-sample-slips.pdf`,
    className: "btn-secondary",
  },
  letter: {
    label: "Request letter",
    path: (requestId) => `/pdfs/requests/${requestId}/request-letter`,
    fileName: (requestNumber) => `${requestNumber}-request-letter.pdf`,
    className: "btn-secondary",
  },
  address: {
    label: "Address label",
    path: (requestId) => `/pdfs/requests/${requestId}/address-label`,
    fileName: (requestNumber) => `${requestNumber}-address-label.pdf`,
    className: "btn-secondary",
  },
};

function PdfDownloadPage() {
  const { requestId } = useParams();
  const { token } = useAuth();
  const [requestData, setRequestData] = useState(null);
  const [message, setMessage] = useState("");
  const [downloading, setDownloading] = useState("");

  useEffect(() => {
    apiFetch(`/requests/${requestId}`, { token })
      .then((response) => setRequestData(response))
      .catch(() => setRequestData(null));
  }, [requestId, token]);

  const handleDownload = async (type) => {
    setDownloading(type);
    setMessage("");

    try {
      const config = documentConfigs[type];
      await downloadProtectedFile(
        config.path(requestId),
        token,
        config.fileName(requestData.request.requestNumber)
      );
    } catch (error) {
      setMessage(error.message);
    } finally {
      setDownloading("");
    }
  };

  if (!requestData) {
    return <div className="panel p-8">Loading documents...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="panel p-8">
        <h1 className="text-3xl font-extrabold">PDF downloads</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          Download the request letter, sample slips, combined dispatch PDF, and address label after successful payment.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <StatusBadge status={requestData.request.paymentStatus} />
          <StatusBadge status={requestData.request.requestStatus} />
        </div>
        <div className="mt-8 grid gap-3 lg:grid-cols-2">
          {Object.entries(documentConfigs).map(([key, config]) => (
            <button
              key={key}
              type="button"
              onClick={() => handleDownload(key)}
              className={config.className}
              disabled={downloading === key}
            >
              {downloading === key ? "Downloading..." : config.label}
            </button>
          ))}
          <a href={`${API_URL}/public/sample-packing-guide.pdf`} target="_blank" rel="noreferrer" className="btn-secondary">
            Packing guide PDF
          </a>
          <a href={`${API_URL}/public/sample-size-guide.pdf`} target="_blank" rel="noreferrer" className="btn-secondary">
            Crop-wise sample size PDF
          </a>
        </div>
        {message ? <p className="mt-4 text-sm font-medium text-rose-600">{message}</p> : null}
        <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm leading-7 text-slate-600">
          The sample slip sheet is formatted for A4 printing with up to 8 slips per page. Use the address label on the
          master bag and keep the request letter inside the master bag before dispatch.
        </div>
        <Link to="/dashboard/requests" className="mt-6 inline-flex text-sm font-semibold text-brand-blue">
          Back to request list
        </Link>
      </div>

      <SampleGuideSection compact />
    </div>
  );
}

export default PdfDownloadPage;
