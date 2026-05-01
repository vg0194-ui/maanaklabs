const sanitizeHtml = require("sanitize-html");

const SANITIZE_OPTIONS = {
  allowedTags: ["p", "br", "strong", "em", "ul", "ol", "li", "blockquote", "h2", "h3", "h4", "a"],
  allowedAttributes: {
    a: ["href", "target", "rel"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", {
      rel: "noopener noreferrer",
      target: "_blank",
    }),
  },
};

function sanitizeBlogContent(content = "") {
  return sanitizeHtml(content, SANITIZE_OPTIONS);
}

function sanitizePlainText(value = "") {
  return sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} }).trim();
}

module.exports = {
  sanitizeBlogContent,
  sanitizePlainText,
};

