module.exports = {
  siteName: "Maanak Labs",
  siteTagline: "A Unit of Entorno Greens Seeds Private Limited",
  homeIntro:
    "Maanak Labs helps you test your seed lots quickly and reliably so you can plan dispatch, storage, and sales with confidence.",
  aboutContent:
    "Maanak Labs is a dedicated seed testing laboratory committed to delivering accurate, reliable, and timely seed quality analysis for seed companies, producers, processors, distributors, dealers, and institutional buyers.",
  contactDetails: {
    address:
      "Maanak Labs, Entorno Greens Campus, Akhepura, Delhi-Jaipur 200ft Bypass, VKI, Jaipur 302013, Rajasthan",
    mobile: process.env.LAB_CONTACT_MOBILE || "+91 98765 43210",
    email: process.env.LAB_CONTACT_EMAIL || "info@maanaklabs.com",
    mapUrl: "https://maps.google.com",
  },
  termsAndConditions:
    "Testing is performed on the submitted sample only. Results depend on sample quality, representative sampling, and the applicable laboratory method scope.",
  compliance: {
    scientificProceduresNote:
      "The laboratory follows scientific seed testing procedures and documented quality systems for sample handling, testing workflow, and traceability.",
    accreditationStatus: "Accreditation in process / to be updated.",
    nablNote:
      "NABL is the Indian accreditation body for testing and calibration laboratories. Accreditation details will be published here once formally approved.",
    iso17025Note:
      "ISO/IEC 17025 is the internationally recognized competence standard relevant to testing laboratories. Scope and status will be updated after formal confirmation.",
  },
  identifierConfig: {
    request: {
      prefix: "ML-REQ",
      suffix: "",
    },
    sample: {
      prefix: "ML-SMP",
      suffix: "",
    },
  },
};
