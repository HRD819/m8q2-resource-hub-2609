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
  "textbooks": [],
  "order": 1
}
```

`slug` 必須與資料夾名稱相同，且只使用小寫英文、數字與連字號。`order` 決定首頁及主要導覽順序。`textbooks` 可省略；有資料時會在課程頁、單元清單之前產生「教科書」段落。

`site.json` 的可選 `course_notice` 會顯示在每一門課程頁的頁首區域，適合放置課程平台公告與正式資訊來源。其 `text` 與 `url` 必填，網址必須是 HTTPS；目前聲明指向輔大 TronClass。

`course.json` 的 `materials_note` 可省略；有資料時會在教科書段落後、單元清單前顯示課程教材取得方式的補充說明。

### Textbook

```json
{
  "citation": "完整書目資料",
  "links": [
    {
      "label": "在圖書館開啟電子書",
      "url": "https://example.edu/ebook"
    }
  ],
  "call_number": "館藏位置與索書號",
  "note": "使用時機與準備方式"
}
```

`citation`、`links` 與 `note` 為必填；`links` 至少要有一筆具體且使用 HTTPS 的連結。`call_number` 可省略。連結文字應直接說明是開啟電子書或下載 PDF，不使用「按這裡」等模糊文字。

### `unit-XX.json`

```json
{
  "unit": 0,
  "code": "1-00",
  "title": "課程介紹",
  "description": "單元說明",
  "updated": "2026-09-04",
  "materials": [],
  "supplements": []
}
```

`code` 是顯示給學生的課程內單元編碼，例如 `1-00`、`1-01`；未提供時才直接顯示 `title`。`updated` 可省略；如有值，必須使用 `YYYY-MM-DD`。每門課至少要有 `unit-00.json`。

`activities` 可省略；有資料時會在單元的教材下載後顯示「作業與學習活動」區段。若已知單元預計有作業但題目尚未整理，可使用 `activities_note` 顯示待提供狀態。每筆活動包含 `title`、`type`、`description`、`url`、`url_label` 與 `instructions`；`deadline`、`submission` 可用來呈現期限與繳交方式。活動連結須使用 HTTPS，作業規則請拆成有順序的說明項目。

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

`title`、`description` 與 `file_type` 為必填。可開啟的教材預設為 `status: "available"`，此時 `dropbox_url` 必填且必須是 HTTPS Dropbox 網址。正式教材使用檔案的個別分享網址，並將查詢參數設為 `dl=1` 以直接下載；不得用整個共用資料夾網址代替。`filename`、`updated`、`note`、`status` 與 `is_demo` 可省略。正式教材不得設為 `is_demo: true`。

若已知教材名稱與格式、但尚未取得 Dropbox 連結，可先建立預計教材：

```json
{
  "title": "資訊組織課程簡介",
  "description": "課程簡介的 PowerPoint 版本。",
  "file_type": "PowerPoint（PPTX）",
  "filename": "1-00.資訊組織課程簡介260904.pptx",
  "status": "planned",
  "note": "Dropbox 分享連結待提供。"
}
```

`planned` 教材不得設定 `dropbox_url`；頁面會朗讀並顯示「Dropbox 連結尚未提供」，且不產生無效連結。取得分享連結後，移除 `status` 或改為 `available`，並加入 `dropbox_url`。

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
2. 將 metadata 加到 `materials`；若連結尚未取得，使用 `status: "planned"`。正式教材加入個別 Dropbox 分享網址並使用 `dl=1`，不把教材檔案複製到 repository。
3. 正式上線前，移除對應的示範 material，或改成完整的正式資料。
4. 執行 `npm run ci`，並手動開啟 Dropbox 連結確認權限與內容。

### Add an assignment or learning activity

1. 在正確的 `unit-XX.json` 加入 `activities` 陣列。
2. 填寫活動題目連結、期限、繳交方式與逐項規則；連結文字要直接說明目的，例如「開啟作業一題目 Google 文件」。
3. 執行 `npm run ci`，確認活動區段與連結文字通過檢查。

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

首次發布已完成：提交 `04687d2` 已推送至 `main`，GitHub Actions run `33873532088` 的品質檢查與 Pages 部署均成功。正式網址為 <https://hrd819.github.io/m8q2-resource-hub-2609/>；若在本機驗收時無法連線，請先確認網路 DNS，再依 `ACCESSIBILITY_TESTING.md` 完成正式網址、Dropbox 與 NVDA 流程複核。

## Demo reference

`accessible_course_demo_v2/` 是本次提供的參考 Demo。其簡潔版面、skip link、focus 與六個單元的示範概念已納入正式產生器。Demo 的 HTML 不是內容來源，也不會被複製到 `dist/`。
