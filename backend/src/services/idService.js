const Counter = require("../models/Counter");

async function getNextSequence(key, year) {
  const counter = await Counter.findOneAndUpdate(
    { key, year },
    { $inc: { sequence: 1 } },
    { new: true, upsert: true }
  );

  return counter.sequence;
}

async function generateRequestNumber(date = new Date()) {
  const year = date.getFullYear();
  const sequence = await getNextSequence("request", year);
  return `ML-REQ-${year}-${String(sequence).padStart(4, "0")}`;
}

async function generateSampleId(date = new Date(), suffix = "A") {
  const year = date.getFullYear();
  const sequence = await getNextSequence("sample", year);
  return `ML-SMP-${year}-${String(sequence).padStart(4, "0")}-${suffix}`;
}

async function generateSampleSeries(date = new Date()) {
  const year = date.getFullYear();
  const sequence = await getNextSequence("sample", year);
  return `ML-SMP-${year}-${String(sequence).padStart(4, "0")}`;
}

async function generateReceiptNumber(date = new Date()) {
  const year = date.getFullYear();
  const sequence = await getNextSequence("receipt", year);
  return `ML-RCPT-${year}-${String(sequence).padStart(4, "0")}`;
}

module.exports = {
  generateRequestNumber,
  generateSampleId,
  generateSampleSeries,
  generateReceiptNumber,
};
