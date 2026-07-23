import assert from "node:assert/strict";
import test from "node:test";
import { escapeHtml } from "../src/lib/escapeHtml.js";

test("escapeHtml neutralizes XSS payloads used in tooltip titles/keys", () => {
  assert.equal(
    escapeHtml('<img onerror=alert(1)>'),
    "&lt;img onerror=alert(1)&gt;",
  );
  assert.equal(escapeHtml('"><script>'), "&quot;&gt;&lt;script&gt;");
  assert.equal(escapeHtml("O'Reilly & Co"), "O&#39;Reilly &amp; Co");
});
