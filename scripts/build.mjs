import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadContent } from "./lib/content.mjs";
import { escapeHtml, formatDate, renderBreadcrumb, renderLayout } from "./lib/render.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const contentRoot = path.join(projectRoot, "content");
const outputRoot = path.join(projectRoot, "dist");

if (path.dirname(outputRoot) !== projectRoot || path.basename(outputRoot) !== "dist") {
  throw new Error("拒絕清理預期專案目錄以外的輸出路徑。");
}

const { site, courses } = await loadContent(contentRoot);

async function writeOutput(relativePath, contents) {
  const destination = path.join(outputRoot, relativePath);
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, contents, "utf8");
}

function unitPath(unitNumber) {
  return `unit-${String(unitNumber).padStart(2, "0")}`;
}

function unitLabel(unit) {
  return unit.code ? `${unit.code} ${unit.title}` : unit.title;
}

function renderRecentUpdates() {
  const updates = [];
  for (const course of courses) {
    for (const unit of course.units) {
      if (unit.updated) {
        updates.push({
          updated: unit.updated,
          course,
          unit,
          label: `${course.semester} ${course.title}：${unitLabel(unit)}`,
          href: `${course.slug}/${unitPath(unit.unit)}/`,
        });
      }
      for (const material of unit.materials) {
        if (!material.updated || material.is_demo || material.status === "planned") continue;
        updates.push({
          updated: material.updated,
          course,
          unit,
          label: material.title,
          href: `${course.slug}/${unitPath(unit.unit)}/`,
        });
      }
    }
  }
  updates.sort((a, b) => b.updated.localeCompare(a.updated) || a.label.localeCompare(b.label, "zh-Hant"));
  if (updates.length === 0) {
    return `<p>目前尚無正式教材更新紀錄。示範項目不列入更新。</p>`;
  }
  return `<ol class="update-list">
          ${updates.slice(0, 10).map((update) => `<li><time datetime="${update.updated}">${formatDate(update.updated)}</time>：<a href="${escapeHtml(update.href)}">${escapeHtml(update.label)}</a></li>`).join("\n          ")}
        </ol>`;
}

function renderHome() {
  const courseCards = courses.map((course) => `<li class="card">
            <h3><a href="${escapeHtml(`${course.slug}/`)}">${escapeHtml(`${course.semester} ${course.title}`)}</a></h3>
            <p>${escapeHtml(course.description)}</p>
            <p>${course.units.length} 個單元，從第 0 單元開始。</p>
          </li>`).join("\n          ");
  const body = `<main id="main-content" class="page-shell">
      <h1>${escapeHtml(site.title)}</h1>
      <p class="lede">${escapeHtml(site.purpose)}</p>
      <section aria-labelledby="courses-heading">
        <h2 id="courses-heading">課程</h2>
        <ul class="card-list">
          ${courseCards}
        </ul>
      </section>
      <section aria-labelledby="instructions-heading">
        <h2 id="instructions-heading">使用方式</h2>
        <p>${escapeHtml(site.instructions)}</p>
        <p>使用螢幕閱讀器時，可以用標題或連結清單快速找到課程、單元與教材。</p>
      </section>
      <section aria-labelledby="updates-heading">
        <h2 id="updates-heading">最近更新</h2>
        ${renderRecentUpdates()}
      </section>
    </main>`;
  return renderLayout({ site, courses, context: "home", pageTitle: site.title, description: site.purpose, body });
}

function renderTextbooks(textbooks) {
  return `<ol class="textbook-list">
          ${textbooks.map((textbook) => `<li>
            <p class="citation">${escapeHtml(textbook.citation)}</p>
            <ul class="textbook-links">
              ${textbook.links.map((link) => `<li><a href="${escapeHtml(link.url)}">${escapeHtml(link.label)}</a></li>`).join("\n              ")}
            </ul>
            ${textbook.call_number ? `<p><strong>館藏索書號：</strong>${escapeHtml(textbook.call_number)}</p>` : ""}
            <p><strong>使用說明：</strong>${escapeHtml(textbook.note)}</p>
          </li>`).join("\n          ")}
        </ol>`;
}

function renderCourse(course) {
  const unitCards = course.units.map((unit) => {
    const registeredMaterials = unit.materials.filter((material) => !material.is_demo);
    const availableCount = registeredMaterials.filter((material) => material.status !== "planned").length;
    const plannedCount = registeredMaterials.filter((material) => material.status === "planned").length;
    let countText = "目前僅有示範內容或尚無教材";
    if (registeredMaterials.length > 0) {
      countText = `已登錄 ${registeredMaterials.length} 項教材資料`;
      if (availableCount > 0) countText += `，${availableCount} 項可開啟`;
      if (plannedCount > 0) countText += `，${plannedCount} 項待提供 Dropbox 連結`;
      countText += "。";
    }
    return `<li class="card">
            <h2><a href="${unitPath(unit.unit)}/">${escapeHtml(unitLabel(unit))}</a></h2>
            <p>${escapeHtml(unit.description)}</p>
            <p>${escapeHtml(countText)}</p>
          </li>`;
  }).join("\n          ");
  const body = `<main id="main-content" class="page-shell">
      ${renderBreadcrumb([
        { label: "首頁", href: "../" },
        { label: `${course.semester} ${course.title}` },
      ])}
      ${site.course_notice ? `<aside class="course-notice" aria-label="課程頁面使用聲明">
        <p>${escapeHtml(site.course_notice.text)}</p>
        <p><strong>TronClass 網址：</strong><a href="${escapeHtml(site.course_notice.url)}">${escapeHtml(site.course_notice.url)}</a></p>
      </aside>` : ""}
      <h1>${escapeHtml(`${course.semester} ${course.title}`)}</h1>
      <p class="lede">${escapeHtml(course.description)}</p>
      ${course.textbooks?.length ? `<section aria-labelledby="textbooks-heading">
        <h2 id="textbooks-heading">教科書</h2>
        ${renderTextbooks(course.textbooks)}
      </section>` : ""}
      ${course.materials_note ? `<p class="course-materials-note"><strong>教材說明：</strong>${escapeHtml(course.materials_note)}${site.course_notice ? ` <a href="${escapeHtml(site.course_notice.url)}">前往 TronClass 下載講義</a>` : ""}</p>` : ""}
      <section aria-labelledby="units-heading">
        <h2 id="units-heading" class="visually-hidden">課程單元</h2>
        <ul class="card-list unit-list">
          ${unitCards}
        </ul>
      </section>
    </main>`;
  return renderLayout({
    site,
    courses,
    context: "course",
    currentSlug: course.slug,
    pageTitle: `${course.semester} ${course.title}`,
    description: course.description,
    body,
  });
}

function renderMaterials(materials) {
  if (materials.length === 0) return `<p>目前尚未加入教材。</p>`;
  return `<ul class="material-list">
          ${materials.map((material) => {
            const planned = material.status === "planned";
            return `<li class="material-card${material.is_demo ? " demo" : ""}${planned ? " planned" : ""}">
            <h3>${escapeHtml(material.title)}</h3>
            ${material.is_demo ? '<p class="status"><strong>示範內容，不是正式教材</strong></p>' : ""}
            ${planned ? '<p class="status"><strong>預計教材，Dropbox 連結尚未提供</strong></p>' : ""}
            <p>${escapeHtml(material.description)}</p>
            <dl class="metadata">
              <div><dt>檔案格式</dt><dd>${escapeHtml(material.file_type)}</dd></div>
              ${material.filename ? `<div><dt>檔案名稱</dt><dd>${escapeHtml(material.filename)}</dd></div>` : ""}
              ${material.updated ? `<div><dt>更新日期</dt><dd><time datetime="${material.updated}">${formatDate(material.updated)}</time></dd></div>` : ""}
            </dl>
            ${material.note ? `<p><strong>注意事項：</strong>${escapeHtml(material.note)}</p>` : ""}
            ${planned ? "" : `<p><a class="material-link" href="${escapeHtml(material.dropbox_url)}">${material.is_demo ? "在 Dropbox 開啟：" : "下載："}${escapeHtml(material.title)}（${escapeHtml(material.file_type)}）</a></p>`}
          </li>`;
          }).join("\n          ")}
        </ul>`;
}

function renderSupplements(supplements) {
  if (supplements.length === 0) return `<p>目前無補充資料。</p>`;
  return `<ul class="resource-list">
          ${supplements.map((item) => `<li>
            <h3><a href="${escapeHtml(item.url)}">${escapeHtml(item.title)}</a></h3>
            <p>${escapeHtml(item.description)}</p>
          </li>`).join("\n          ")}
        </ul>`;
}

function renderActivities(activities) {
  if (activities.length === 0) return "";
  return `<ul class="activity-list">
          ${activities.map((activity) => `<li>
            <h3>${escapeHtml(activity.title)}</h3>
            <p><strong>類型：</strong>${escapeHtml(activity.type)}</p>
            <p>${escapeHtml(activity.description)}</p>
            <p><a class="activity-link" href="${escapeHtml(activity.url)}">${escapeHtml(activity.url_label)}</a></p>
            <dl class="metadata">
              ${activity.deadline ? `<div><dt>完成期限</dt><dd>${escapeHtml(activity.deadline)}</dd></div>` : ""}
              ${activity.submission ? `<div><dt>繳交方式</dt><dd>${escapeHtml(activity.submission)}</dd></div>` : ""}
            </dl>
            <p><strong>作業要求：</strong></p>
            <ol>
              ${activity.instructions.map((instruction) => `<li>${escapeHtml(instruction)}</li>`).join("\n              ")}
            </ol>
          </li>`).join("\n          ")}
        </ul>`;
}

function renderUnit(course, unit) {
  const courseLabel = `${course.semester} ${course.title}`;
  const body = `<main id="main-content" class="page-shell">
      ${renderBreadcrumb([
        { label: "首頁", href: "../../" },
        { label: courseLabel, href: "../" },
        { label: unitLabel(unit) },
      ])}
      <h1>${escapeHtml(`${courseLabel}：${unitLabel(unit)}`)}</h1>
      <section aria-labelledby="unit-description-heading">
        <h2 id="unit-description-heading">單元說明</h2>
        <p>${escapeHtml(unit.description)}</p>
      </section>
      <section aria-labelledby="materials-heading">
        <h2 id="materials-heading">教材下載</h2>
        ${renderMaterials(unit.materials)}
      </section>
      ${unit.activities?.length || unit.activities_note ? `<section aria-labelledby="activities-heading">
        <h2 id="activities-heading">作業與學習活動</h2>
        ${unit.activities_note ? `<p class="activity-note">${escapeHtml(unit.activities_note)}</p>` : ""}
        ${renderActivities(unit.activities)}
      </section>` : ""}
      <section aria-labelledby="supplements-heading">
        <h2 id="supplements-heading">補充資料</h2>
        ${renderSupplements(unit.supplements)}
      </section>
    </main>`;
  return renderLayout({
    site,
    courses,
    context: "unit",
    currentSlug: course.slug,
    pageTitle: `${courseLabel}：${unitLabel(unit)}`,
    description: `${unit.description} ${site.purpose}`,
    body,
  });
}

await rm(outputRoot, { recursive: true, force: true });
await writeOutput("index.html", renderHome());
for (const course of courses) {
  await writeOutput(path.join(course.slug, "index.html"), renderCourse(course));
  for (const unit of course.units) {
    await writeOutput(path.join(course.slug, unitPath(unit.unit), "index.html"), renderUnit(course, unit));
  }
}

const css = `:root {
  color-scheme: light;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans TC", sans-serif;
  font-size: 100%;
  line-height: 1.75;
  --ink: #172033;
  --muted: #465167;
  --background: #ffffff;
  --surface: #f5f7fb;
  --border: #a9b1c1;
  --accent: #004b87;
  --accent-hover: #00345f;
  --focus: #bd3b00;
  --demo-bg: #fff7d6;
  --demo-border: #785900;
}

* { box-sizing: border-box; }
html { scroll-behavior: auto; }
body { margin: 0; color: var(--ink); background: var(--background); }
a { color: var(--accent); text-decoration-thickness: 0.12em; text-underline-offset: 0.18em; }
a:hover { color: var(--accent-hover); text-decoration-thickness: 0.18em; }
a:focus-visible, button:focus-visible { outline: 0.22rem solid var(--focus); outline-offset: 0.2rem; border-radius: 0.12rem; }
.skip-link { position: fixed; top: 0.75rem; left: 0.75rem; z-index: 100; padding: 0.7rem 1rem; color: #fff; background: #111; transform: translateY(-180%); }
.skip-link:focus { transform: translateY(0); }
.page-shell { width: min(100% - 2rem, 72rem); margin-inline: auto; }
.site-header { border-bottom: 0.125rem solid var(--border); background: var(--surface); }
.site-name { margin: 0; padding-top: 1rem; font-size: 1.25rem; font-weight: 750; }
.primary-nav ul { display: flex; flex-wrap: wrap; gap: 0.5rem 1.25rem; margin: 0; padding: 0.75rem 0 1rem; list-style: none; }
.primary-nav a { display: inline-block; padding: 0.2rem 0; }
.primary-nav [aria-current="page"] { color: var(--ink); font-weight: 750; text-decoration-thickness: 0.2em; }
main { padding-block: 1.75rem 3rem; }
h1, h2, h3 { line-height: 1.3; text-wrap: balance; }
h1 { margin: 0 0 1rem; font-size: clamp(2rem, 5vw, 3rem); }
h2 { margin-top: 2.5rem; font-size: clamp(1.45rem, 3vw, 2rem); }
h3 { font-size: 1.2rem; }
.lede { max-width: 48rem; color: var(--muted); font-size: 1.2rem; }
.course-notice { margin: 0 0 1.5rem; border: 0.125rem solid var(--accent); border-radius: 0.5rem; padding: 1rem 1.25rem; background: #eef6ff; }
.course-notice p { margin: 0; }
.course-notice p + p { margin-top: 0.75rem; }
.course-materials-note { margin: 1.5rem 0 0; border-left: 0.35rem solid var(--accent); padding: 0.75rem 1rem; background: var(--surface); }
.breadcrumb ol { display: flex; flex-wrap: wrap; gap: 0.35rem; margin: 0 0 1.5rem; padding: 0; list-style: none; }
.breadcrumb li:not(:last-child)::after { margin-left: 0.35rem; content: "/"; color: var(--muted); }
.card-list, .material-list, .resource-list { margin: 1rem 0 0; padding: 0; list-style: none; }
.card-list { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr)); gap: 1rem; }
.card, .material-card, .resource-list > li, .textbook-list > li { border: 0.125rem solid var(--border); border-radius: 0.5rem; padding: 1rem 1.25rem; background: var(--surface); }
.card h2, .card h3, .material-card h3, .resource-list h3 { margin-top: 0; }
.material-list { display: grid; gap: 1.25rem; }
.activity-list { display: grid; gap: 1.25rem; margin: 1rem 0 0; padding: 0; list-style: none; }
.activity-list > li { border: 0.125rem solid var(--border); border-radius: 0.5rem; padding: 1rem 1.25rem; background: var(--surface); }
.activity-list h3 { margin-top: 0; }
.activity-link { display: inline-block; font-weight: 750; }
.activity-note { border-left: 0.35rem solid var(--accent); padding: 0.75rem 1rem; background: var(--surface); }
.textbook-list { display: grid; gap: 1.25rem; margin: 1rem 0 0; padding-left: 2rem; }
.textbook-list > li { padding-left: 1.5rem; }
.textbook-list p:first-child { margin-top: 0; }
.textbook-list p:last-child { margin-bottom: 0; }
.textbook-links { padding-left: 1.5rem; }
.citation { font-weight: 650; }
.material-card.demo { border-color: var(--demo-border); background: var(--demo-bg); }
.material-card.planned { border-style: dashed; }
.status { color: #543f00; }
.metadata { margin: 1rem 0; }
.metadata div { display: grid; grid-template-columns: minmax(7rem, 10rem) 1fr; gap: 0.75rem; }
.metadata dt { font-weight: 750; }
.metadata dd { margin: 0; }
.material-link { display: inline-block; font-weight: 750; }
.update-list { padding-left: 1.5rem; }
.visually-hidden { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }
.site-footer { border-top: 0.125rem solid var(--border); padding-block: 1.25rem; color: var(--muted); background: var(--surface); }

@media (max-width: 38rem) {
  .page-shell { width: min(100% - 1.25rem, 72rem); }
  .primary-nav ul { display: block; }
  .primary-nav li + li { margin-top: 0.45rem; }
  .metadata div { display: block; }
  .metadata dd { margin-bottom: 0.5rem; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { scroll-behavior: auto !important; }
}

@media print {
  .skip-link, .primary-nav { display: none; }
  a { color: currentColor; }
}
`;
await writeOutput("assets/styles.css", css);
await writeOutput(".nojekyll", "");

const pageCount = 1 + courses.length + courses.reduce((count, course) => count + course.units.length, 0);
console.log(`建置完成：${pageCount} 個 HTML 頁面已輸出至 dist。`);
