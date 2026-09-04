# IMPLEMENTATION_PLAN.md

# MVP Implementation Plan

本計畫依 `SPEC.md` 執行。若有衝突，以 `SPEC.md` 為準。

## Phase 0 — Repository audit
- [x] 閱讀 `AGENTS.md`
- [x] 閱讀 `SPEC.md`
- [ ] 檢查既有 Demo/程式碼
- [ ] 確認是否有值得保留的 semantic HTML/CSS
- [x] 檢查 Git / GitHub repository 狀態
- [x] 確認 GitHub Pages / Actions 可用條件
- [ ] 記錄重要架構決策至 `DECISIONS.md`

## Phase 1 — Architecture
- [ ] 選擇適合的 static site generator
- [ ] 說明選型理由，優先順序依 SPEC
- [ ] 建立 content-driven directory structure
- [ ] 定義 course/unit/material schema
- [ ] 建立 schema/content validation
- [ ] 確保未硬編碼目前兩門課
- [ ] 規劃 GitHub Pages base path

## Phase 2 — MVP content
- [ ] 1151 資訊組織
  - [ ] 第 0 單元
  - [ ] 第 1 單元
  - [ ] 第 2 單元
- [ ] 1151 參考資源
  - [ ] 第 0 單元
  - [ ] 第 1 單元
  - [ ] 第 2 單元
- [ ] 教材 placeholder / Dropbox 示範欄位
- [ ] 最近更新由 metadata 產生

## Phase 3 — Accessible UI
- [ ] Semantic landmarks
- [ ] 合理 heading hierarchy
- [ ] Skip-to-main-content
- [ ] Meaningful link text
- [ ] Visible focus
- [ ] Keyboard-only navigation
- [ ] Responsive layout
- [ ] Adequate contrast
- [ ] 不依賴 hover/color 傳遞資訊
- [ ] 核心流程不依賴 JavaScript

## Phase 4 — Low-discoverability
- [ ] 所有 production HTML 頁面包含 `noindex, nofollow`
- [ ] 驗證 production build 仍保留 noindex
- [ ] 不以 `robots.txt Disallow: /` 取代 noindex
- [ ] 停用非必要 sitemap
- [ ] 停用非必要 RSS/Atom feed
- [ ] 不加入不必要 SEO 功能

## Phase 5 — GitHub deployment
- [x] 建立 GitHub Actions workflow
- [ ] build/test/check 成功後才 deploy
- [ ] 部署到 GitHub Pages
- [ ] 驗證 Pages base path
- [x] README 記錄一次性 GitHub Pages 設定
- [ ] 驗證正式網址可由直接連結開啟

## Phase 6 — Quality assurance
- [ ] Production build 成功
- [ ] Content/schema validation
- [ ] Link validation
- [ ] Accessibility automated check
- [ ] Lighthouse/同等檢查
- [ ] noindex verification
- [ ] Manual keyboard checklist
- [ ] NVDA + Chrome manual test instructions

## Phase 7 — Documentation
- [ ] 補齊 README 開發方式
- [ ] 補齊 GitHub Pages 部署方式
- [ ] 寫明新增課程流程
- [ ] 寫明新增單元流程
- [ ] 寫明新增教材／Dropbox link 流程
- [ ] 寫明 accessibility QA 流程
- [ ] 寫明 noindex / low-discoverability policy
- [ ] 更新 `DECISIONS.md`

## MVP acceptance

MVP 必須同時符合：

1. `SPEC.md` 的全盲學生驗收情境。
2. production 網站所有頁面 noindex。
3. 無登入、無密碼。
4. GitHub Actions checks/build 成功後才部署。
5. GitHub Pages 可由直接網址正常使用。
