import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadContent } from "./lib/content.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputRoot = path.join(projectRoot, "dist");
const { courses } = await loadContent(path.join(projectRoot, "content"));
const errors = [];

async function listHtmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return listHtmlFiles(entryPath);
    return entry.isFile() && entry.name.endsWith(".html") ? [entryPath] : [];
  }));
  return nested.flat();
}

function textOnly(value) {
  return value.replace(/<[^>]*>/g, " ").replace(/&[a-z#0-9]+;/gi, " ").replace(/\s+/g, " ").trim();
}

function checkHeadings(html, label) {
  const levels = [...html.matchAll(/<h([1-6])\b/gi)].map((match) => Number(match[1]));
  if (levels.filter((level) => level === 1).length !== 1) errors.push(`${label}: 必須恰有一個 h1。`);
  for (let index = 1; index < levels.length; index += 1) {
    if (levels[index] > levels[index - 1] + 1) errors.push(`${label}: 標題階層從 h${levels[index - 1]} 跳到 h${levels[index]}。`);
  }
}

async function checkInternalLink(file, href, label) {
  const withoutFragment = href.split("#", 1)[0].split("?", 1)[0];
  if (!withoutFragment) return;
  let target = path.resolve(path.dirname(file), withoutFragment);
  if (withoutFragment.endsWith("/")) target = path.join(target, "index.html");
  try {
    await access(target);
  } catch {
    errors.push(`${label}: 找不到內部連結 ${href}。`);
  }
}

const htmlFiles = await listHtmlFiles(outputRoot);
const expectedCount = 1 + courses.length + courses.reduce((count, course) => count + (course.textbooks?.length ?? 0) + course.units.length, 0);
if (htmlFiles.length !== expectedCount) errors.push(`dist: 預期 ${expectedCount} 個 HTML，實際為 ${htmlFiles.length} 個。`);

for (const file of htmlFiles) {
  const label = path.relative(projectRoot, file).replaceAll("\\", "/");
  const html = await readFile(file, "utf8");
  if (!/^<!doctype html>/i.test(html)) errors.push(`${label}: 缺少 HTML5 doctype。`);
  if (!/<html\s+lang="zh-Hant-TW">/i.test(html)) errors.push(`${label}: 缺少正確的繁體中文 lang。`);
  if (!/<meta\s+name="robots"\s+content="noindex, nofollow">/i.test(html)) errors.push(`${label}: 缺少 noindex, nofollow。`);
  if (!/<a\s+class="skip-link"\s+href="#main-content">/i.test(html)) errors.push(`${label}: 缺少跳至主要內容連結。`);
  for (const landmark of ["header", "nav", "main", "footer"]) {
    if (!new RegExp(`<${landmark}\\b`, "i").test(html)) errors.push(`${label}: 缺少 ${landmark} landmark。`);
  }
  if (!/<main\s+id="main-content"/i.test(html)) errors.push(`${label}: main 沒有 main-content id。`);
  if (/<script\b/i.test(html)) errors.push(`${label}: 核心頁面不應依賴 client-side script。`);
  if (/\starget="_blank"/i.test(html)) errors.push(`${label}: 連結不應未經說明開啟新視窗。`);
  checkHeadings(html, label);

  const links = [...html.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)];
  for (const [, href, body] of links) {
    const linkText = textOnly(body);
    if (!linkText) errors.push(`${label}: 發現空白連結。`);
    if (/^(點這裡|下載|檔案|連結)$/i.test(linkText)) errors.push(`${label}: 連結文字「${linkText}」太模糊。`);
    if (/^https?:\/\//i.test(href)) {
      if (!href.startsWith("https://")) errors.push(`${label}: 外部連結必須使用 HTTPS：${href}。`);
    } else {
      await checkInternalLink(file, href, label);
    }
  }
}

for (const course of courses) {
  const expected = [
    path.join(outputRoot, course.slug, "index.html"),
    ...(course.textbooks ?? []).map((textbook) => path.join(outputRoot, course.slug, `textbook-${textbook.slug}`, "index.html")),
    ...course.units.map((unit) => path.join(outputRoot, course.slug, `unit-${String(unit.unit).padStart(2, "0")}`, "index.html")),
  ];
  for (const file of expected) {
    try { await access(file); } catch { errors.push(`穩定 URL 輸出不存在：${path.relative(outputRoot, file)}。`); }
  }
}

const css = await readFile(path.join(outputRoot, "assets", "styles.css"), "utf8");
if (!/:focus-visible/.test(css)) errors.push("CSS: 缺少 focus-visible 樣式。");
if (/outline\s*:\s*(?:none|0(?:px|rem|em)?)\s*[;}]/i.test(css)) errors.push("CSS: 不得移除 focus outline。");
if (!/@media\s*\(max-width:/i.test(css)) errors.push("CSS: 缺少 responsive media query。");

function relativeLuminance(hex) {
  const channels = hex.match(/[0-9a-f]{2}/gi).map((channel) => Number.parseInt(channel, 16) / 255);
  const linear = channels.map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function contrastRatio(foreground, background) {
  const first = relativeLuminance(foreground);
  const second = relativeLuminance(background);
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}

const cssColors = new Map([...css.matchAll(/--([a-z-]+):\s*#([0-9a-f]{6})/gi)].map((match) => [match[1], match[2]]));
for (const colorName of ["ink", "muted", "accent", "accent-hover", "focus"]) {
  const ratio = contrastRatio(cssColors.get(colorName), cssColors.get("background"));
  if (ratio < 4.5) errors.push(`CSS: ${colorName} 對 background 的對比 ${ratio.toFixed(2)}:1 未達 4.5:1。`);
}
for (const forbidden of ["sitemap.xml", "rss.xml", "atom.xml"]) {
  try { await access(path.join(outputRoot, forbidden)); errors.push(`dist: 不應產生 ${forbidden}。`); } catch { /* expected */ }
}

if (errors.length > 0) {
  throw new Error(`網站檢查失敗：\n- ${errors.join("\n- ")}`);
}
console.log(`網站檢查通過：${htmlFiles.length} 頁；noindex、landmarks、標題、連結、focus 與 responsive 規則均已驗證。`);
