import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { API_URL, apiFetch } from "../../api/client";
import { useAuth } from "../../contexts/AuthContext";
import SampleGuideSection from "../../components/public/SampleGuideSection";
import StatusBadge from "../../components/dashboard/StatusBadge";

function PdfDownloadPage() {
  const { requestId } = useParams();
  const { token } = useAuth();
  const [requestData, setRequestData] = useState(null);

  useEffect(() => {
    apiFetch(`/requests/${requestId}`, { token })
      .then((response) => setRequestData(response))
      .catch(() => setRequestData(null));
  }, [requestId, token]);

  if (!requestData) {
    return <div className="panel p-8">Loading documents...</div>;
  }

  const downloadUrl = `${API_URL}/pdfs/requests/${requestId}/combined`;
  const reportUrl = `${API_URL}/reports/${requestId}/download`;

  return (
    <div className="space-y-6">
      <div className="panel p-8">
        <h1 className="text-3xl font-extrabold">PDF downloads</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          Download the request letter, payment receipt summary, sample bag slips, packing instructions, and lab address
          label after successful payment.
        </p>
        <div className="mt-4 flex items-center gap-3">
          <StatusBadge status={requestData.request.paymentStatus} />
          <StatusBadge status={requestData.request.requestStatus} />
        </div>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <a href={downloadUrl} target="_blank" rel="noreferrer" className="btn-primary">
            Download combined PDF
          </a>
          <a href={`${API_URL}/public/sample-packing-guide.pdf`} target="_blank" rel="noreferrer" className="btn-secondary">
            Packing guide PDF
          </a>
          <a href={reportUrl} target="_blank" rel="noreferrer" className="btn-secondary">
            Final report PDF
          </a>
        </div>
        <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm leading-7 text-slate-600">
          Page 1 contains the request letter, the next pages contain sample slips, and the last pages contain packing
          instructions and the lab address label.
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

