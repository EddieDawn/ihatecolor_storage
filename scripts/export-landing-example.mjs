import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const projectRoot = process.cwd();
const outputRoot = path.join(projectRoot, "dist");
const sourcePath = path.join(outputRoot, "index.html");
const destinationPath = path.join(projectRoot, "landingpage_example.html");

const assetPath = (url) => path.join(outputRoot, url.replace(/^\//, ""));
const asDataUrl = async (url) => {
  const extension = path.extname(url).toLowerCase();
  const mimeTypes = {
    ".avif": "image/avif",
    ".gif": "image/gif",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".webp": "image/webp",
  };
  const mimeType = mimeTypes[extension];
  if (!mimeType) throw new Error(`Unsupported embedded asset: ${url}`);
  const contents = await readFile(assetPath(url));
  return `data:${mimeType};base64,${contents.toString("base64")}`;
};

let html = await readFile(sourcePath, "utf8");

const stylesheetPattern = /<link rel="stylesheet" href="([^"]+)">/g;
for (const match of [...html.matchAll(stylesheetPattern)]) {
  const css = await readFile(assetPath(match[1]), "utf8");
  html = html.replace(match[0], `<style>${css}</style>`);
}

const imagePattern = /<img\b[^>]*>/g;
for (const match of [...html.matchAll(imagePattern)]) {
  const source = match[0].match(/\ssrc="([^"]+)"/)?.[1];
  if (!source?.startsWith("/_astro/")) continue;
  const embeddedSource = await asDataUrl(source);
  const embeddedImage = match[0]
    .replace(/\ssrc="[^"]+"/, ` src="${embeddedSource}"`)
    .replace(/\ssrcset="[^"]+"/, "")
    .replace(/\ssizes="[^"]+"/, "");
  html = html.replace(match[0], embeddedImage);
}

if (html.includes("/_astro/")) {
  throw new Error(
    "The standalone HTML still contains external Astro asset references.",
  );
}

html = `<!-- Justyes gallery standalone review copy. Generated from the Astro build. -->\n${html}`;
await writeFile(destinationPath, html, "utf8");

const size = Buffer.byteLength(html);
console.log(
  `Created ${path.basename(destinationPath)} (${(size / 1024 / 1024).toFixed(2)} MiB)`,
);
