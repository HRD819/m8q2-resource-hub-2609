import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { loadContent } from "../scripts/lib/content.mjs";
import { escapeHtml, formatDate } from "../scripts/lib/render.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("目前兩門課都包含第 0 至第 2 單元", async () => {
  const { courses } = await loadContent(path.join(projectRoot, "content"));
  assert.deepEqual(courses.map((course) => course.slug), [
    "1151-information-organization",
    "1151-reference-resources",
  ]);
  for (const course of courses) assert.deepEqual(course.units.map((unit) => unit.unit), [0, 1, 2]);
});

test("每個示範教材都使用 Dropbox HTTPS 網址並明確標記", async () => {
  const { courses } = await loadContent(path.join(projectRoot, "content"));
  const materials = courses.flatMap((course) => course.units.flatMap((unit) => unit.materials));
  assert.equal(materials.length, 6);
  for (const material of materials) {
    assert.equal(material.is_demo, true);
    assert.match(material.dropbox_url, /^https:\/\/(?:[^/]+\.)?dropbox\.com\//);
  }
});

test("輸出文字會進行 HTML escaping", () => {
  assert.equal(escapeHtml('<script>alert("x")</script>'), "&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;");
  assert.equal(formatDate("2026-09-04"), "2026 年 9 月 4 日");
});

test("非 Dropbox 教材網址無法通過驗證", async () => {
  const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), "accessible-course-test-"));
  const courseRoot = path.join(temporaryRoot, "courses", "sample-course");
  await mkdir(courseRoot, { recursive: true });
  await writeFile(path.join(temporaryRoot, "site.json"), JSON.stringify({ title: "A", purpose: "B", instructions: "C" }));
  await writeFile(path.join(courseRoot, "course.json"), JSON.stringify({ semester: "1", title: "T", slug: "sample-course", description: "D", order: 1 }));
  await writeFile(path.join(courseRoot, "unit-00.json"), JSON.stringify({
    unit: 0,
    title: "第 0 單元",
    description: "D",
    materials: [{ title: "M", description: "D", file_type: "PDF", dropbox_url: "https://example.com/file.pdf" }],
    supplements: [],
  }));
  await assert.rejects(loadContent(temporaryRoot), /Dropbox/);
});
