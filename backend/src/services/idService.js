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

function getPeriodToken(date = new Date()) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear()).slice(-2);
  return `${month}${year}`;
}

function getPeriodScopeValue(date = new Date()) {
  return Number(getPeriodToken(date));
}

function formatIdentifier({ prefix, periodToken, sequence, suffix, padding }) {
  return [prefix, periodToken, String(sequence).padStart(padding, "0"), suffix].filter(Boolean).join("-");
}

async function getCurrentSequence(key, periodScope) {
  const counter = await Counter.findOne({ key, year: periodScope }).lean();
  return Number(counter?.sequence || 0);
}

async function getNextSeriesValue(key, date = new Date()) {
  const periodScope = getPeriodScopeValue(date);
  const sequence = await getCurrentSequence(key, periodScope);
  return sequence + 1 || 1;
}

async function setNextSeriesValue(key, nextSeries, date = new Date()) {
  const periodScope = getPeriodScopeValue(date);
  const normalizedSeries = Math.max(1, Number(nextSeries) || 1);

  await Counter.findOneAndUpdate(
    { key, year: periodScope },
    { $set: { sequence: normalizedSeries - 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  return normalizedSeries;
}

async function getIdentifierSettings() {
  const settings = await WebsiteSettings.findOne().lean();
  return buildIdentifierConfig(settings);
}

async function getNextSequence(key, periodScope, startAt = 1) {
  const normalizedStart = Math.max(1, Number(startAt) || 1);
  const query = { key, year: periodScope };

  const existingCounter = await Counter.findOne(query).lean();
  if (existingCounter) {
    const counter = await Counter.findOneAndUpdate(query, { $inc: { sequence: 1 } }, { new: true });
    return counter.sequence;
  }

  try {
    const counter = await Counter.create({
      ...query,
      sequence: normalizedStart,
    });

    return counter.sequence;
  } catch (error) {
    if (error?.code !== 11000) {
      throw error;
    }

    const counter = await Counter.findOneAndUpdate(query, { $inc: { sequence: 1 } }, { new: true });
    return counter.sequence;
  }
}

async function generateRequestNumber(date = new Date()) {
  const periodToken = getPeriodToken(date);
  const periodScope = getPeriodScopeValue(date);
  const config = (await getIdentifierSettings()).request;
  const sequence = await getNextSequence("request", periodScope, await getNextSeriesValue("request", date));

  return formatIdentifier({
    prefix: config.prefix,
    periodToken,
    sequence,
    suffix: config.suffix,
    padding: config.padding,
  });
}

async function generateSampleSeries(date = new Date()) {
  const periodToken = getPeriodToken(date);
  const periodScope = getPeriodScopeValue(date);
  const config = (await getIdentifierSettings()).sample;
  const sequence = await getNextSequence("sample", periodScope, await getNextSeriesValue("sample", date));

  return formatIdentifier({
    prefix: config.prefix,
    periodToken,
    sequence,
    suffix: "",
    padding: config.padding,
  });
}

async function buildSampleIdFromSeries(sampleSeries) {
  const config = (await getIdentifierSettings()).sample;
  return [sampleSeries, config.suffix].filter(Boolean).join("-");
}

async function generateSampleId(date = new Date()) {
  const sampleSeries = await generateSampleSeries(date);
  return buildSampleIdFromSeries(sampleSeries);
}

async function generateReceiptNumber(date = new Date()) {
  const periodToken = getPeriodToken(date);
  const periodScope = getPeriodScopeValue(date);
  const config = (await getIdentifierSettings()).receipt;
  const sequence = await getNextSequence("receipt", periodScope, await getNextSeriesValue("receipt", date));

  return formatIdentifier({
    prefix: config.prefix,
    periodToken,
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
