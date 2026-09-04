# IMPLEMENTATION_PLAN.md

# MVP Implementation Plan

本計畫依 `SPEC.md` 執行。若有衝突，以 `SPEC.md` 為準。

## Phase 0 — Repository audit
- [x] 閱讀 `AGENTS.md`
- [x] 閱讀 `SPEC.md`
- [x] 檢查既有 Demo/程式碼
- [x] 確認是否有值得保留的 semantic HTML/CSS
- [x] 檢查 Git / GitHub repository 狀態
- [x] 確認 GitHub Pages / Actions 可用條件
- [x] 記錄重要架構決策至 `DECISIONS.md`

## Phase 1 — Architecture
- [x] 選擇適合的 static site generator
- [x] 說明選型理由，優先順序依 SPEC
- [x] 建立 content-driven directory structure
- [x] 定義 course/unit/material schema
- [x] 建立 schema/content validation
- [x] 確保未硬編碼目前兩門課
- [x] 規劃 GitHub Pages base path（使用相對連結）

## Phase 2 — MVP content
- [x] 1151 資訊組織
  - [x] 第 0 單元
  - [x] 第 1 單元
  - [x] 第 2 單元
  - [x] 第 3 單元
  - [x] 第 4 單元
  - [x] 第 5 單元
  - [x] 第 6 單元
- [x] 1151 參考資源
  - [x] 第 0 單元
  - [x] 第 1 單元
  - [x] 第 2 單元
  - [x] 第 3 單元
  - [x] 第 4 單元
  - [x] 第 5 單元
  - [x] 第 6 單元
  - [x] 第 7 單元
  - [x] 第 8 單元
- [x] 教材 placeholder / Dropbox 示範欄位
- [x] 最近更新由 metadata 產生

## Phase 3 — Accessible UI
- [x] Semantic landmarks
- [x] 合理 heading hierarchy
- [x] Skip-to-main-content
- [x] Meaningful link text
- [x] Visible focus（CSS 與自動檢查）
- [ ] Keyboard-only navigation
- [x] Responsive layout（CSS 已實作；仍待多寬度人工視覺檢查）
- [x] Adequate contrast（主要色彩自動計算至少 4.5:1）
- [x] 不依賴 hover/color 傳遞資訊
- [x] 核心流程不依賴 JavaScript

## Phase 4 — Low-discoverability
- [x] 所有 production HTML 頁面包含 `noindex, nofollow`
- [x] 驗證 production build 仍保留 noindex
- [x] 不以 `robots.txt Disallow: /` 取代 noindex
- [x] 停用非必要 sitemap
- [x] 停用非必要 RSS/Atom feed
- [x] 不加入不必要 SEO 功能

## Phase 5 — GitHub deployment
- [x] 建立 GitHub Actions workflow
- [x] build/test/check 成功後才 deploy
- [ ] 部署到 GitHub Pages
- [x] 驗證 Pages base path（建置輸出使用可攜式相對路徑；仍待正式網址確認）
- [x] README 記錄一次性 GitHub Pages 設定
- [ ] 驗證正式網址可由直接連結開啟

## Phase 6 — Quality assurance
- [x] Production build 成功
- [x] Content/schema validation
- [ ] Link validation
- [x] Accessibility automated check（專案內語意、標題、focus、對比與路徑檢查）
- [ ] Lighthouse/同等檢查
- [x] noindex verification
- [ ] Manual keyboard checklist
- [x] NVDA + Chrome manual test instructions

## Phase 7 — Documentation
- [x] 補齊 README 開發方式
- [x] 補齊 GitHub Pages 部署方式
- [x] 寫明新增課程流程
- [x] 寫明新增單元流程
- [x] 寫明新增教材／Dropbox link 流程
- [x] 寫明 accessibility QA 流程
- [x] 寫明 noindex / low-discoverability policy
- [x] 更新 `DECISIONS.md`

## MVP acceptance

MVP 必須同時符合：

1. `SPEC.md` 的全盲學生驗收情境。
2. production 網站所有頁面 noindex。
3. 無登入、無密碼。
4. GitHub Actions checks/build 成功後才部署。
5. GitHub Pages 可由直接網址正常使用。
