/** Shared HTML escaper for tooltip / label strings. Keep in sync with XSS tests. */
export const escapeHtml = (raw) =>
  raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
