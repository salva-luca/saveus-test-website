import puppeteer from "puppeteer";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "temporary screenshots");

const url = process.argv[2] || "http://localhost:3000";
const label = process.argv[3] || "";
const width = parseInt(process.argv[4] || "1440", 10);
const height = parseInt(process.argv[5] || "900", 10);

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const browser = await puppeteer.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});
const page = await browser.newPage();
await page.setViewport({ width, height, deviceScaleFactor: 2 });
await page.goto(url, { waitUntil: "networkidle0", timeout: 60000 });
await new Promise((r) => setTimeout(r, 300));

// Fixed filenames per label — each run OVERWRITES the previous shot for that
// label instead of piling up new numbered files. Reuse the same label while
// iterating on a view (e.g. "desktop", "mobile", "hero") so the folder always
// reflects only the current state, not the history of every pass.
const filename = label ? `screenshot-${label}.png` : `screenshot.png`;
const outPath = path.join(OUT_DIR, filename);
await page.screenshot({ path: outPath, fullPage: true });

await browser.close();
console.log(`Saved: ${outPath}`);
