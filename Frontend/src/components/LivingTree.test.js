import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { after, before, test } from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";

let vite;
let LivingTree;
let TreeContext;
const previousLocalStorage = globalThis.localStorage;

before(async () => {
  globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
  vite = await createServer({ server: { middlewareMode: true }, appType: "custom" });
  ({ default: LivingTree } = await vite.ssrLoadModule("/src/components/LivingTree.jsx"));
  ({ default: TreeContext } = await vite.ssrLoadModule("/src/context/TreeContextValue.js"));
});

after(async () => {
  await vite?.close();
  if (previousLocalStorage === undefined) delete globalThis.localStorage;
  else globalThis.localStorage = previousLocalStorage;
});

const renderTree = (selectedTree, user = { xp: 0, level: 1 }) => renderToStaticMarkup(
  React.createElement(
    TreeContext.Provider,
    { value: { selectedTree, treeAura: "none" } },
    React.createElement(LivingTree, { user, skills: [], sessions: [], isWatering: false }),
  ),
);

test("all persisted tree types render their own accessible tree illustration", () => {
  for (const treeType of ["sprout", "classic", "sakura", "autumn", "winter", "cosmic", "golden"]) {
    const markup = renderTree(treeType, { xp: 1000, level: 10 });
    assert.match(markup, new RegExp(`${treeType} sanctuary plant`));
    assert.match(markup, /plant at .* stage 5/);
    assert.match(markup, /src="\/images\/skillforge-magical-plant\.png"/);
    assert.match(markup, new RegExp(`data-tree-type="${treeType}"`));
  }
});

test("the supplied plant asset is served as an alpha-enabled PNG", () => {
  const image = readFileSync(new URL("../../public/images/skillforge-magical-plant.png", import.meta.url));
  assert.deepEqual([...image.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  assert.equal(image.readUInt32BE(16), 1679);
  assert.equal(image.readUInt32BE(20), 937);
  assert.equal(image[25], 6, "PNG color type 6 stores RGBA pixels");
});

test("illustration size and actual fruit statistics follow existing progression data", () => {
  const youngTree = renderTree("sprout", { xp: 0, level: 1 });
  const matureTree = renderTree("sprout", { xp: 5000, level: 20 });

  assert.match(youngTree, /--plant-scale:0\.66/);
  assert.match(youngTree, /<div class="text-xl font-bold text-white sm:text-2xl">0<\/div><div class="text-\[10px\] uppercase tracking-\[0\.14em\] text-slate-300 sm:text-xs sm:tracking-wider">Fruits/);
  assert.match(matureTree, /--plant-scale:1\.04/);
  assert.match(matureTree, /<div class="text-xl font-bold text-white sm:text-2xl">4<\/div><div class="text-\[10px\] uppercase tracking-\[0\.14em\] text-slate-300 sm:text-xs sm:tracking-wider">Fruits/);
});
