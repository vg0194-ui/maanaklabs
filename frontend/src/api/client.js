const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

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

export async function uploadFile(path, file, token) {
  const formData = new FormData();
  formData.append("report", file);

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
  const response = await fetch(`${API_URL}${path}`, {
    method: "GET",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || "Download failed");
  }

  const blob = await response.blob();
  const contentDisposition = response.headers.get("content-disposition") || "";
  const match = contentDisposition.match(/filename="?([^"]+)"?/i);
  const fileName = match?.[1] || fallbackFileName;
  const objectUrl = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => window.URL.revokeObjectURL(objectUrl), 1000);
}

export { API_URL };
