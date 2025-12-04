const BASE_URL = "http://localhost:5000";

export async function get(url) {
  const res = await fetch(BASE_URL + url);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GET ${url} failed → ${text}`);
  }

  // Wrap to mimic Axios format
  const json = await res.json();
  return { data: json };
}

export async function post(url, data) {
  const res = await fetch(BASE_URL + url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`POST ${url} failed → ${text}`);
  }

  // Wrap to mimic Axios format
  const json = await res.json();
  return { data: json };
}

const api = { get, post };
export default api;
