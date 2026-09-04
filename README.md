# 無障礙課程教材平台

這是一個以全盲學生使用情境為第一優先的課程教材導覽網站。學生依課程與單元理解教材用途，再前往 Dropbox 取得檔案。實際教材不存放在本 repository。

`SPEC.md` 是權威規格；如與其他文件或 Demo 衝突，以 `SPEC.md` 為準。

## Requirements

- Node.js 22 或更新版本
- npm（僅用來執行 scripts；專案沒有第三方 package 相依）

## Development

```powershell
npm run validate
npm test
npm run build
npm run check
npm run serve
```

本機預覽網址預設為 `http://127.0.0.1:4173/`。需改 port 時，可先設定 `PORT` 環境變數。

建議在每次內容或程式變更後執行完整流程：

```powershell
npm run ci
```

`npm run ci` 依序執行內容驗證、單元測試、production build 與產出頁面檢查。

## Build output

`npm run build` 會重建 `dist/`，產生：

- 首頁
- 每門課的課程頁
- 每個單元的獨立頁面
- 共用 CSS
- `.nojekyll`

`dist/` 是產出物，不是內容來源，請勿直接手動修改。

## Folder structure

```text
content/
  site.json
  courses/
    <course-slug>/
      course.json
      unit-00.json
      unit-01.json
scripts/
  build.mjs
  validate-content.mjs
  check-site.mjs
  serve.mjs
  lib/
test/
.github/workflows/deploy-pages.yml
dist/                           # generated
accessible_course_demo_v2/      # reference Demo; not deployed
```

## Content schema

### `course.json`

```json
{
  "semester": "1151",
  "title": "資訊組織",
  "slug": "1151-information-organization",
  "description": "課程說明",
  "order": 1
}
```

`slug` 必須與資料夾名稱相同，且只使用小寫英文、數字與連字號。`order` 決定首頁及主要導覽順序。

### `unit-XX.json`

```json
{
  "unit": 0,
  "title": "第 0 單元",
  "description": "單元說明",
  "updated": "2026-09-04",
  "materials": [],
  "supplements": []
}
```

`updated` 可省略；如有值，必須使用 `YYYY-MM-DD`。每門課至少要有 `unit-00.json`。

### Material

```json
{
  "title": "資訊組織第 3 單元講義",
  "description": "本週課程使用的主要講義。",
  "file_type": "PDF",
  "dropbox_url": "https://www.dropbox.com/scl/fi/...",
  "updated": "2026-09-04",
  "note": "建議上課前下載",
  "is_demo": false
}
```

`title`、`description`、`file_type` 與 `dropbox_url` 為必填。`dropbox_url` 必須是 HTTPS Dropbox 網址。`updated`、`note` 與 `is_demo` 可省略。正式教材不得設為 `is_demo: true`。

### Supplement

```json
{
  "title": "延伸閱讀名稱",
  "description": "資源內容與用途。",
  "url": "https://example.edu/resource",
  "updated": "2026-09-04"
}
```

補充資料允許連到外部 HTTPS 資源。如屬於教材檔案，仍必須放在 Dropbox，並以 material 維護。

## Maintenance workflows

### Add a course

1. 在 `content/courses/` 建立新的 slug 資料夾。
2. 新增 `course.json`。
3. 新增至少 `unit-00.json`。
4. 執行 `npm run ci`。

### Add a unit

1. 在正確課程資料夾新增 `unit-XX.json`。
2. 使 `unit` 數值與檔名編號相同。
3. 填寫單元說明、`materials` 與 `supplements`。
4. 執行 `npm run ci`。

### Add teaching material or update a Dropbox link

1. 只編輯正確的 `unit-XX.json`。
2. 將 metadata 加到 `materials`；不把教材檔案複製到 repository。
3. 正式上線前，移除對應的示範 material，或改成完整的正式資料。
4. 執行 `npm run ci`，並手動開啟 Dropbox 連結確認權限與內容。

首頁「最近更新」由單元或正式教材的 `updated` 自動產生；示範項目不列入。

## Accessibility requirements and testing

目標至少為 WCAG 2.2 AA。頁面使用語意化 `header`、`nav`、`main`、`section`、`footer`、連貫標題階層與可見焦點。核心導覽無 JavaScript。

`npm run check` 會檢查：

- 每頁 `noindex, nofollow`
- landmarks、單一 `h1` 與無跳級標題
- skip link 與可見 focus 規則
- 連結文字與內部路徑
- 主要色彩至少 4.5:1 對比
- responsive media query
- 未產生 sitemap / feed

自動檢查不代替人工測試。完整 keyboard-only 與 NVDA + Chrome 驗收步驟見 `ACCESSIBILITY_TESTING.md`。

## noindex and low-discoverability

每個產出 HTML 都包含：

```html
<meta name="robots" content="noindex, nofollow">
```

本站不產生 sitemap、RSS 或 Atom，也不使用 `robots.txt Disallow: /` 取代 `noindex`。這是降低被搜尋與偶然發現的策略，不是存取控制；知道網址的人仍可瀏覽。

## GitHub Pages deployment

`.github/workflows/deploy-pages.yml` 會在 pull request、`main` branch push 或人工觸發時執行品質檢查。流程先執行 `npm run ci`；只有內容、測試、建置與網站檢查全數成功，才可能上傳 `dist/`。為避免尚未完成正式教材與人工驗收時意外公開，push 預設只檢查、不部署；只有人工執行 workflow，或 repository variable `PUBLISH_PAGES` 設為 `true` 的 `main` push 才會部署。

一次性設定：

1. 確認 GitHub repository 採符合需求的可見性與低可猜性名稱，預設 branch 為 `main`。
2. 在 GitHub repository 的 **Settings → Pages → Build and deployment → Source** 選擇 **GitHub Actions**。
3. 未準備發布時不要建立 `PUBLISH_PAGES=true`；push 僅執行品質檢查。
4. 完成正式教材替換與人工驗收後，先以 **Actions → 品質檢查與 GitHub Pages 部署 → Run workflow** 做第一次發布；若之後要讓每次 `main` push 自動發布，再建立 repository variable `PUBLISH_PAGES`，值設為 `true`。
5. 確認 workflow 的品質與部署 jobs 成功，再用直接網址檢查首頁、課程頁、單元頁與 Dropbox 連結，並依 `ACCESSIBILITY_TESTING.md` 完成正式站複核。

目前本機已有 `main` branch、低可猜性遠端 `origin` 與初始提交；但尚未確認遠端 `main`、repository 可見性、Pages 設定或正式 workflow 結果。不得把本機建置通過解讀為已公開部署。

## Demo reference

`accessible_course_demo_v2/` 是本次提供的參考 Demo。其簡潔版面、skip link、focus 與六個單元的示範概念已納入正式產生器。Demo 的 HTML 不是內容來源，也不會被複製到 `dist/`。
