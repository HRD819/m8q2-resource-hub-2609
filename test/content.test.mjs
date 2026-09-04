import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { loadContent } from "../scripts/lib/content.mjs";
import { escapeHtml, formatDate } from "../scripts/lib/render.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("目前課程包含已規劃的單元編號", async () => {
  const { courses } = await loadContent(path.join(projectRoot, "content"));
  assert.deepEqual(courses.map((course) => course.slug), [
    "1151-information-organization",
    "1151-reference-resources",
  ]);
  assert.deepEqual(courses[0].units.map((unit) => unit.unit), [0, 1, 2, 3, 4, 5, 6]);
  assert.deepEqual(courses[0].units.map((unit) => unit.code), ["1-00", "1-01", "1-02", "1-03", "1-04", "1-05", "1-06"]);
  assert.equal(courses[0].textbooks.length, 3);
  assert.deepEqual(courses[0].textbooks.map((textbook) => textbook.slug), [
    "information-organization",
    "chinese-cataloging-rules-third-edition",
    "learn-descriptive-cataloging",
  ]);
  assert.equal(courses[0].course_note, "1-01單元以後的課程內容都有在TronClass提供pdf檔,此處額外提供可編輯的檔案，因此一樣的檔案會有2種檔案格式");
  assert.equal(courses[0].units[0].code, "1-00");
  assert.equal(courses[0].units[0].description_items.length, 5);
  assert.equal(courses[1].textbooks.length, 1);
  assert.equal(courses[1].textbooks[0].slug, "reference-resources-and-services");
  assert.equal(courses[1].course_note, "1-01單元以後的課程內容都有在TronClass提供pdf檔,此處額外提供可編輯的檔案，因此一樣的檔案會有2種檔案格式");
  assert.equal(courses[1].materials_note, "其餘使用的教材則為老師自編的講義，可在 TronClass 下載。");
  assert.equal(courses[1].units[0].code, "1-00");
  assert.equal(courses[1].units[0].title, "課程介紹");
  assert.equal(courses[1].units[0].activities.length, 1);
  assert.equal(courses[1].units[0].activities[0].title, "作業一");
  assert.equal(courses[1].units[0].activities[0].type, "Google文件檔(唯讀)");
  assert.equal(courses[1].units[0].activities[0].deadline, "11 月 13 日上課前完成所有題目，繳交紙本並上傳電子檔至TronClass。");
  assert.equal(courses[1].units[0].activities[0].instructions, undefined);
  assert.equal(courses[1].units[0].description_items.length, 6);
  assert.equal(courses[1].units[3].activities_note, "本單元預計有數個線上作業；題目、連結與繳交方式待提供。");
  assert.deepEqual(courses[1].units.map((unit) => unit.unit), [0, 1, 2, 3, 4, 5, 6, 7, 8]);
  assert.deepEqual(courses[1].units.map((unit) => unit.code), ["1-00", "1-01", "1-02", "1-03", "1-04", "1-05", "1-06", "1-07", "1-08"]);
  for (const course of courses) {
    for (const unit of course.units) {
      assert.doesNotMatch(unit.description, /正式文字說明待補|正式文字說明待教師補充|本單元為課程介紹；正式文字說明待補/);
    }
  }
});

test("正式教材提供個別 Dropbox 下載網址，未上傳教材維持 planned", async () => {
  const { courses } = await loadContent(path.join(projectRoot, "content"));
  const materials = courses.flatMap((course) => course.units.flatMap((unit) => unit.materials));
  const demos = materials.filter((material) => material.is_demo);
  const planned = materials.filter((material) => material.status === "planned");
  const informationOrganizationMaterials = courses[0].units.flatMap((unit) => unit.materials);
  const availableInformationOrganizationMaterials = informationOrganizationMaterials.filter((material) => material.status !== "planned");
  const referenceMaterials = courses[1].units.flatMap((unit) => unit.materials);
  const availableReferenceMaterials = referenceMaterials.filter((material) => material.status !== "planned");
  assert.equal(materials.length, 44);
  assert.equal(demos.length, 0);
  assert.equal(planned.length, 14);
  assert.equal(availableInformationOrganizationMaterials.length, 22);
  assert.equal(availableReferenceMaterials.length, 8);
  for (const material of demos) {
    assert.equal(material.is_demo, true);
    assert.match(material.dropbox_url, /^https:\/\/(?:[^/]+\.)?dropbox\.com\//);
  }
  for (const material of availableInformationOrganizationMaterials) {
    const url = new URL(material.dropbox_url);
    assert.equal(url.searchParams.get("dl"), "1");
    assert.ok(material.filename);
  }
  for (const material of availableReferenceMaterials) {
    const url = new URL(material.dropbox_url);
    assert.equal(url.searchParams.get("dl"), "1");
    assert.ok(material.filename);
  }
  for (const material of planned) assert.equal(material.dropbox_url, undefined);
  assert.equal(new URL(courses[0].textbooks[1].links[0].url).searchParams.get("dl"), "1");
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
