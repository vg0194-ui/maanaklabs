const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function triggerBrowserDownload(url, fileName) {
  const anchor = document.createElement("a");
  anchor.href = url;
  if (fileName) {
    anchor.download = fileName;
  }
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

export async function apiFetch(path, { method = "GET", body, token, headers = {} } = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

export async function uploadFile(path, file, token, fieldName = "report") {
  const formData = new FormData();
  formData.append(fieldName, file);

  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Upload failed");
  }

  return data;
}

export async function downloadProtectedFile(path, token, fallbackFileName) {
  let response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      method: "GET",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
  } catch (error) {
    if (token) {
      const directUrl = `${API_URL}${path}${path.includes("?") ? "&" : "?"}downloadToken=${encodeURIComponent(token)}`;
      triggerBrowserDownload(directUrl, fallbackFileName);
      return;
    }
    throw error;
  }

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || "Download failed");
  }

  const blob = await response.blob();
  const contentDisposition = response.headers.get("content-disposition") || "";
  const match = contentDisposition.match(/filename="?([^"]+)"?/i);
  const fileName = match?.[1] || fallbackFileName;
  const objectUrl = window.URL.createObjectURL(blob);
  triggerBrowserDownload(objectUrl, fileName);
  window.setTimeout(() => window.URL.revokeObjectURL(objectUrl), 1000);
}

export { API_URL };
