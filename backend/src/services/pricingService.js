const Rate = require("../models/Rate");
const Service = require("../models/Service");

async function getActiveRateForService(serviceId, crop = "") {
  const service = await Service.findById(serviceId).lean();
  if (!service || service.isActive === false) {
    return null;
  }

  const specificRate = await Rate.findOne({
    service: serviceId,
    crop: crop.trim(),
    isActive: true,
    effectiveDate: { $lte: new Date() },
  })
    .sort({ effectiveDate: -1 })
    .lean();

  if (specificRate) {
    return specificRate;
  }

  const genericRate = await Rate.findOne({
    service: serviceId,
    crop: "",
    isActive: true,
    effectiveDate: { $lte: new Date() },
  })
    .sort({ effectiveDate: -1 })
    .lean();

  if (genericRate) {
    return genericRate;
  }

  return {
    amount: service.rate,
    gstPercentage: 0,
    effectiveDate: new Date(),
  };
}

async function calculateRequestPricing(samples = []) {
  let subtotal = 0;
  let gstAmount = 0;
  const enrichedSamples = [];

  for (const sample of samples) {
    let sampleBase = 0;
    let sampleGst = 0;

    for (const testId of sample.selectedTests || []) {
      const rate = await getActiveRateForService(testId, sample.crop);
      if (rate) {
        sampleBase += Number(rate.amount || 0);
        sampleGst += (Number(rate.amount || 0) * Number(rate.gstPercentage || 0)) / 100;
      }
    }

    subtotal += sampleBase;
    gstAmount += sampleGst;
    enrichedSamples.push({
      ...sample,
      estimatedAmount: Number((sampleBase + sampleGst).toFixed(2)),
    });
  }

  return {
    subtotalAmount: Number(subtotal.toFixed(2)),
    gstAmount: Number(gstAmount.toFixed(2)),
    totalAmount: Number((subtotal + gstAmount).toFixed(2)),
    enrichedSamples,
  };
}

module.exports = { getActiveRateForService, calculateRequestPricing };
