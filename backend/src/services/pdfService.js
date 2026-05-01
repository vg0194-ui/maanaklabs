const fs = require("fs");
const path = require("path");
const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");
const dayjs = require("dayjs");

const BRAND = {
  green: rgb(0.07, 0.36, 0.24),
  blue: rgb(0.1, 0.37, 0.63),
  light: rgb(0.95, 0.97, 0.97),
  dark: rgb(0.15, 0.18, 0.2),
  danger: rgb(0.73, 0.23, 0.19),
};

function getLogoBytes() {
  const logoPath = path.join(__dirname, "..", "..", "..", "frontend", "public", "images", "maanak-labs-logo.png");
  if (fs.existsSync(logoPath)) {
    return fs.readFileSync(logoPath);
  }
  return null;
}

function drawHeader(page, fonts, title, subTitle, logoImage) {
  page.drawRectangle({ x: 0, y: 770, width: 595, height: 72, color: BRAND.green });

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
    x: 40,
    y: 810,
    size: 20,
    font: fonts.bold,
    color: rgb(1, 1, 1),
  });
  page.drawText("A Unit of Entorno Greens Seeds Private Limited", {
    x: 40,
    y: 792,
    size: 9,
    font: fonts.regular,
    color: rgb(0.92, 0.98, 0.96),
  });
  page.drawText(title, {
    x: 40,
    y: 752,
    size: 16,
    font: fonts.bold,
    color: BRAND.dark,
  });

  if (subTitle) {
    page.drawText(subTitle, {
      x: 40,
      y: 736,
      size: 9,
      font: fonts.regular,
      color: BRAND.blue,
    });
  }
}

function drawParagraph(page, font, text, x, y, width, size = 10, lineHeight = 14) {
  const words = text.split(/\s+/);
  let line = "";
  let currentY = y;

  words.forEach((word, index) => {
    const testLine = `${line}${word} `;
    const testWidth = font.widthOfTextAtSize(testLine, size);
    if (testWidth > width && line) {
      page.drawText(line.trim(), { x, y: currentY, size, font, color: BRAND.dark });
      currentY -= lineHeight;
      line = `${word} `;
    } else {
      line = testLine;
    }

    if (index === words.length - 1 && line.trim()) {
      page.drawText(line.trim(), { x, y: currentY, size, font, color: BRAND.dark });
      currentY -= lineHeight;
    }
  });

  return currentY;
}

async function generateCombinedRequestPdf({ request, user, payment, samples, services, settings }) {
  const pdfDoc = await PDFDocument.create();
  const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fonts = { regular, bold };
  const logoBytes = getLogoBytes();
  const logoImage = logoBytes ? await pdfDoc.embedPng(logoBytes) : null;

  const requestPage = pdfDoc.addPage([595, 842]);
  drawHeader(requestPage, fonts, "Request Letter", "Seed testing submission summary", logoImage);
  requestPage.drawRectangle({ x: 40, y: 595, width: 515, height: 120, color: BRAND.light });

  const leftBlock = [
    `Request No: ${request.requestNumber}`,
    `Date: ${dayjs(request.createdAt).format("DD MMM YYYY")}`,
    `Name: ${request.contactName || user.name}`,
    `Company: ${request.companyName || user.companyName || "-"}`,
    `Mobile: ${request.contactMobile || user.mobile}`,
    `Email: ${request.contactEmail || user.email}`,
    `GST: ${request.gstNumber || user.gstNumber || "-"}`,
  ];

  leftBlock.forEach((line, index) => {
    requestPage.drawText(line, {
      x: 54,
      y: 690 - index * 16,
      size: 10,
      font: regular,
      color: BRAND.dark,
    });
  });

  let yPosition = 565;
  requestPage.drawText("Billing Address", { x: 40, y: yPosition, size: 12, font: bold, color: BRAND.green });
  yPosition = drawParagraph(
    requestPage,
    regular,
    request.billingAddressText || "Billing address to be completed by the customer.",
    40,
    yPosition - 18,
    510
  );

  requestPage.drawText("Sample Summary", {
    x: 40,
    y: yPosition - 10,
    size: 12,
    font: bold,
    color: BRAND.green,
  });

  yPosition -= 34;
  samples.forEach((sample, index) => {
    const serviceNames = sample.selectedTestNames.join(", ");
    requestPage.drawRectangle({
      x: 40,
      y: yPosition - 52,
      width: 515,
      height: 48,
      color: index % 2 === 0 ? rgb(0.98, 0.99, 0.99) : rgb(0.94, 0.97, 0.96),
    });
    requestPage.drawText(`${index + 1}. ${sample.crop} / ${sample.variety}`, {
      x: 48,
      y: yPosition - 18,
      size: 11,
      font: bold,
      color: BRAND.dark,
    });
    requestPage.drawText(`Lot: ${sample.lotNumber} | Sample ID: ${sample.sampleId}`, {
      x: 48,
      y: yPosition - 34,
      size: 9,
      font: regular,
      color: BRAND.dark,
    });
    requestPage.drawText(`Tests: ${serviceNames}`, {
      x: 280,
      y: yPosition - 34,
      size: 8,
      font: regular,
      color: BRAND.dark,
    });
    yPosition -= 60;
  });

  requestPage.drawText(`Total Amount Paid: INR ${Number(payment?.amount || request.totalAmount).toFixed(2)}`, {
    x: 40,
    y: 110,
    size: 12,
    font: bold,
    color: BRAND.blue,
  });
  requestPage.drawText(
    "Declaration: I confirm that the submitted samples are representative of the lot and the information provided is correct to the best of my knowledge.",
    {
      x: 40,
      y: 88,
      size: 9,
      font: regular,
      color: BRAND.dark,
      maxWidth: 500,
      lineHeight: 12,
    }
  );
  requestPage.drawText("Authorized Signature: ____________________", {
    x: 40,
    y: 50,
    size: 10,
    font: regular,
    color: BRAND.dark,
  });

  samples.forEach((sample, index) => {
    const page = pdfDoc.addPage([595, 842]);
    drawHeader(page, fonts, `Sample Bag Slip ${index + 1}`, "Paste this slip inside/outside the sample bag", logoImage);
    page.drawRectangle({ x: 50, y: 430, width: 495, height: 260, color: BRAND.light });
    const lines = [
      `Request Number: ${request.requestNumber}`,
      `Sample ID: ${sample.sampleId}`,
      `Crop: ${sample.crop}`,
      `Variety: ${sample.variety}`,
      `Lot Number: ${sample.lotNumber}`,
      `Seed Class: ${sample.seedClass}`,
      `Selected Tests: ${sample.selectedTestNames.join(", ")}`,
    ];

    lines.forEach((line, lineIndex) => {
      page.drawText(line, {
        x: 72,
        y: 645 - lineIndex * 26,
        size: 12,
        font: lineIndex <= 1 ? bold : regular,
        color: BRAND.dark,
      });
    });

    page.drawRectangle({ x: 380, y: 470, width: 120, height: 120, borderColor: BRAND.blue, borderWidth: 1 });
    page.drawText("QR / Barcode", {
      x: 405,
      y: 530,
      size: 11,
      font: bold,
      color: BRAND.blue,
    });
    page.drawText("Placeholder", {
      x: 412,
      y: 510,
      size: 9,
      font: regular,
      color: BRAND.dark,
    });
  });

  const instructionsPage = pdfDoc.addPage([595, 842]);
  drawHeader(
    instructionsPage,
    fonts,
    "Packing & Dispatch Instructions",
    "How to Withdraw, Pack & Send Seed Samples",
    logoImage
  );

  const steps = [
    "1. Withdraw Representative Sample: Take seed from different bags or points and mix properly. Do not send only top-layer seed.",
    "2. Fill Sample Details Online: Login, add crop, variety, lot details and required tests, then complete payment.",
    "3. Print Sample Slip: Download the generated PDF and print each sample slip.",
    "4. Pack Each Sample Separately: Use clean packets and attach the correct slip.",
    "5. Put All Packets in One Master Bag: Keep the request letter inside.",
    "6. Paste Lab Address Label: Make the label visible and add sender mobile number.",
    "7. Send by Courier / Transport: Keep tracking safely.",
    "8. Track Request Status Online: Follow Sample Awaited to Completed updates in your dashboard.",
  ];

  let stepY = 710;
  steps.forEach((step, index) => {
    instructionsPage.drawRectangle({
      x: 40,
      y: stepY - 54,
      width: 515,
      height: 48,
      color: index % 2 === 0 ? rgb(0.95, 0.98, 0.97) : rgb(0.98, 0.99, 1),
    });
    drawParagraph(instructionsPage, regular, step, 52, stepY - 18, 480, 9, 12);
    stepY -= 62;
  });

  instructionsPage.drawRectangle({ x: 40, y: 116, width: 515, height: 54, color: rgb(1, 0.96, 0.92) });
  drawParagraph(
    instructionsPage,
    regular,
    "Warning: Incorrect packing, missing sample slip, or unmatched Sample ID may delay testing.",
    52,
    146,
    470,
    10,
    14
  );

  const labelPage = pdfDoc.addPage([595, 842]);
  drawHeader(labelPage, fonts, "Lab Address Label", "Seed Testing Sample - Handle Carefully", logoImage);
  labelPage.drawRectangle({ x: 80, y: 290, width: 435, height: 250, color: BRAND.light });

  if (logoImage) {
    labelPage.drawImage(logoImage, {
      x: 110,
      y: 485,
      width: 180,
      height: 56,
    });
  }

  labelPage.drawText(settings.siteName || "Maanak Labs", {
    x: 110,
    y: 454,
    size: 22,
    font: bold,
    color: BRAND.green,
  });
  labelPage.drawText(settings.siteTagline || "", {
    x: 110,
    y: 430,
    size: 10,
    font: regular,
    color: BRAND.dark,
  });
  drawParagraph(labelPage, regular, `Address: ${settings.contactDetails.address}`, 110, 394, 350, 11, 16);
  labelPage.drawText(`Mobile: ${settings.contactDetails.mobile}`, {
    x: 110,
    y: 346,
    size: 11,
    font: regular,
    color: BRAND.dark,
  });
  labelPage.drawText(`Email: ${settings.contactDetails.email}`, {
    x: 110,
    y: 322,
    size: 11,
    font: regular,
    color: BRAND.dark,
  });
  labelPage.drawText("Seed Testing Sample - Handle Carefully", {
    x: 110,
    y: 286,
    size: 13,
    font: bold,
    color: BRAND.danger,
  });

  const bytes = await pdfDoc.save();
  return Buffer.from(bytes);
}

async function generatePackingGuidePdf({ settings }) {
  const pdfDoc = await PDFDocument.create();
  const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fonts = { regular, bold };
  const logoBytes = getLogoBytes();
  const logoImage = logoBytes ? await pdfDoc.embedPng(logoBytes) : null;
  const page = pdfDoc.addPage([595, 842]);

  drawHeader(page, fonts, "Sample Packing Guide", "How to Withdraw, Pack & Send Seed Samples", logoImage);
  const content =
    "1. Withdraw a representative sample from multiple points. 2. Fill sample details online and complete payment. 3. Print sample slip for each sample. 4. Pack each sample separately in a clean bag. 5. Put all packets in one master bag with the request letter. 6. Paste the lab address label outside. 7. Send by courier, transport, or personal delivery. 8. Track request status online.";
  drawParagraph(page, regular, content, 40, 700, 515, 12, 18);

  drawParagraph(
    page,
    regular,
    `Warning: Incorrect packing, missing sample slip, or unmatched Sample ID may delay testing.\n\nLab Address:\n${settings.contactDetails.address}\nMobile: ${settings.contactDetails.mobile}\nEmail: ${settings.contactDetails.email}`,
    40,
    520,
    515,
    11,
    16
  );

  const bytes = await pdfDoc.save();
  return Buffer.from(bytes);
}

module.exports = { generateCombinedRequestPdf, generatePackingGuidePdf };
