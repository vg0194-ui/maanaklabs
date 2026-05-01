const REQUEST_STATUS = [
  "Request Created",
  "Payment Pending",
  "Payment Completed",
  "Sample Awaited",
  "Sample Received",
  "Under Testing",
  "Report Generated",
  "Completed",
  "Rejected",
];

const PAYMENT_STATUS = ["Pending", "Paid", "Failed", "Refunded"];
const ROLES = ["user", "admin"];
const SEED_CLASSES = ["Breeder", "Foundation", "Certified", "Truthful", "Research"];
const SAMPLE_STAGES = ["Raw", "Processed", "Packed"];

module.exports = {
  REQUEST_STATUS,
  PAYMENT_STATUS,
  ROLES,
  SEED_CLASSES,
  SAMPLE_STAGES,
};

