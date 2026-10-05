import assert from "node:assert/strict";
import test from "node:test";
import { loadModule } from "./load-module.mjs";

const { parsePwBlock } = await loadModule("../src/parse-pw-block.ts");

test("parses paired, username-only, and password-only entries in order", () => {
  assert.deepEqual(parsePwBlock("alice:example\nbob\n:secret"), [
    { username: "alice", password: "example" },
    { username: "bob" },
    { password: "secret" },
  ]);
});

test("ignores blank lines, whole-line comments, and empty pairs", () => {
  assert.deepEqual(parsePwBlock("\n \t\n# comment\n  # another:comment\n:\n"), []);
});

test("handles CRLF line endings without copying carriage returns", () => {
  assert.deepEqual(parsePwBlock("alice:one\r\nbob:two\r\n"), [
    { username: "alice", password: "one" },
    { username: "bob", password: "two" },
  ]);
});

test("only the first colon separates the username and password", () => {
  assert.deepEqual(parsePwBlock("alice:one:two::three\n::"), [
    { username: "alice", password: "one:two::three" },
    { password: ":" },
  ]);
});

test("trims usernames but preserves all password whitespace", () => {
  assert.deepEqual(parsePwBlock("  alice  : \tsecret  \n  bob  \n: \t "), [
    { username: "alice", password: " \tsecret  " },
    { username: "bob" },
    { password: " \t " },
  ]);
});

test("an empty password produces a username-only entry", () => {
  assert.deepEqual(parsePwBlock("alice:\n:"), [{ username: "alice" }]);
});

test("hashes inside passwords are literal, not inline comments", () => {
  assert.deepEqual(parsePwBlock("alice:abc#123\n:#secret"), [
    { username: "alice", password: "abc#123" },
    { password: "#secret" },
  ]);
});

test("keeps Unicode and HTML-looking text literal", () => {
  assert.deepEqual(parsePwBlock("用户:<b>🔑&secret</b>"), [
    { username: "用户", password: "<b>🔑&secret</b>" },
  ]);
});