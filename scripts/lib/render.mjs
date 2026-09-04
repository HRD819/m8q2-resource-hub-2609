export function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function formatDate(value) {
  if (!value) return "";
  const [year, month, day] = value.split("-").map(Number);
  return `${year} 年 ${month} 月 ${day} 日`;
}

function courseHref(context, currentSlug, targetSlug) {
  if (context === "home") return `${targetSlug}/`;
  if (context === "course") return targetSlug === currentSlug ? "./" : `../${targetSlug}/`;
  if (context === "textbook") return targetSlug === currentSlug ? "../" : `../../${targetSlug}/`;
  return targetSlug === currentSlug ? "../" : `../../${targetSlug}/`;
}

function homeHref(context) {
  if (context === "home") return "./";
  if (context === "course") return "../";
  if (context === "textbook") return "../../";
  return "../../";
}

function assetHref(context) {
  if (context === "home") return "assets/styles.css";
  if (context === "course") return "../assets/styles.css";
  if (context === "textbook") return "../../assets/styles.css";
  return "../../assets/styles.css";
}

function primaryNav({ courses, context, currentSlug }) {
  const homeCurrent = context === "home" ? ' aria-current="page"' : "";
  const courseLinks = courses.map((course) => {
    const current = course.slug === currentSlug ? ' aria-current="page"' : "";
    return `<li><a href="${escapeHtml(courseHref(context, currentSlug, course.slug))}"${current}>${escapeHtml(`${course.semester} ${course.title}`)}</a></li>`;
  }).join("\n          ");
  return `<nav class="primary-nav" aria-label="主要導覽">
        <ul>
          <li><a href="${homeHref(context)}"${homeCurrent}>首頁</a></li>
          ${courseLinks}
        </ul>
      </nav>`;
}

export function renderLayout({ site, courses, context, currentSlug = "", pageTitle, description, body }) {
  const fullTitle = pageTitle === site.title ? site.title : `${pageTitle}｜${site.title}`;
  return `<!doctype html>
<html lang="zh-Hant-TW">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex, nofollow">
    <meta name="description" content="${escapeHtml(description)}">
    <title>${escapeHtml(fullTitle)}</title>
    <link rel="stylesheet" href="${assetHref(context)}">
  </head>
  <body>
    <a class="skip-link" href="#main-content">跳至主要內容</a>
    <header class="site-header">
      <div class="page-shell">
        <p class="site-name"><a href="${homeHref(context)}">${escapeHtml(site.title)}</a></p>
        ${primaryNav({ courses, context, currentSlug })}
      </div>
    </header>
    ${body}
    <footer class="site-footer">
      <div class="page-shell"></div>
    </footer>
  </body>
</html>
`;
}

export function renderBreadcrumb(items) {
  return `<nav class="breadcrumb" aria-label="階層導覽">
        <ol>
          ${items.map((item, index) => {
            const last = index === items.length - 1;
            return last
              ? `<li aria-current="page">${escapeHtml(item.label)}</li>`
              : `<li><a href="${escapeHtml(item.href)}">${escapeHtml(item.label)}</a></li>`;
          }).join("\n          ")}
        </ol>
      </nav>`;
}
