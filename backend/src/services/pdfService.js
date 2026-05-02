const fs = require("fs");
const path = require("path");
const bwipjs = require("bwip-js");
const QRCode = require("qrcode");
const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");
const dayjs = require("dayjs");

const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const PAGE_MARGIN = 40;
const CONTENT_WIDTH = PAGE_WIDTH - PAGE_MARGIN * 2;

const BRAND = {
  green: rgb(0.07, 0.36, 0.24),
  blue: rgb(0.1, 0.37, 0.63),
  light: rgb(0.95, 0.97, 0.97),
  dark: rgb(0.15, 0.18, 0.2),
  muted: rgb(0.41, 0.48, 0.56),
  border: rgb(0.84, 0.88, 0.9),
  warning: rgb(1, 0.96, 0.92),
  danger: rgb(0.73, 0.23, 0.19),
};

function getLogoBytes() {
  const logoPath = path.join(__dirname, "..", "..", "..", "frontend", "public", "images", "maanak-labs-logo.png");
  if (fs.existsSync(logoPath)) {
    return fs.readFileSync(logoPath);
  }

  return null;
}

function formatCurrency(value) {
  return `INR ${Number(value || 0).toFixed(2)}`;
}

function safeText(value, fallback = "-") {
  if (value === null || value === undefined) {
    return fallback;
  }

  const text = String(value).trim();
  return text || fallback;
}

function splitWords(text = "") {
  return String(text).replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
}

function getWrappedLines(font, text, width, size) {
  const words = splitWords(text);
  if (!words.length) {
    return [""];
  }

  const lines = [];
  let line = "";

  words.forEach((word) => {
    const testLine = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(testLine, size) <= width || !line) {
      line = testLine;
    } else {
      lines.push(line);
      line = word;
    }
  });

  if (line) {
    lines.push(line);
  }

  return lines;
}

function drawParagraph(page, font, text, x, y, width, size = 10, lineHeight = 14, color = BRAND.dark) {
  const lines = getWrappedLines(font, text, width, size);
  let currentY = y;

  lines.forEach((line) => {
    page.drawText(line, { x, y: currentY, size, font, color });
    currentY -= lineHeight;
  });

  return currentY;
}

function drawLabelValue(page, fonts, label, value, x, y, labelWidth = 110, valueWidth = 150) {
  page.drawText(label, {
    x,
    y,
    size: 9,
    font: fonts.bold,
    color: BRAND.dark,
  });

  const endY = drawParagraph(page, fonts.regular, safeText(value), x + labelWidth, y, valueWidth, 9, 12, BRAND.dark);
  return Math.min(y - 14, endY);
}

function drawHeader(page, fonts, title, subTitle, logoImage) {
  page.drawRectangle({ x: 0, y: 770, width: PAGE_WIDTH, height: 72, color: BRAND.green });

  if (logoImage) {
    page.drawRectangle({ x: 418, y: 780, width: 140, height: 48, color: rgb(1, 1, 1), opacity: 0.98 });
    page.drawImage(logoImage, {
      x: 424,
      y: 784,
      width: 128,
      height: 40,
    });
  }

  page.drawText("Maanak Labs", {
    x: PAGE_MARGIN,
    y: 810,
    size: 20,
    font: fonts.bold,
    color: rgb(1, 1, 1),
  });
  page.drawText("A Unit of Entorno Greens Seeds Private Limited", {
    x: PAGE_MARGIN,
    y: 792,
    size: 9,
    font: fonts.regular,
    color: rgb(0.92, 0.98, 0.96),
  });
  page.drawText(title, {
    x: PAGE_MARGIN,
    y: 752,
    size: 16,
    font: fonts.bold,
    color: BRAND.dark,
  });

  if (subTitle) {
    page.drawText(subTitle, {
      x: PAGE_MARGIN,
      y: 736,
      size: 9,
      font: fonts.regular,
      color: BRAND.blue,
    });
  }
}

function defaultSettings(settings = {}) {
  return {
    siteName: settings.siteName || "Maanak Labs",
    siteTagline: settings.siteTagline || "A Unit of Entorno Greens Seeds Private Limited",
    termsAndConditions:
      settings.termsAndConditions ||
      "Samples must be representative of the lot. Test timelines begin after receipt of properly packed samples and payment confirmation.",
    compliance: {
      scientificProceduresNote:
        settings.compliance?.scientificProceduresNote ||
        "The laboratory follows scientific seed testing procedures and internal quality systems.",
      accreditationStatus:
        settings.compliance?.accreditationStatus || "Accreditation in process / to be updated.",
      nablNote:
        settings.compliance?.nablNote || "NABL accreditation status: to be updated / in process.",
      iso17025Note:
        settings.compliance?.iso17025Note || "ISO/IEC 17025 quality-system alignment: to be updated / in process.",
    },
    contactDetails: {
      address: settings.contactDetails?.address || "Lab address to be updated by admin.",
      mobile: settings.contactDetails?.mobile || "Lab mobile to be updated by admin.",
      email: settings.contactDetails?.email || "lab@example.com",
    },
  };
}

async function createQrPngBuffer(payload) {
  const dataUrl = await QRCode.toDataURL(payload, {
    errorCorrectionLevel: "M",
    margin: 0,
    width: 256,
    color: {
      dark: "#11324A",
      light: "#FFFFFF",
    },
  });

  return Buffer.from(dataUrl.split(",")[1], "base64");
}

async function createBarcodePngBuffer(text) {
  return bwipjs.toBuffer({
    bcid: "code128",
    text,
    scale: 2,
    height: 12,
    includetext: false,
    backgroundcolor: "FFFFFF",
    paddingwidth: 0,
    paddingheight: 0,
  });
}

function addContinuationPage(pdfDoc, fonts, logoImage, title, subTitle) {
  const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  drawHeader(page, fonts, title, subTitle, logoImage);
  return page;
}

function drawSampleCard(page, fonts, sample, index, startY) {
  const cardHeight = 88;
  page.drawRectangle({
    x: PAGE_MARGIN,
    y: startY - cardHeight,
    width: CONTENT_WIDTH,
    height: cardHeight,
    color: index % 2 === 0 ? rgb(0.98, 0.99, 0.99) : rgb(0.94, 0.97, 0.96),
    borderColor: BRAND.border,
    borderWidth: 0.6,
  });

  page.drawText(`${index + 1}. ${safeText(sample.crop)} / ${safeText(sample.variety)}`, {
    x: PAGE_MARGIN + 10,
    y: startY - 18,
    size: 11,
    font: fonts.bold,
    color: BRAND.dark,
  });

  page.drawText(`Sample ID: ${safeText(sample.sampleId)} | Lot No: ${safeText(sample.lotNumber)}`, {
    x: PAGE_MARGIN + 10,
    y: startY - 34,
    size: 9,
    font: fonts.regular,
    color: BRAND.dark,
  });

  page.drawText(
    `Lot Qty: ${safeText(sample.lotQuantity)} | Seed Class: ${safeText(sample.seedClass)} | Stage: ${safeText(sample.stage)} | No. of Samples: ${safeText(sample.numberOfSamples)}`,
    {
      x: PAGE_MARGIN + 10,
      y: startY - 48,
      size: 8.5,
      font: fonts.regular,
      color: BRAND.dark,
    }
  );

  const testsEndY = drawParagraph(
    page,
    fonts.regular,
    `Tests: ${safeText((sample.selectedTestNames || []).join(", "), "No tests selected")}`,
    PAGE_MARGIN + 10,
    startY - 62,
    410,
    8.5,
    11
  );

  if (sample.remarks) {
    drawParagraph(page, fonts.regular, `Remarks: ${sample.remarks}`, 330, startY - 18, 205, 8.2, 10);
  }

  page.drawText(`Estimated Amount: ${formatCurrency(sample.estimatedAmount)}`, {
    x: 420,
    y: Math.max(startY - 76, testsEndY - 4),
    size: 8.5,
    font: fonts.bold,
    color: BRAND.blue,
  });

  return startY - cardHeight - 12;
}

async function addRequestLetterPages(pdfDoc, fonts, logoImage, requestData) {
  const { request, user, payment, samples, settings } = requestData;
  let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  drawHeader(page, fonts, "Request Letter", "Seed testing submission summary", logoImage);

  page.drawRectangle({ x: PAGE_MARGIN, y: 612, width: 250, height: 108, color: BRAND.light, borderColor: BRAND.border, borderWidth: 0.8 });
  page.drawRectangle({ x: 305, y: 612, width: 250, height: 108, color: BRAND.light, borderColor: BRAND.border, borderWidth: 0.8 });

  const requestMeta = [
    ["Request Number", request.requestNumber],
    ["Date", dayjs(request.createdAt).format("DD MMM YYYY")],
    ["Payment Status", request.paymentStatus],
    ["Request Status", request.requestStatus],
    ["Receipt Number", payment?.receiptNumber || payment?.razorpayPaymentId || "-"],
    ["Paid On", payment?.paidAt ? dayjs(payment.paidAt).format("DD MMM YYYY, hh:mm A") : "-"],
  ];

  let leftY = 700;
  requestMeta.slice(0, 3).forEach(([label, value]) => {
    leftY = drawLabelValue(page, fonts, label, value, 54, leftY, 84, 145);
  });

  let rightY = 700;
  requestMeta.slice(3).forEach(([label, value]) => {
    rightY = drawLabelValue(page, fonts, label, value, 320, rightY, 90, 135);
  });

  page.drawText("Applicant Details", {
    x: PAGE_MARGIN,
    y: 588,
    size: 12,
    font: fonts.bold,
    color: BRAND.green,
  });
  page.drawRectangle({ x: PAGE_MARGIN, y: 498, width: CONTENT_WIDTH, height: 74, color: rgb(0.99, 1, 1), borderColor: BRAND.border, borderWidth: 0.8 });

  const applicantLines = [
    `Name: ${safeText(request.contactName || user?.name)}`,
    `Company: ${safeText(request.companyName || user?.companyName)}`,
    `Mobile: ${safeText(request.contactMobile || user?.mobile)}`,
    `Email: ${safeText(request.contactEmail || user?.email)}`,
    `GST Number: ${safeText(request.gstNumber || user?.gstNumber)}`,
  ];

  applicantLines.forEach((line, index) => {
    page.drawText(line, {
      x: 52 + (index > 1 ? 255 : 0),
      y: 548 - (index % 3) * 16,
      size: 9.5,
      font: fonts.regular,
      color: BRAND.dark,
    });
  });

  page.drawText("Billing Address", {
    x: PAGE_MARGIN,
    y: 476,
    size: 12,
    font: fonts.bold,
    color: BRAND.green,
  });
  page.drawRectangle({ x: PAGE_MARGIN, y: 406, width: CONTENT_WIDTH, height: 56, color: BRAND.light, borderColor: BRAND.border, borderWidth: 0.8 });
  drawParagraph(page, fonts.regular, safeText(request.billingAddressText, "Billing address to be completed by customer."), 52, 444, 485, 9.5, 12);

  page.drawText("Payment Summary", {
    x: PAGE_MARGIN,
    y: 384,
    size: 12,
    font: fonts.bold,
    color: BRAND.green,
  });
  page.drawRectangle({ x: PAGE_MARGIN, y: 320, width: CONTENT_WIDTH, height: 52, color: BRAND.light, borderColor: BRAND.border, borderWidth: 0.8 });
  page.drawText(`Subtotal: ${formatCurrency(request.subtotalAmount)}`, {
    x: 52,
    y: 348,
    size: 9.5,
    font: fonts.regular,
    color: BRAND.dark,
  });
  page.drawText(`GST: ${formatCurrency(request.gstAmount)}`, {
    x: 220,
    y: 348,
    size: 9.5,
    font: fonts.regular,
    color: BRAND.dark,
  });
  page.drawText(`Total Amount Paid: ${formatCurrency(payment?.amount || request.totalAmount)}`, {
    x: 360,
    y: 348,
    size: 10.5,
    font: fonts.bold,
    color: BRAND.blue,
  });

  if (request.remarks) {
    page.drawText("Request Remarks", {
      x: PAGE_MARGIN,
      y: 300,
      size: 12,
      font: fonts.bold,
      color: BRAND.green,
    });
    page.drawRectangle({ x: PAGE_MARGIN, y: 244, width: CONTENT_WIDTH, height: 42, color: rgb(0.99, 1, 1), borderColor: BRAND.border, borderWidth: 0.8 });
    drawParagraph(page, fonts.regular, request.remarks, 52, 272, 490, 9, 11);
  }

  let sampleSectionY = request.remarks ? 220 : 298;
  page.drawText("Sample Details Submitted Online", {
    x: PAGE_MARGIN,
    y: sampleSectionY,
    size: 12,
    font: fonts.bold,
    color: BRAND.green,
  });

  let currentY = sampleSectionY - 18;
  samples.forEach((sample, index) => {
    if (currentY < 160) {
      page = addContinuationPage(pdfDoc, fonts, logoImage, "Request Letter (Continued)", request.requestNumber);
      currentY = 720;
    }

    currentY = drawSampleCard(page, fonts, sample, index, currentY);
  });

  if (currentY < 165) {
    page = addContinuationPage(pdfDoc, fonts, logoImage, "Request Letter (Continued)", request.requestNumber);
    currentY = 720;
  }

  page.drawText("Declaration", {
    x: PAGE_MARGIN,
    y: currentY - 6,
    size: 12,
    font: fonts.bold,
    color: BRAND.green,
  });
  currentY = drawParagraph(
    page,
    fonts.regular,
    "I confirm that the submitted samples are representative of the lot, the information furnished in this request is correct to the best of my knowledge, and the samples are packed and labelled according to the Maanak Labs instructions.",
    PAGE_MARGIN,
    currentY - 24,
    CONTENT_WIDTH,
    9,
    12
  );

  currentY = drawParagraph(
    page,
    fonts.regular,
    `${settings.compliance.scientificProceduresNote} Accreditation status: ${settings.compliance.accreditationStatus} ${settings.compliance.nablNote} ${settings.compliance.iso17025Note}`,
    PAGE_MARGIN,
    currentY - 6,
    CONTENT_WIDTH,
    8.5,
    11,
    BRAND.muted
  );

  page.drawText("Applicant Signature: ____________________", {
    x: PAGE_MARGIN,
    y: Math.max(54, currentY - 20),
    size: 10,
    font: fonts.regular,
    color: BRAND.dark,
  });
}

async function addSampleSlipPages(pdfDoc, fonts, logoImage, requestData) {
  const { request, user, samples } = requestData;

  for (let index = 0; index < samples.length; index += 1) {
    const sample = samples[index];
    const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    drawHeader(page, fonts, `Sample Bag Slip ${index + 1}`, "Paste this slip inside/outside the sample bag", logoImage);

    page.drawRectangle({ x: 42, y: 470, width: 511, height: 220, color: BRAND.light, borderColor: BRAND.border, borderWidth: 1 });
    page.drawText(`Request Number: ${safeText(request.requestNumber)}`, {
      x: 58,
      y: 664,
      size: 11,
      font: fonts.bold,
      color: BRAND.dark,
    });
    page.drawText(`Sample ID: ${safeText(sample.sampleId)}`, {
      x: 58,
      y: 642,
      size: 14,
      font: fonts.bold,
      color: BRAND.blue,
    });

    const detailLines = [
      `Crop: ${safeText(sample.crop)}`,
      `Variety: ${safeText(sample.variety)}`,
      `Lot Number: ${safeText(sample.lotNumber)}`,
      `Lot Quantity: ${safeText(sample.lotQuantity)}`,
      `Seed Class: ${safeText(sample.seedClass)}`,
      `Stage: ${safeText(sample.stage)}`,
      `No. of Samples: ${safeText(sample.numberOfSamples)}`,
      `Sender Mobile: ${safeText(request.contactMobile || user?.mobile)}`,
    ];

    detailLines.forEach((line, lineIndex) => {
      page.drawText(line, {
        x: 58,
        y: 614 - lineIndex * 18,
        size: 9.5,
        font: fonts.regular,
        color: BRAND.dark,
      });
    });

    drawParagraph(
      page,
      fonts.regular,
      `Selected Tests: ${safeText((sample.selectedTestNames || []).join(", "), "No tests selected")}`,
      58,
      468,
      290,
      9.5,
      12
    );

    if (sample.remarks) {
      drawParagraph(page, fonts.regular, `Remarks: ${sample.remarks}`, 58, 430, 290, 9, 11);
    }

    const qrPayload = JSON.stringify({
      requestNumber: request.requestNumber,
      sampleId: sample.sampleId,
      crop: sample.crop,
      variety: sample.variety,
      lotNumber: sample.lotNumber,
      seedClass: sample.seedClass,
      tests: sample.selectedTestNames,
    });

    const [qrImage, barcodeImage] = await Promise.all([
      pdfDoc.embedPng(await createQrPngBuffer(qrPayload)),
      pdfDoc.embedPng(await createBarcodePngBuffer(sample.sampleId)),
    ]);

    page.drawRectangle({ x: 374, y: 516, width: 152, height: 152, color: rgb(1, 1, 1), borderColor: BRAND.border, borderWidth: 1 });
    page.drawImage(qrImage, {
      x: 389,
      y: 532,
      width: 122,
      height: 122,
    });
    page.drawText("Scan for sample details", {
      x: 393,
      y: 520,
      size: 8.5,
      font: fonts.regular,
      color: BRAND.blue,
    });

    page.drawRectangle({ x: 58, y: 378, width: 468, height: 72, color: rgb(1, 1, 1), borderColor: BRAND.border, borderWidth: 1 });
    page.drawImage(barcodeImage, {
      x: 82,
      y: 402,
      width: 420,
      height: 24,
    });
    page.drawText(sample.sampleId, {
      x: 221,
      y: 386,
      size: 11,
      font: fonts.bold,
      color: BRAND.dark,
    });

    page.drawRectangle({ x: 42, y: 318, width: 511, height: 42, color: rgb(0.98, 0.99, 1), borderColor: BRAND.border, borderWidth: 0.8 });
    drawParagraph(
      page,
      fonts.regular,
      "Paste this slip inside or outside the matching sample bag. Do not mix two samples in one packet. Ensure the Sample ID on the slip matches the packed sample.",
      58,
      344,
      475,
      9,
      11
    );
  }
}

async function addPackingInstructionsPage(pdfDoc, fonts, logoImage, settings) {
  const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  drawHeader(page, fonts, "Packing & Dispatch Instructions", "How to Withdraw, Pack & Send Seed Samples", logoImage);

  const steps = [
    {
      title: "1. Withdraw Representative Sample",
      text: "Take seed from different bags or points of the lot and mix properly. Do not send only top-layer seed.",
    },
    {
      title: "2. Fill Sample Details Online",
      text: "Login, enter crop, variety, lot details, seed class, and required tests. Submit the request and complete payment.",
    },
    {
      title: "3. Print Sample Slip",
      text: "Download the PDF after payment and print the slip generated for each sample.",
    },
    {
      title: "4. Pack Each Sample Separately",
      text: "Put each sample in a clean packet or bag, insert or paste the correct sample slip, and seal properly.",
    },
    {
      title: "5. Put All Packets in One Master Bag",
      text: "If sending multiple samples, place all individual packets in one master bag or carton and keep the request letter inside.",
    },
    {
      title: "6. Paste Lab Address Label",
      text: "Paste the Maanak Labs address label outside the master bag. Add sender mobile number on the package.",
    },
    {
      title: "7. Send by Courier / Transport",
      text: "Dispatch by courier, parcel, transport, or personal delivery and keep the tracking receipt safely.",
    },
    {
      title: "8. Track Request Status Online",
      text: "Track progress from Sample Awaited to Sample Received, Under Testing, Report Generated, and Completed.",
    },
  ];

  let currentY = 710;
  steps.forEach((step, index) => {
    page.drawRectangle({
      x: PAGE_MARGIN,
      y: currentY - 62,
      width: CONTENT_WIDTH,
      height: 56,
      color: index % 2 === 0 ? rgb(0.95, 0.98, 0.97) : rgb(0.98, 0.99, 1),
      borderColor: BRAND.border,
      borderWidth: 0.8,
    });

    page.drawCircle({ x: 58, y: currentY - 26, size: 14, color: BRAND.green, borderColor: BRAND.green });
    page.drawText(String(index + 1), {
      x: 54,
      y: currentY - 31,
      size: 10,
      font: fonts.bold,
      color: rgb(1, 1, 1),
    });

    page.drawText(step.title, {
      x: 82,
      y: currentY - 20,
      size: 10.5,
      font: fonts.bold,
      color: BRAND.dark,
    });
    drawParagraph(page, fonts.regular, step.text, 82, currentY - 34, 450, 8.6, 10);

    currentY -= 68;
  });

  page.drawRectangle({ x: PAGE_MARGIN, y: 92, width: CONTENT_WIDTH, height: 64, color: BRAND.warning, borderColor: rgb(0.92, 0.75, 0.58), borderWidth: 0.8 });
  page.drawText("Warning", {
    x: 54,
    y: 134,
    size: 11,
    font: fonts.bold,
    color: BRAND.danger,
  });
  drawParagraph(
    page,
    fonts.regular,
    "Incorrect packing, missing sample slip, or unmatched Sample ID may delay testing. Ensure that every sample packet and the master bag carry the correct request reference before dispatch.",
    54,
    118,
    485,
    9,
    11
  );

  drawParagraph(
    page,
    fonts.regular,
    `${settings.compliance.scientificProceduresNote} Accreditation status: ${settings.compliance.accreditationStatus}`,
    PAGE_MARGIN,
    72,
    CONTENT_WIDTH,
    8.3,
    10,
    BRAND.muted
  );
}

async function addAddressLabelPage(pdfDoc, fonts, logoImage, requestData) {
  const { request, user, settings } = requestData;
  const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  drawHeader(page, fonts, "Lab Address Label", "Seed Testing Sample - Handle Carefully", logoImage);

  page.drawRectangle({ x: 72, y: 274, width: 450, height: 286, color: BRAND.light, borderColor: BRAND.border, borderWidth: 1.2 });

  if (logoImage) {
    page.drawImage(logoImage, {
      x: 102,
      y: 496,
      width: 176,
      height: 54,
    });
  }

  page.drawText(settings.siteName, {
    x: 102,
    y: 460,
    size: 22,
    font: fonts.bold,
    color: BRAND.green,
  });
  page.drawText(settings.siteTagline, {
    x: 102,
    y: 438,
    size: 10,
    font: fonts.regular,
    color: BRAND.dark,
  });
  drawParagraph(page, fonts.regular, `Address: ${settings.contactDetails.address}`, 102, 398, 300, 11, 16);
  page.drawText(`Mobile: ${settings.contactDetails.mobile}`, {
    x: 102,
    y: 344,
    size: 11,
    font: fonts.regular,
    color: BRAND.dark,
  });
  page.drawText(`Email: ${settings.contactDetails.email}`, {
    x: 102,
    y: 322,
    size: 11,
    font: fonts.regular,
    color: BRAND.dark,
  });
  page.drawText("Seed Testing Sample - Handle Carefully", {
    x: 102,
    y: 286,
    size: 13,
    font: fonts.bold,
    color: BRAND.danger,
  });

  page.drawRectangle({ x: 376, y: 330, width: 126, height: 148, color: rgb(1, 1, 1), borderColor: BRAND.border, borderWidth: 1 });
  page.drawText("Sender Details", {
    x: 392,
    y: 456,
    size: 10,
    font: fonts.bold,
    color: BRAND.blue,
  });
  page.drawText(`Name: ${safeText(request.contactName || user?.name)}`, {
    x: 388,
    y: 430,
    size: 8.5,
    font: fonts.regular,
    color: BRAND.dark,
  });
  page.drawText(`Mobile: ${safeText(request.contactMobile || user?.mobile)}`, {
    x: 388,
    y: 414,
    size: 8.5,
    font: fonts.regular,
    color: BRAND.dark,
  });
  page.drawText(`Request No: ${safeText(request.requestNumber)}`, {
    x: 388,
    y: 398,
    size: 8.5,
    font: fonts.regular,
    color: BRAND.dark,
  });
  drawParagraph(page, fonts.regular, "Paste this label on the outside of the master bag/carton.", 388, 372, 100, 8, 10, BRAND.muted);
}

async function generateCombinedRequestPdf({ request, user, payment, samples, settings }) {
  const pdfDoc = await PDFDocument.create();
  const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fonts = { regular, bold };
  const preparedSettings = defaultSettings(settings);
  const logoBytes = getLogoBytes();
  const logoImage = logoBytes ? await pdfDoc.embedPng(logoBytes) : null;
  const sortedSamples = [...samples].sort((left, right) => left.sampleId.localeCompare(right.sampleId));

  const requestData = {
    request,
    user,
    payment,
    samples: sortedSamples,
    settings: preparedSettings,
  };

  await addRequestLetterPages(pdfDoc, fonts, logoImage, requestData);
  await addSampleSlipPages(pdfDoc, fonts, logoImage, requestData);
  await addPackingInstructionsPage(pdfDoc, fonts, logoImage, preparedSettings);
  await addAddressLabelPage(pdfDoc, fonts, logoImage, requestData);

  const bytes = await pdfDoc.save();
  return Buffer.from(bytes);
}

async function generatePackingGuidePdf({ settings }) {
  const pdfDoc = await PDFDocument.create();
  const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fonts = { regular, bold };
  const preparedSettings = defaultSettings(settings);
  const logoBytes = getLogoBytes();
  const logoImage = logoBytes ? await pdfDoc.embedPng(logoBytes) : null;

  await addPackingInstructionsPage(pdfDoc, fonts, logoImage, preparedSettings);
  await addAddressLabelPage(
    pdfDoc,
    fonts,
    logoImage,
    {
      request: { requestNumber: "-", contactName: "", contactMobile: "" },
      user: {},
      settings: preparedSettings,
    }
  );

  const bytes = await pdfDoc.save();
  return Buffer.from(bytes);
}

module.exports = { generateCombinedRequestPdf, generatePackingGuidePdf };
