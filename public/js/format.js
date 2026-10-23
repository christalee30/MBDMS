const ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

export const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ESCAPES[c]);

export const code = (prefix, id) => `${prefix}-${String(id).padStart(3, "0")}`;

const PILL = { Completed: "ok", Cleared: "ok", Scheduled: "warn" };

export const pill = status =>
  `<span class="pill pill-${PILL[status] || "bad"}">${esc(status)}</span>`;
