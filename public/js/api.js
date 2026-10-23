async function request(path, options = {}) {
  const res = await fetch(path, {
    ...options,
    headers: { "Content-Type": "application/json" }
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || "Request failed.");
  return body;
}

export const api = {
  list: name => request(`/api/${name}`),
  create: (name, payload) =>
    request(`/api/${name}`, { method: "POST", body: JSON.stringify(payload) }),
  reset: () => request("/api/reset", { method: "POST" })
};
