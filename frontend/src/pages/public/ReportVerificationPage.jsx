import { useState } from "react";
import SectionHeader from "../../components/public/SectionHeader";
import { apiFetch } from "../../api/client";
import { formatDate } from "../../utils/formatters";

function ReportVerificationPage() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await apiFetch(`/public/report-verification/${code}`);
      setResult(response.report);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Report verification"
          title="Verify a final report code"
          description="Enter the verification code provided with the final report PDF to confirm its record."
        />
        <div className="panel mt-10 p-8">
          <form onSubmit={handleVerify} className="flex flex-col gap-4 sm:flex-row">
            <input
              value={code}
              onChange={(event) => setCode(event.target.value)}
              className="field"
              placeholder="Example: ML-REQ-2026-0001-VRF"
            />
            <button type="submit" className="btn-primary min-w-40" disabled={loading}>
              {loading ? "Checking..." : "Verify"}
            </button>
          </form>
          {error ? <p className="mt-4 text-sm font-medium text-rose-600">{error}</p> : null}
          {result ? (
            <div className="mt-6 rounded-3xl bg-slate-50 p-6">
              <h3 className="text-xl font-bold">Verification Result</h3>
              <div className="mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
                <p>Request Number: {result.requestNumber}</p>
                <p>Customer: {result.customerName}</p>
                <p>Company: {result.companyName || "-"}</p>
                <p>Status: {result.status}</p>
                <p>Uploaded: {formatDate(result.uploadedAt)}</p>
                <p>Verification Code: {result.verificationCode}</p>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export default ReportVerificationPage;

