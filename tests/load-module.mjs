import { build } from "esbuild";
import { fileURLToPath } from "node:url";

// Exercise the TypeScript source without generating files or adding a test runtime.
export async function loadModule(relativePath) {
  const result = await build({
    entryPoints: [fileURLToPath(new URL(relativePath, import.meta.url))],
    bundle: true,
    write: false,
    platform: "node",
    format: "esm",
    target: "node18",
  });
  const code = Buffer.from(result.outputFiles[0].text).toString("base64");
  return import(`data:text/javascript;base64,${code}`);
}