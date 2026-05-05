const Counter = require("../models/Counter");
const WebsiteSettings = require("../models/WebsiteSettings");

const DEFAULT_IDENTIFIER_CONFIG = {
  request: {
    prefix: "ML-REQ",
    suffix: "",
    padding: 4,
  },
  sample: {
    prefix: "ML-SMP",
    suffix: "",
    padding: 4,
  },
  receipt: {
    prefix: "ML-RCPT",
    suffix: "",
    padding: 4,
  },
};

function normalizeIdentifierSection(section = {}, fallback) {
  return {
    prefix: (section.prefix || fallback.prefix || "").trim(),
    suffix: (section.suffix || fallback.suffix || "").trim(),
    padding: fallback.padding,
  };
}

function buildIdentifierConfig(settings = {}) {
  return {
    request: normalizeIdentifierSection(settings.identifierConfig?.request, DEFAULT_IDENTIFIER_CONFIG.request),
    sample: normalizeIdentifierSection(settings.identifierConfig?.sample, DEFAULT_IDENTIFIER_CONFIG.sample),
    receipt: { ...DEFAULT_IDENTIFIER_CONFIG.receipt },
  };
}

function formatIdentifier({ prefix, year, sequence, suffix, padding }) {
  return [prefix, year, String(sequence).padStart(padding, "0"), suffix].filter(Boolean).join("-");
}

async function getCurrentSequence(key, year) {
  const counter = await Counter.findOne({ key, year }).lean();
  return Number(counter?.sequence || 0);
}

async function getNextSeriesValue(key, date = new Date()) {
  const year = date.getFullYear();
  const sequence = await getCurrentSequence(key, year);
  return sequence + 1 || 1;
}

async function setNextSeriesValue(key, nextSeries, date = new Date()) {
  const year = date.getFullYear();
  const normalizedSeries = Math.max(1, Number(nextSeries) || 1);

  await Counter.findOneAndUpdate(
    { key, year },
    { $set: { sequence: normalizedSeries - 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  return normalizedSeries;
}

async function getIdentifierSettings() {
  const settings = await WebsiteSettings.findOne().lean();
  return buildIdentifierConfig(settings);
}

async function getNextSequence(key, year, startAt = 1) {
  const normalizedStart = Math.max(1, Number(startAt) || 1);

  const counter = await Counter.findOneAndUpdate(
    { key, year },
    {
      $setOnInsert: { sequence: normalizedStart - 1 },
      $inc: { sequence: 1 },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  return counter.sequence;
}

async function generateRequestNumber(date = new Date()) {
  const year = date.getFullYear();
  const config = (await getIdentifierSettings()).request;
  const sequence = await getNextSequence("request", year, await getNextSeriesValue("request", date));

  return formatIdentifier({
    prefix: config.prefix,
    year,
    sequence,
    suffix: config.suffix,
    padding: config.padding,
  });
}

async function generateSampleId(date = new Date(), suffix = "A") {
  const sampleSeries = await generateSampleSeries(date);
  return buildSampleIdFromSeries(sampleSeries, suffix);
}

async function generateSampleSeries(date = new Date()) {
  const year = date.getFullYear();
  const config = (await getIdentifierSettings()).sample;
  const sequence = await getNextSequence("sample", year, await getNextSeriesValue("sample", date));

  return formatIdentifier({
    prefix: config.prefix,
    year,
    sequence,
    suffix: "",
    padding: config.padding,
  });
}

async function buildSampleIdFromSeries(sampleSeries, perSampleSuffix = "A") {
  const config = (await getIdentifierSettings()).sample;
  return [sampleSeries, perSampleSuffix, config.suffix].filter(Boolean).join("-");
}

async function generateReceiptNumber(date = new Date()) {
  const year = date.getFullYear();
  const config = (await getIdentifierSettings()).receipt;
  const sequence = await getNextSequence("receipt", year, await getNextSeriesValue("receipt", date));

  return formatIdentifier({
    prefix: config.prefix,
    year,
    sequence,
    suffix: config.suffix,
    padding: config.padding,
  });
}

module.exports = {
  DEFAULT_IDENTIFIER_CONFIG,
  buildIdentifierConfig,
  buildSampleIdFromSeries,
  getNextSeriesValue,
  setNextSeriesValue,
  generateRequestNumber,
  generateSampleId,
  generateSampleSeries,
  generateReceiptNumber,
};
