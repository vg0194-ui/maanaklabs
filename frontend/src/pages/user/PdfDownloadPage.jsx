import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { API_URL, apiFetch, downloadProtectedFile } from "../../api/client";
import { useAuth } from "../../contexts/AuthContext";
import StatusBadge from "../../components/dashboard/StatusBadge";
import { formatCurrency } from "../../utils/formatters";

const documentConfigs = {
  slips: {
    label: "Download Sample Slips",
    path: (requestId) => `/pdfs/requests/${requestId}/sample-slips`,
    fileName: (requestNumber) => `${requestNumber}-sample-slips.pdf`,
    className: "btn-primary",
  },
  letter: {
    label: "Download Request Letter",
    path: (requestId) => `/pdfs/requests/${requestId}/request-letter`,
    fileName: (requestNumber) => `${requestNumber}-request-letter.pdf`,
    className: "btn-secondary",
  },
  address: {
    label: "Download Address Slip",
    path: (requestId) => `/pdfs/requests/${requestId}/address-label`,
    fileName: (requestNumber) => `${requestNumber}-address-label.pdf`,
    className: "btn-secondary",
  },
};

const instructionSteps = [
  {
    id: "withdraw",
    title: "Withdraw representative sample properly",
    image: "/images/sample-withdrawal.jpg",
    text: "Take seed from different bags or different points of the lot, mix it properly, and prepare one representative sample. Do not send only top-layer seed.",
  },
  {
    id: "size",
    title: "Use the correct sample weight",
    image: "/images/online-request.jpg",
    text: "Check the crop-wise sample size list and pack the sample weight exactly as mentioned for that crop before sealing the pouch.",
  },
  {
    id: "slip",
    title: "Put the sample slip inside the sample pouch",
    image: "/images/print-sample-slip.jpg",
    text: "Download the generated sample slips, print them, and insert the matching slip inside the correct sample pouch.",
  },
  {
    id: "marker",
    title: "Write sample ID on the pouch and seal it well",
    image: "/images/pack-sample-bag.jpg",
    text: "Write the Sample ID on the outside of the bag with a non-erasable marker. Seal the pouch using thread or any other secure method so it does not open in transit.",
  },
  {
    id: "master-bag",
    title: "Put all samples inside one master bag",
    image: "/images/master-bag.jpg",
    text: "If you have multiple samples, keep all sealed sample pouches inside one master bag. Put the request letter inside the same master bag and close it tightly.",
  },
  {
    id: "label",
    title: "Paste the address label correctly",
    image: "/images/address-label.jpg",
    text: "Paste the address label on the master bag using tape or glue so it remains visible and reaches the correct lab address without damage.",
  },
];

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
      await downloadProtectedFile(config.path(requestId), token, config.fileName(requestData.request.requestNumber));
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
      <div className="panel overflow-hidden p-0">
        <div className="border-b border-slate-100 bg-[radial-gradient(circle_at_top_left,_rgba(17,92,61,0.08),_transparent_40%),linear-gradient(180deg,_#ffffff,_#f8fbff)] px-8 py-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-brand-blue">Dispatch Desk</p>
              <h1 className="mt-3 text-3xl font-extrabold">Pack and send your seed samples correctly</h1>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Download only the required dispatch documents below, then follow the step-by-step instructions on this
                page before sending the master bag to Maanak Labs.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <StatusBadge status={requestData.request.paymentStatus} />
                <StatusBadge status={requestData.request.requestStatus} />
              </div>
            </div>

            <div className="grid min-w-[260px] gap-3 rounded-3xl border border-slate-200 bg-white/90 p-5 text-sm text-slate-600 sm:grid-cols-2 xl:grid-cols-1">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Request Number</p>
                <p className="mt-1 font-semibold text-slate-800">{requestData.request.requestNumber}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Total Samples</p>
                <p className="mt-1 font-semibold text-slate-800">{requestData.samples?.length || requestData.request.sampleCount || 0}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Total Amount</p>
                <p className="mt-1 font-semibold text-slate-800">{formatCurrency(requestData.request.totalAmount)}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Contact Mobile</p>
                <p className="mt-1 font-semibold text-slate-800">{requestData.request.contactMobile}</p>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-3 lg:grid-cols-3">
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
          </div>

          {message ? <p className="mt-4 text-sm font-medium text-rose-600">{message}</p> : null}
        </div>

        <div className="px-8 py-8">
          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-7 text-amber-900">
            Incorrect packing, missing sample slip, missing Sample ID marking, or a loose master bag may delay testing.
            Please complete every step below before dispatch.
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {instructionSteps.map((step) => (
              <article key={step.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <img src={step.image} alt={step.title} className="h-44 w-full object-cover" />
                <div className="p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-blue">{step.id === "withdraw" ? "Step 1" : step.id === "size" ? "Step 2" : step.id === "slip" ? "Step 3" : step.id === "marker" ? "Step 4" : step.id === "master-bag" ? "Step 5" : "Step 6"}</p>
                  <h2 className="mt-3 text-xl font-bold text-slate-900">{step.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{step.text}</p>
                  {step.id === "size" ? (
                    <a
                      href={`${API_URL}/public/sample-size-guide.pdf`}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-flex text-sm font-semibold text-brand-blue"
                    >
                      Download crop-wise sample size PDF
                    </a>
                  ) : null}
                </div>
              </article>
            ))}
          </div>

          <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-xl font-bold">What each download is for</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl bg-white p-4">
                <p className="font-semibold text-slate-800">Request Letter</p>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  Keep this letter inside the master bag along with all packed samples.
                </p>
              </div>
              <div className="rounded-2xl bg-white p-4">
                <p className="font-semibold text-slate-800">Sample Slips</p>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  Insert the matching slip into each sample pouch and keep the Sample ID visible on the bag outside.
                </p>
              </div>
              <div className="rounded-2xl bg-white p-4">
                <p className="font-semibold text-slate-800">Address Slip</p>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  Paste this on the master bag using tape or glue so the shipment reaches the correct lab address.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <Link to="/dashboard/requests" className="inline-flex text-sm font-semibold text-brand-blue">
              Back to request list
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PdfDownloadPage;
