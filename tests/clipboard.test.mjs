import assert from "node:assert/strict";
import test from "node:test";
import { loadModule } from "./load-module.mjs";

const { copyToClipboard } = await loadModule("../src/utils/clipboard.ts");

function documentWithClipboard(clipboard) {
  return { defaultView: { navigator: { clipboard } } };
}

test("copies the exact credential using its document's clipboard", async () => {
  const writes = [];
  const clipboard = {
    writeText(value) {
      assert.equal(this, clipboard);
      writes.push(value);
      return Promise.resolve();
    },
  };
  assert.equal(await copyToClipboard(" \tsecret:🔑 ", documentWithClipboard(clipboard)), true);
  assert.deepEqual(writes, [" \tsecret:🔑 "]);
});

test("keeps separate windows' clipboard instances separate", async () => {
  const writes = [];
  const makeDocument = (name) => documentWithClipboard({
    writeText(value) {
      writes.push([name, value]);
      return Promise.resolve();
    },
  });
  await copyToClipboard("first", makeDocument("main"));
  await copyToClipboard("second", makeDocument("pop-out"));
  assert.deepEqual(writes, [["main", "first"], ["pop-out", "second"]]);
});

test("reports clipboard permission rejection without throwing", async () => {
  const doc = documentWithClipboard({
    writeText: () => Promise.reject(new Error("Permission denied")),
  });
  assert.equal(await copyToClipboard("example", doc), false);
});

test("reports synchronous clipboard failures without throwing", async () => {
  const doc = documentWithClipboard({
    writeText() { throw new Error("Clipboard unavailable"); },
  });
  assert.equal(await copyToClipboard("example", doc), false);
});

test("reports a missing clipboard or detached document without a DOM fallback", async () => {
  assert.equal(await copyToClipboard("example", documentWithClipboard(undefined)), false);
  assert.equal(await copyToClipboard("example", { defaultView: null }), false);
});