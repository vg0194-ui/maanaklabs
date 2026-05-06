const nodemailer = require("nodemailer");
const WebsiteSettings = require("../models/WebsiteSettings");

let transporterPromise;

function isMailConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function getTransporter() {
  if (!isMailConfigured()) {
    return null;
  }

  if (!transporterPromise) {
    transporterPromise = Promise.resolve(
      nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: String(process.env.SMTP_SECURE || "false").toLowerCase() === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      })
    );
  }

  return transporterPromise;
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatAddress(request) {
  return (
    request.billingAddressText ||
    [
      request.billingAddress?.line1,
      request.billingAddress?.line2,
      request.billingAddress?.city,
      request.billingAddress?.state,
      request.billingAddress?.postalCode,
      request.billingAddress?.country,
    ]
      .filter(Boolean)
      .join(", ")
  );
}

function getMailContext(request, samples, payment, settings) {
  const labContact = {
    name: settings?.siteName || "Maanak Labs",
    email: settings?.contactDetails?.email || process.env.LAB_CONTACT_EMAIL || process.env.SMTP_USER,
    mobile: settings?.contactDetails?.mobile || process.env.LAB_CONTACT_MOBILE || "",
    address: settings?.contactDetails?.address || "",
  };

  return {
    requestNumber: request.requestNumber,
    contactName: request.contactName,
    companyName: request.companyName,
    contactEmail: request.contactEmail,
    contactMobile: request.contactMobile,
    gstNumber: request.gstNumber || "-",
    billingAddress: formatAddress(request) || "-",
    totalSamples: samples.length,
    subtotalAmount: formatCurrency(request.subtotalAmount),
    gstAmount: formatCurrency(request.gstAmount),
    totalAmount: formatCurrency(request.totalAmount),
    paymentStatus: request.paymentStatus,
    requestStatus: request.requestStatus,
    remarks: request.remarks || "-",
    paymentGateway: payment?.gateway || "Razorpay",
    dashboardUrl: process.env.CLIENT_URL ? `${process.env.CLIENT_URL}/dashboard` : "",
    adminUrl: process.env.CLIENT_URL ? `${process.env.CLIENT_URL}/admin/requests` : "",
    labContact,
    samples: samples.map((sample, index) => ({
      number: index + 1,
      sampleId: sample.sampleId,
      crop: sample.crop,
      variety: sample.variety,
      lotNumber: sample.lotNumber,
      lotQuantity: sample.lotQuantity,
      seedClass: sample.seedClass,
      stage: sample.stage,
      numberOfSamples: sample.numberOfSamples,
      selectedTests: (sample.selectedTestNames || []).join(", ") || "-",
      estimatedAmount: formatCurrency(sample.estimatedAmount),
      remarks: sample.remarks || "-",
    })),
  };
}

function sampleRowsHtml(samples) {
  return samples
    .map(
      (sample) => `
        <tr>
          <td style="padding:10px;border:1px solid #d7e0e5;">${sample.number}</td>
          <td style="padding:10px;border:1px solid #d7e0e5;">${escapeHtml(sample.sampleId)}</td>
          <td style="padding:10px;border:1px solid #d7e0e5;">${escapeHtml(sample.crop)}</td>
          <td style="padding:10px;border:1px solid #d7e0e5;">${escapeHtml(sample.variety)}</td>
          <td style="padding:10px;border:1px solid #d7e0e5;">${escapeHtml(sample.lotNumber)}</td>
          <td style="padding:10px;border:1px solid #d7e0e5;">${escapeHtml(sample.selectedTests)}</td>
        </tr>
      `
    )
    .join("");
}

function sampleLinesText(samples) {
  return samples
    .map(
      (sample) =>
        `${sample.number}. ${sample.sampleId} | ${sample.crop} | ${sample.variety} | Lot: ${sample.lotNumber} | Tests: ${sample.selectedTests}`
    )
    .join("\n");
}

function buildAdminEmail(context) {
  return {
    subject: `New Seed Testing Request - ${context.requestNumber}`,
    html: `
      <div style="font-family:Arial,sans-serif;color:#1f2937;line-height:1.6;">
        <h2 style="margin-bottom:8px;">New Seed Testing Request Received</h2>
        <p style="margin-top:0;">A new request has been created on Maanak Labs.</p>
        <div style="padding:16px;border:1px solid #d7e0e5;border-radius:12px;background:#f8fbfb;margin:20px 0;">
          <p><strong>Request Number:</strong> ${escapeHtml(context.requestNumber)}</p>
          <p><strong>Company:</strong> ${escapeHtml(context.companyName)}</p>
          <p><strong>Contact Person:</strong> ${escapeHtml(context.contactName)}</p>
          <p><strong>Email:</strong> ${escapeHtml(context.contactEmail)}</p>
          <p><strong>Mobile:</strong> ${escapeHtml(context.contactMobile)}</p>
          <p><strong>GST:</strong> ${escapeHtml(context.gstNumber)}</p>
          <p><strong>Billing Address:</strong> ${escapeHtml(context.billingAddress)}</p>
          <p><strong>Total Samples:</strong> ${context.totalSamples}</p>
          <p><strong>Subtotal:</strong> ${context.subtotalAmount}</p>
          <p><strong>GST:</strong> ${context.gstAmount}</p>
          <p><strong>Total Amount:</strong> ${context.totalAmount}</p>
          <p><strong>Payment Status:</strong> ${escapeHtml(context.paymentStatus)}</p>
          <p><strong>Request Status:</strong> ${escapeHtml(context.requestStatus)}</p>
          <p><strong>Remarks:</strong> ${escapeHtml(context.remarks)}</p>
        </div>
        <h3 style="margin-bottom:10px;">Sample Details</h3>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <thead>
            <tr style="background:#ecf4f1;">
              <th style="padding:10px;border:1px solid #d7e0e5;text-align:left;">#</th>
              <th style="padding:10px;border:1px solid #d7e0e5;text-align:left;">Sample ID</th>
              <th style="padding:10px;border:1px solid #d7e0e5;text-align:left;">Crop</th>
              <th style="padding:10px;border:1px solid #d7e0e5;text-align:left;">Variety</th>
              <th style="padding:10px;border:1px solid #d7e0e5;text-align:left;">Lot No</th>
              <th style="padding:10px;border:1px solid #d7e0e5;text-align:left;">Tests</th>
            </tr>
          </thead>
          <tbody>${sampleRowsHtml(context.samples)}</tbody>
        </table>
        ${
          context.adminUrl
            ? `<p style="margin-top:20px;">Open admin panel: <a href="${context.adminUrl}">${context.adminUrl}</a></p>`
            : ""
        }
      </div>
    `,
    text: `New Seed Testing Request Received

Request Number: ${context.requestNumber}
Company: ${context.companyName}
Contact Person: ${context.contactName}
Email: ${context.contactEmail}
Mobile: ${context.contactMobile}
GST: ${context.gstNumber}
Billing Address: ${context.billingAddress}
Total Samples: ${context.totalSamples}
Subtotal: ${context.subtotalAmount}
GST: ${context.gstAmount}
Total Amount: ${context.totalAmount}
Payment Status: ${context.paymentStatus}
Request Status: ${context.requestStatus}
Remarks: ${context.remarks}

Sample Details:
${sampleLinesText(context.samples)}

${context.adminUrl ? `Open admin panel: ${context.adminUrl}` : ""}`,
  };
}

function buildUserEmail(context) {
  return {
    subject: `Request Received - ${context.requestNumber}`,
    html: `
      <div style="font-family:Arial,sans-serif;color:#1f2937;line-height:1.6;">
        <h2 style="margin-bottom:8px;">Your Seed Testing Request Has Been Received</h2>
        <p style="margin-top:0;">Dear ${escapeHtml(context.contactName)},</p>
        <p>Thank you for creating a seed testing request with Maanak Labs.</p>
        <div style="padding:16px;border:1px solid #d7e0e5;border-radius:12px;background:#f8fbfb;margin:20px 0;">
          <p><strong>Request Number:</strong> ${escapeHtml(context.requestNumber)}</p>
          <p><strong>Company:</strong> ${escapeHtml(context.companyName)}</p>
          <p><strong>Total Samples:</strong> ${context.totalSamples}</p>
          <p><strong>Subtotal:</strong> ${context.subtotalAmount}</p>
          <p><strong>GST:</strong> ${context.gstAmount}</p>
          <p><strong>Total Amount:</strong> ${context.totalAmount}</p>
          <p><strong>Payment Status:</strong> ${escapeHtml(context.paymentStatus)}</p>
        </div>
        <h3 style="margin-bottom:10px;">Sample Details</h3>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <thead>
            <tr style="background:#ecf4f1;">
              <th style="padding:10px;border:1px solid #d7e0e5;text-align:left;">#</th>
              <th style="padding:10px;border:1px solid #d7e0e5;text-align:left;">Sample ID</th>
              <th style="padding:10px;border:1px solid #d7e0e5;text-align:left;">Crop</th>
              <th style="padding:10px;border:1px solid #d7e0e5;text-align:left;">Variety</th>
              <th style="padding:10px;border:1px solid #d7e0e5;text-align:left;">Lot No</th>
              <th style="padding:10px;border:1px solid #d7e0e5;text-align:left;">Tests</th>
            </tr>
          </thead>
          <tbody>${sampleRowsHtml(context.samples)}</tbody>
        </table>
        <div style="margin-top:20px;padding:16px;border-radius:12px;background:#f3faf6;border:1px solid #d5e8db;">
          <p style="margin-top:0;"><strong>Next steps</strong></p>
          <p>Please complete payment, download the generated request documents, and dispatch your samples to the laboratory using the provided sample slips and address label.</p>
        </div>
        <p style="margin-top:20px;">
          <strong>Lab Contact</strong><br />
          ${escapeHtml(context.labContact.name)}<br />
          ${escapeHtml(context.labContact.address)}<br />
          ${escapeHtml(context.labContact.mobile)}<br />
          ${escapeHtml(context.labContact.email)}
        </p>
        ${
          context.dashboardUrl
            ? `<p>You can track your request here: <a href="${context.dashboardUrl}">${context.dashboardUrl}</a></p>`
            : ""
        }
      </div>
    `,
    text: `Your Seed Testing Request Has Been Received

Dear ${context.contactName},

Thank you for creating a seed testing request with Maanak Labs.

Request Number: ${context.requestNumber}
Company: ${context.companyName}
Total Samples: ${context.totalSamples}
Subtotal: ${context.subtotalAmount}
GST: ${context.gstAmount}
Total Amount: ${context.totalAmount}
Payment Status: ${context.paymentStatus}

Sample Details:
${sampleLinesText(context.samples)}

Next steps:
Complete payment, download the request documents, and dispatch your samples using the sample slips and address label.

Lab Contact:
${context.labContact.name}
${context.labContact.address}
${context.labContact.mobile}
${context.labContact.email}

${context.dashboardUrl ? `Track your request: ${context.dashboardUrl}` : ""}`,
  };
}

async function sendEmail({ to, subject, html, text, replyTo }) {
  const transporter = getTransporter();
  if (!transporter) {
    return { skipped: true };
  }

  const resolvedTransporter = await transporter;
  await resolvedTransporter.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to,
    subject,
    html,
    text,
    replyTo,
  });

  return { skipped: false };
}

async function sendRequestCreatedEmails({ request, samples, payment }) {
  if (!isMailConfigured()) {
    return { skipped: true, reason: "SMTP not configured" };
  }

  const settings = await WebsiteSettings.findOne().lean();
  const context = getMailContext(request, samples, payment, settings);
  const adminEmail =
    process.env.ADMIN_NOTIFICATION_EMAIL || process.env.DEFAULT_ADMIN_EMAIL || settings?.contactDetails?.email;

  const adminMail = buildAdminEmail(context);
  const userMail = buildUserEmail(context);

  const tasks = [];
  if (adminEmail) {
    tasks.push(
      sendEmail({
        to: adminEmail,
        subject: adminMail.subject,
        html: adminMail.html,
        text: adminMail.text,
        replyTo: context.contactEmail,
      })
    );
  }

  if (context.contactEmail) {
    tasks.push(
      sendEmail({
        to: context.contactEmail,
        subject: userMail.subject,
        html: userMail.html,
        text: userMail.text,
        replyTo: context.labContact.email,
      })
    );
  }

  const results = await Promise.allSettled(tasks);
  return {
    skipped: false,
    results,
  };
}

function buildEnquiryAdminEmail(context) {
  return {
    subject: `New Website Enquiry - ${context.name}`,
    html: `
      <div style="font-family:Arial,sans-serif;color:#1f2937;line-height:1.6;">
        <h2 style="margin-bottom:8px;">New Website Enquiry Received</h2>
        <p style="margin-top:0;">A quick enquiry has been submitted on the Maanak Labs website.</p>
        <div style="padding:16px;border:1px solid #d7e0e5;border-radius:12px;background:#f8fbfb;margin:20px 0;">
          <p><strong>Name:</strong> ${escapeHtml(context.name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(context.email)}</p>
          <p><strong>Mobile:</strong> ${escapeHtml(context.mobile)}</p>
          <p><strong>Message:</strong></p>
          <p style="white-space:pre-wrap;">${escapeHtml(context.message)}</p>
        </div>
      </div>
    `,
    text: `New Website Enquiry Received

Name: ${context.name}
Email: ${context.email}
Mobile: ${context.mobile}

Message:
${context.message}`,
  };
}

function buildEnquiryUserEmail(context) {
  return {
    subject: "Enquiry Received - Maanak Labs",
    html: `
      <div style="font-family:Arial,sans-serif;color:#1f2937;line-height:1.6;">
        <h2 style="margin-bottom:8px;">Thank you for contacting Maanak Labs</h2>
        <p style="margin-top:0;">Dear ${escapeHtml(context.name)},</p>
        <p>We have received your enquiry and our team will review it shortly.</p>
        <div style="padding:16px;border:1px solid #d7e0e5;border-radius:12px;background:#f8fbfb;margin:20px 0;">
          <p><strong>Your message:</strong></p>
          <p style="white-space:pre-wrap;">${escapeHtml(context.message)}</p>
        </div>
        <p>
          <strong>Maanak Labs</strong><br />
          ${escapeHtml(context.labContact.address)}<br />
          ${escapeHtml(context.labContact.mobile)}<br />
          ${escapeHtml(context.labContact.email)}
        </p>
      </div>
    `,
    text: `Thank you for contacting Maanak Labs

Dear ${context.name},

We have received your enquiry and our team will review it shortly.

Your message:
${context.message}

Maanak Labs
${context.labContact.address}
${context.labContact.mobile}
${context.labContact.email}`,
  };
}

async function sendContactEnquiryEmails({ name, email, mobile, message }) {
  if (!isMailConfigured()) {
    return { skipped: true, reason: "SMTP not configured" };
  }

  const settings = await WebsiteSettings.findOne().lean();
  const labContact = {
    name: settings?.siteName || "Maanak Labs",
    email: settings?.contactDetails?.email || process.env.LAB_CONTACT_EMAIL || process.env.SMTP_USER,
    mobile: settings?.contactDetails?.mobile || process.env.LAB_CONTACT_MOBILE || "",
    address: settings?.contactDetails?.address || "",
  };

  const context = {
    name,
    email,
    mobile,
    message,
    labContact,
  };

  const adminMail = buildEnquiryAdminEmail(context);
  const userMail = buildEnquiryUserEmail(context);

  const tasks = [
    sendEmail({
      to: labContact.email,
      subject: adminMail.subject,
      html: adminMail.html,
      text: adminMail.text,
      replyTo: email,
    }),
  ];

  if (email) {
    tasks.push(
      sendEmail({
        to: email,
        subject: userMail.subject,
        html: userMail.html,
        text: userMail.text,
        replyTo: labContact.email,
      })
    );
  }

  const results = await Promise.allSettled(tasks);
  return {
    skipped: false,
    results,
  };
}

module.exports = {
  isMailConfigured,
  sendRequestCreatedEmails,
  sendContactEnquiryEmails,
};
