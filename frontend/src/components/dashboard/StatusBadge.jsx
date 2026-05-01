const classes = {
  "Payment Pending": "bg-amber-100 text-amber-800",
  Paid: "bg-emerald-100 text-emerald-800",
  Pending: "bg-amber-100 text-amber-800",
  "Sample Awaited": "bg-sky-100 text-sky-800",
  "Sample Received": "bg-cyan-100 text-cyan-800",
  "Under Testing": "bg-violet-100 text-violet-800",
  "Report Generated": "bg-blue-100 text-blue-800",
  Completed: "bg-emerald-100 text-emerald-800",
  Rejected: "bg-rose-100 text-rose-800",
};

function StatusBadge({ status }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-bold ${classes[status] || "bg-slate-100 text-slate-700"}`}>
      {status}
    </span>
  );
}

export default StatusBadge;

