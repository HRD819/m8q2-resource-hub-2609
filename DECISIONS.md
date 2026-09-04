# DECISIONS.md

# Architecture Decision Log

本檔案用於記錄會影響長期維護的重要技術決策。

## ADR-001 — Dropbox as teaching-file source of truth

**Status:** Accepted

實際教材檔案維持在 Dropbox。網站 repository 不保存教材副本，只保存結構化 metadata、說明與 Dropbox 分享連結。

**Reason:** 教師既有工作流程以 Dropbox 為核心，避免形成第二套教材來源與版本混亂。

## ADR-002 — Accessibility-first

**Status:** Accepted

全盲學生使用 Windows + Chrome + NVDA、完全鍵盤操作，是核心驗收情境。目標至少 WCAG 2.2 AA。

## ADR-003 — Content-driven static architecture

**Status:** Accepted in principle; implementation technology to be selected by Codex after repository audit.

偏好 static site generator + Markdown/YAML 等結構化內容。避免不必要 SPA、CMS、資料庫與大型 client-side framework。

## ADR-004 — Course numbering

**Status:** Accepted

目前正式課程為：
- 1151 資訊組織
- 1151 參考資源

兩門課均從「第 0 單元」開始，第 0 單元是正式單元。

## ADR-005 — GitHub Pages deployment

**Status:** Accepted

正式網站預設部署到 GitHub Pages，使用 GitHub Actions 進行自動 build / checks / deployment。

**Reason:** 本網站為靜態教材導覽站，不需要資料庫或應用伺服器；GitHub Pages 足以支援需求，且利於版本控制與自動化。

## ADR-006 — Low-discoverability instead of authentication

**Status:** Accepted

網站資料不是機密。目前不要求登入或密碼，只希望不被搜尋引擎收錄、也不主動公開曝光。

因此採：
- direct-link sharing
- `noindex, nofollow`
- 不主動公開連結
- 不以 obscurity 當成安全保證

若未來改成「只有指定本人可存取」，必須重新評估真正的 access control，不可把 noindex 當安全機制。

## ADR-007 — noindex policy

**Status:** Accepted

所有 production HTML 頁面必須包含：

`<meta name="robots" content="noindex, nofollow">`

不得只使用 `robots.txt Disallow: /` 代替。

---

後續重大決策請以 ADR-008、ADR-009… 繼續記錄，不要覆蓋既有決策歷史。

## ADR-008 — Zero-dependency Node.js static generator

**Status:** Accepted

使用 Node.js 標準庫建立專案內靜態網站產生器，不引入 SPA framework、CMS、資料庫或瀏覽器端執行相依。課程、單元與教材以 JSON 結構化檔案維護，建置後產生語意化 HTML。

**Reason:**

- 零第三方執行相依，降低教師長期維護與 GitHub Actions 建置成本。
- 輸出為可直接瀏覽的 HTML，核心課程與教材導覽不需 JavaScript。
- JSON 可用 Node.js 標準庫嚴格剖析，並在建置前驗證 schema、Dropbox URL 與內容完整性。
- 所有網址使用相對路徑，同時支援 GitHub Pages project site 的 repository base path 與本機預覽。

## ADR-009 — Demonstration material links

**Status:** Accepted for MVP placeholders

在未取得正式教材 Dropbox 分享連結前，只在兩門課的第 0 單元放置清楚標示為「示範／待替換」的 Dropbox 連結，用於驗證鍵盤、螢幕閱讀器與外部連結流程。示範項目不得被描述為正式教材，也不得在 repository 內加入教材檔案。
