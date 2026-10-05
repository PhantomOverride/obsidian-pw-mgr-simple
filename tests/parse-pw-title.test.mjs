import assert from "node:assert/strict";
import test from "node:test";
import { loadModule } from "./load-module.mjs";

const { parsePwTitle } = await loadModule("../src/parse-pw-title.ts");
const titleFor = (text, lineStart = 0) => parsePwTitle({ text, lineStart });

test("uses words after pw as the title", () => {
  assert.equal(titleFor("```pw Regular Users\nalice:example\n```"), "Regular Users");
});

test("defaults when the title or source section is unavailable", () => {
  assert.equal(titleFor("```pw"), "Password block");
  assert.equal(titleFor("```pw  \t"), "Password block");
  assert.equal(parsePwTitle(null), "Password block");
  assert.equal(titleFor("", 20), "Password block");
});

test("reads the exact block even when credential bodies are identical", () => {
  const note = "Heading\n```pw Regular Users\nalice:example\n```\n```pw Admins\nalice:example\n```";
  assert.equal(titleFor(note, 1), "Regular Users");
  assert.equal(titleFor(note, 4), "Admins");
});

test("handles CRLF, tabs, and surrounding title whitespace", () => {
  assert.equal(titleFor("Heading\r\n```pw\t Regular Users  \r\nalice:example", 1), "Regular Users");
});

test("handles longer fences, tilde fences, and quoted or indented blocks", () => {
  for (const fence of ["````pw Team", "~~~pw Team", "  ```pw Team", "> ```pw Team", "> > ```pw Team"]) {
    assert.equal(titleFor(fence), "Team");
  }
});

test("does not treat unrelated lines or languages as titles", () => {
  for (const line of ["```python Team", "```pw-other Team", "alice:example", "Text ```pw Team"]) {
    assert.equal(titleFor(line), "Password block");
  }
});

test("retains title case, Unicode, and markup-looking text literally", () => {
  assert.equal(titleFor("```pw Regular 用户 <b>team</b>"), "Regular 用户 <b>team</b>");
});