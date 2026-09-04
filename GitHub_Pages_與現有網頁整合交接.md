# GitHub Pages 與現有課程網頁整合交接

更新時間：2026-09-04 20:27 +08:00

## 交接目的

請把已完成的課程網頁版本接入本 repository 現有的「結構化內容 → 自動建置 → 品質檢查 → GitHub Pages」流程。

不要直接用手寫 HTML 取代目前架構，也不要手動編輯 `dist/`。應把已完成版本的版面、視覺與互動方式移植到產生器，讓後續新增教材仍只需要維護 `content/`。

## 接手前必讀

依序完整閱讀：

1. `AGENTS.md`
2. `SPEC.md`
3. `README.md`
4. `IMPLEMENTATION_PLAN.md`
5. `DECISIONS.md`
6. `ACCESSIBILITY_TESTING.md`
7. `交接記錄檔.md`

若任何 Demo、現有程式或新網頁與 `SPEC.md` 衝突，以 `SPEC.md` 為準。不得弱化 accessibility、Dropbox single source of truth、結構化內容維護或 `noindex`。

## 已完成的 GitHub／Pages 工作

- GitHub 帳號：`HRD819`
- Public repository：<https://github.com/HRD819/m8q2-resource-hub-2609>
- Remote：`origin = https://github.com/HRD819/m8q2-resource-hub-2609.git`
- 預設分支：`main`
- 目前遠端／本機共同基準提交：`ccf4054 Add information organization course structure`
- GitHub Pages 的 Source 已由使用者在 GitHub UI 設為 `GitHub Actions`。
- Workflow：`.github/workflows/deploy-pages.yml`
- 最新遠端 Actions 品質檢查成功：<https://github.com/HRD819/m8q2-resource-hub-2609/actions/runs/33845375973>
- Workflow 目前有發布保護：一般 push 只執行品質檢查；只有手動執行，或 repository variable `PUBLISH_PAGES=true`，才會部署 Pages。
- 尚未開啟自動發布，也尚未產生正式 Pages 網址。未取得使用者確認前，不要設定 `PUBLISH_PAGES=true`。

## 正式架構與檔案責任

### 內容的唯一來源

- 全站設定：`content/site.json`
- 課程設定：`content/courses/<course-slug>/course.json`
- 單元與教材：`content/courses/<course-slug>/unit-XX.json`
- 真實教材檔案：只放 Dropbox，不可加入 repository。

### 畫面產生與驗證

- 主要頁面產生器：`scripts/build.mjs`
- 共用 HTML layout：`scripts/lib/render.mjs`
- Content schema／URL 驗證：`scripts/lib/content.mjs`
- Production HTML 檢查：`scripts/check-site.mjs`
- 自動測試：`test/content.test.mjs`
- 建置輸出：`dist/`，已被 `.gitignore` 排除，不是 source of truth。

### 舊 Demo 的定位

`accessible_course_demo_v2/` 是早期版面與語意結構參考，不是 production source，也不會由 GitHub Pages workflow 部署。可參考它的簡潔版面、skip link 與 focus 呈現，但不要直接把該資料夾設為 Pages 發布來源。

## 目前尚未提交的重要工作

工作目錄不是乾淨狀態。已存在大量較新內容與程式修改，包含：

- 兩門課擴充為共 16 個單元。
- 共 44 項教材，部分已有 Dropbox 個別 `dl=1` 連結，部分維持 `planned`。
- 課程教科書、TronClass 聲明、教材說明。
- 參考資源作業／學習活動 schema 與呈現。
- `README.md`、`IMPLEMENTATION_PLAN.md`、測試及 `交接記錄檔.md` 更新。
- 新增 `content/courses/1151-reference-resources/unit-03.json` 至 `unit-08.json`。

接手時不得執行 `git reset --hard`、`git checkout --`、任意 stash 或覆蓋整批檔案。先執行 `git status` 與 `git diff`，把這些修改視為待整合成果。

## 最近一次本機驗證

2026-09-04 已對目前未提交版本執行：

```text
npm run ci
```

結果：

- Content validation：2 門課程、16 個單元、44 項教材。
- Node tests：4/4 通過。
- Production build：19 個 HTML 頁面。
- Site checks：19 頁通過 `noindex`、landmarks、heading、link、focus 與 responsive 規則檢查。

以上是結構與自動檢查結果，不等同已完成 NVDA、鍵盤、Lighthouse、axe 或人工視覺驗收。

## 把已做好網頁接入的正確方式

1. 先確認已做好版本包含哪些內容：視覺樣式、頁面結構、元件、文字內容或互動。
2. 課程、單元、教材、教科書與作業文字要映射到 `content/*.json`，不要 hard-code 進 HTML template。
3. 共用頁首、導覽、麵包屑、頁尾與 metadata 放在 `scripts/lib/render.mjs` 或適合的共用 renderer。
4. 首頁、課程頁、單元頁的呈現邏輯放在 `scripts/build.mjs`；不可只產生目前兩門課的硬編碼頁面。
5. CSS 可移植已做好版本的設計，但必須保留可見 focus、足夠對比、responsive、skip link、reduced motion 與鍵盤操作。
6. 核心課程／教材導覽不得依賴 JavaScript；優先使用 semantic HTML 與 progressive enhancement。
7. 每一個 production HTML 都必須保留：

   ```html
   <meta name="robots" content="noindex, nofollow">
   ```

8. 所有教材下載連結必須來自 Dropbox 個別分享網址；不要複製教材檔案，也不要用整個 Dropbox 共用資料夾網址代替。
9. 若改 schema、目錄或維護流程，同步更新 `README.md`；重大架構決策寫入 `DECISIONS.md`。
10. 完成後執行 `npm run ci`，再做鍵盤、NVDA + Chrome、responsive、axe／Lighthouse 與 HTML validator 驗收。

## Git 與第一次發布流程

整合完成且檢查通過後：

1. 再次檢查 `git diff`，確認沒有加入教材實體檔、Cookie、瀏覽器 profile、憑證、`dist/` 或測試截圖。
2. 建立一個描述整合內容的 commit。
3. Push 到 `main`，確認 GitHub Actions 的「品質檢查」成功。
4. 第一次發布前向使用者展示本機預覽與驗收結果。
5. 取得使用者同意後，第一次建議從 Actions 手動執行 workflow。
6. 驗證正式 Pages URL、repository base path、所有內部連結與所有頁面的 `noindex`。
7. 只有使用者決定後續每次 push 都自動發布時，才新增 `PUBLISH_PAGES=true`。

## 仍待處理

- 先確認「已做好的一版」實際放在哪個資料夾／分支／外部檔案，並做逐頁 mapping。
- `1-06 英美編目規則` 及參考資源部分單元仍有 `planned` 教材。
- 部分單元正式說明、作業資料及 Dropbox 個別連結仍待補。
- 正式發布前必須完成 `ACCESSIBILITY_TESTING.md` 的人工鍵盤與 NVDA + Chrome 流程。
- 仍需執行 axe、Lighthouse Accessibility、HTML validator 與多寬度視覺 QA。

## 完成定義

「接上」不是把另一版 HTML 複製到 GitHub。完成時必須同時做到：

- 已做好版本的設計正確移植到產生器。
- 內容仍由 `content/` 維護。
- Dropbox 仍是教材唯一來源。
- 19 個以上 production 頁面可由建置重現。
- `npm run ci` 通過。
- 無障礙與 `noindex` 不退步。
- GitHub Actions 通過後才部署。
- 正式 URL 與 Pages base path 已驗證。

