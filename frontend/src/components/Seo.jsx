import { useEffect } from "react";

const DEFAULT_SITE_NAME = "Maanak Labs";
const DEFAULT_SITE_URL = "https://maanaklabs.com";
const DEFAULT_IMAGE = "/images/maanak-labs-logo.png";

function ensureMeta(selector, attributes) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement("meta");
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    element.setAttribute(key, value);
  });

  return element;
}

function removeElement(selector) {
  const element = document.head.querySelector(selector);
  if (element) {
    element.remove();
  }
}

function ensureLink(selector, attributes) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement("link");
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    element.setAttribute(key, value);
  });

  return element;
}

function absoluteUrl(path = "/") {
  if (!path) {
    return DEFAULT_SITE_URL;
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `${DEFAULT_SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function Seo({
  title,
  description,
  canonicalPath = "/",
  image = DEFAULT_IMAGE,
  type = "website",
  noindex = false,
  keywords,
  jsonLd,
}) {
  useEffect(() => {
    const previousTitle = document.title;
    const fullTitle = title ? `${title} | ${DEFAULT_SITE_NAME}` : `${DEFAULT_SITE_NAME} | Seed Testing Laboratory`;
    const canonicalUrl = absoluteUrl(canonicalPath);
    const imageUrl = absoluteUrl(image);
    const robotsValue = noindex ? "noindex, nofollow" : "index, follow";

    document.title = fullTitle;

    ensureMeta('meta[name="description"]', { name: "description", content: description });
    if (keywords) {
      ensureMeta('meta[name="keywords"]', { name: "keywords", content: keywords });
    } else {
      removeElement('meta[name="keywords"]');
    }
    ensureMeta('meta[name="robots"]', { name: "robots", content: robotsValue });

    ensureMeta('meta[property="og:title"]', { property: "og:title", content: fullTitle });
    ensureMeta('meta[property="og:description"]', { property: "og:description", content: description });
    ensureMeta('meta[property="og:type"]', { property: "og:type", content: type });
    ensureMeta('meta[property="og:url"]', { property: "og:url", content: canonicalUrl });
    ensureMeta('meta[property="og:image"]', { property: "og:image", content: imageUrl });
    ensureMeta('meta[property="og:site_name"]', { property: "og:site_name", content: DEFAULT_SITE_NAME });

    ensureMeta('meta[name="twitter:card"]', { name: "twitter:card", content: "summary_large_image" });
    ensureMeta('meta[name="twitter:title"]', { name: "twitter:title", content: fullTitle });
    ensureMeta('meta[name="twitter:description"]', { name: "twitter:description", content: description });
    ensureMeta('meta[name="twitter:image"]', { name: "twitter:image", content: imageUrl });

    ensureLink('link[rel="canonical"]', { rel: "canonical", href: canonicalUrl });

    let schemaNode = document.head.querySelector('script[data-seo-schema="true"]');
    if (jsonLd) {
      if (!schemaNode) {
        schemaNode = document.createElement("script");
        schemaNode.type = "application/ld+json";
        schemaNode.setAttribute("data-seo-schema", "true");
        document.head.appendChild(schemaNode);
      }
      schemaNode.textContent = JSON.stringify(jsonLd);
    } else if (schemaNode) {
      schemaNode.remove();
    }

    return () => {
      document.title = previousTitle;
    };
  }, [canonicalPath, description, image, jsonLd, keywords, noindex, title, type]);

  return null;
}

export default Seo;
