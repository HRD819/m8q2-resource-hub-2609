# SPEC.md
# 無障礙課程教材平台－正式開發規格

> 本文件是本專案的權威需求規格（authoritative specification）。
> 若 README、現有 Demo、程式碼、註解或實作慣例與本文件衝突，除非使用者另有明確指示，應以本文件為準。

## 1. 專案目的

建立一個「課程教材導覽與取得平台」，讓學生能依課程、單元理解教材用途並前往 Dropbox 取得教材。

目前正式課程：
1. `1151 資訊組織`
2. `1151 參考資源`

兩門課的內容都必須從「第 0 單元」開始。第 0 單元是正式單元，不是附錄或特殊頁。

本平台目前只打算將網址提供給一位學生使用。資料不是機密，但不希望網站被搜尋引擎收錄或一般使用者隨意發現。

本平台未來會持續增加不同學期與課程，因此架構不得只針對目前兩門課硬編碼。

## 2. 三項最高優先原則

### 2.1 Accessibility First
本網站有全盲學生使用。核心驗收情境是：使用 Windows、Chrome、NVDA，完全不用滑鼠，也能獨立從首頁找到指定課程、指定單元、指定教材，理解教材內容與格式，並開啟 Dropbox 教材連結。

無障礙不是事後補強功能，而是架構與 UI 的第一優先條件。

### 2.2 Dropbox 是教材唯一來源
教師平常以 Dropbox 管理教材。不得要求教師把教材複製、搬移或重新上傳至 Google Drive、網站主機、CMS 或其他第二套教材儲存系統。

網站只保存：
- 課程與單元結構
- 教材標題與說明
- 檔案格式等 metadata
- Dropbox 分享連結
- 更新日期／更新紀錄

實際教材檔案仍以 Dropbox 為 single source of truth。

### 2.3 Teacher Maintenance First
教師不應為新增或更新一份教材而手動修改 HTML。

應讓內容與 presentation 分離。未來教師可以用自然語言告訴 Codex，例如：

> 把這個 Dropbox 教材加入 1151 資訊組織第 5 單元。

Codex 應能修改結構化內容檔、驗證資料、重新建置網站，而不必手工改產出的 HTML。

## 3. 發佈與可見性策略

正式發佈預設採：

- GitHub repository 管理原始碼
- GitHub Actions 自動建置與部署
- GitHub Pages 作為正式網站
- 網站不設登入、不設密碼
- 網站採「unlisted / low-discoverability」策略
- 網址只直接提供給該學生
- 不主動在其他公開頁面刊登或連結

注意：
這不是存取控制。只要知道網址的人，原則上仍可開啟網站。

此策略符合目前需求：
「資料不是機密，但不希望被搜尋或隨便發現。」

### 3.1 必須 noindex
每一個可公開瀏覽頁面都必須包含：

```html
<meta name="robots" content="noindex, nofollow">
```

如果部署技術可穩定設定 HTTP header，也可補：

```text
X-Robots-Tag: noindex, nofollow
```

但 HTML meta `noindex` 仍應存在，除非有充分理由並在 `DECISIONS.md` 記錄。

### 3.2 不得只靠 robots.txt
不得把：

```text
User-agent: *
Disallow: /
```

當作 noindex 的替代方案。

若需要 robots.txt，可作為補充，但不能阻止搜尋引擎讀取頁面中的 `noindex`。

### 3.3 網址低可猜性
Repository / site slug 不要刻意使用非常容易被一般人猜中的名稱。可使用相對不直觀但仍可維護的 slug。

不可把 obscurity 當成安全機制；它只用於降低偶然發現機率。

## 4. 資訊架構

概念模型：

學期
→ 課程
→ 單元
→ 教材／補充資源

目前首頁至少包含：
- 網站名稱與用途
- 使用方式
- 最近更新
- `1151 資訊組織`
- `1151 參考資源`

課程內：
- 第 0 單元
- 第 1 單元
- 第 2 單元
- ……

未來需能擴充 `1152`、`1161`、`1162` 等學期及其他課程。

## 5. 建議 URL

URL 應穩定、可理解，例如：

- `/`
- `/1151-information-organization/`
- `/1151-information-organization/unit-00/`
- `/1151-information-organization/unit-01/`
- `/1151-reference-resources/`
- `/1151-reference-resources/unit-00/`

避免以無意義 query/id 作為主要導覽方式，例如 `?page=123`、`?id=456`。

## 6. 每個單元的固定結構

所有課程應使用一致資訊順序，降低螢幕閱讀器使用者重新學習介面的成本：

1. 單元名稱
2. 單元說明
3. 教材下載
4. 補充資料（若有）

教材項目至少顯示：
- 教材名稱
- 簡短用途／內容說明
- 檔案格式
- Dropbox 連結
- 更新日期（若有）
- 注意事項（optional）

連結文字必須在脫離上下文時仍有意義，例如：

`下載第 2 單元編目規則講義 PDF`

不得使用只有「點這裡」、「下載」、「檔案」等模糊文字的連結。

## 7. 內容資料模型

不得把全部教材資訊直接 hard-code 到 template 或產出 HTML。

優先採容易由人與 Codex 維護的 Markdown + YAML/front matter、YAML 或其他簡單文字格式。

建議教材欄位：

```yaml
title: 資訊組織第 3 單元講義
description: 本週課程使用的主要講義。
file_type: PDF
dropbox_url: https://...
updated: 2026-09-04
note: 建議上課前下載
```

`note` 可省略。

應建立 schema/validation，避免漏掉必要欄位或錯誤 URL。

## 8. 建議內容目錄

實際技術可依選定 static site generator 調整，但必須保持「內容資料與 template 分離」：

```text
content/
  courses/
    1151-information-organization/
      course.yml
      unit-00.md
      unit-01.md
      unit-02.md
    1151-reference-resources/
      course.yml
      unit-00.md
      unit-01.md
      unit-02.md
```

不得將「目前只有兩門課」當成程式邏輯前提。

## 9. 最近更新

首頁應有「最近更新」。

理想上由教材／單元資料中的日期自動產生，不要要求教師同一筆更新手動維護兩次。

更新項目至少能辨識：
- 日期
- 課程
- 單元
- 新增／更新的教材

## 10. 無障礙要求

目標：至少 WCAG 2.2 Level AA。

### 10.1 Semantic HTML
優先使用原生元素：
- `header`
- `nav`
- `main`
- `section`
- `footer`
- `h1`–`h6`
- `ul` / `ol`
- `a`
- `button`

不要用大量 `div + JavaScript` 模擬原生控制元件。

### 10.2 Heading hierarchy
標題層級必須合理且一致。不可為了字體大小選錯 heading level。

### 10.3 Landmarks
頁面至少應有合理的 header/nav/main/footer landmarks。

### 10.4 Skip link
每頁應提供可由鍵盤操作的「跳至主要內容」連結。

### 10.5 Keyboard
核心功能必須完全不用滑鼠：
- Tab
- Shift+Tab
- Enter
- Space（適用元件）

Focus indicator 必須清楚可見。不可直接移除 `outline` 而沒有更好的替代。

### 10.6 ARIA
遵守「No ARIA is better than bad ARIA」。
原生 HTML 能解決時不要額外堆疊 ARIA。

### 10.7 Link text
使用螢幕閱讀器 Links List 時，每個教材連結仍應可理解。

### 10.8 Visual accessibility
- 足夠對比
- 清楚字體與字級
- 足夠行距與 spacing
- responsive
- 手機與桌機可用
- 不以顏色作為唯一訊息來源
- 不使用 hover-only information
- 避免不必要動畫、自動輪播、modal、複雜下拉選單

### 10.9 Progressive enhancement
核心課程導覽、教材說明與 Dropbox 連結不應依賴大型 client-side JavaScript 才能使用。

## 11. 螢幕閱讀器測試

Windows 優先測試 `NVDA + Chrome`。

至少驗證：
1. 從首頁辨識網站用途。
2. 透過 landmarks/headings 找到課程。
3. 進入 `1151 資訊組織`。
4. 找到 `第 0 單元`。
5. 透過 heading navigation 找到「教材下載」。
6. 透過 Links List 能辨識教材名稱與格式。
7. 開啟 Dropbox 教材連結。
8. 返回課程網站。
9. 全流程不需滑鼠。

Dropbox 分享頁本身的 accessibility 不完全由本專案控制，因此在使用者離開本站前，本站必須已清楚說明教材名稱、格式、用途與必要注意事項。

## 12. 技術選型

優先採：
- static site generator
- Markdown/YAML structured content
- semantic HTML
- 少量必要 JavaScript
- 易部署、易維護

可評估 MkDocs、Astro、Eleventy、Hugo 或其他合適方案。

選擇優先順序：
1. Accessibility
2. 教師維護容易
3. Markdown/YAML 內容管理容易
4. Codex 容易安全修改
5. 部署簡單
6. 效能
7. 視覺效果

不要為技術炫技導入大型 SPA、資料庫、CMS 或不必要框架。

## 13. 自動部署流程

正式部署流程應為：

```text
Codex 修改內容
→ 執行 validation / build / accessibility checks
→ git commit
→ git push
→ GitHub Actions
→ checks/build 成功
→ GitHub Pages 自動發布
```

不得把「人工 FTP 上傳 HTML」設計成主要維護方式。

若自動檢查失敗，production deployment 應停止，不發布壞版本。

## 14. MVP

第一階段至少實作：

首頁：
- 課程列表
- 使用方式
- 最近更新

`1151 資訊組織`：
- 第 0 單元
- 第 1 單元
- 第 2 單元

`1151 參考資源`：
- 第 0 單元
- 第 1 單元
- 第 2 單元

並具備：
- Dropbox 示範連結／可替換真實連結
- 單元說明
- 教材說明
- Responsive layout
- Skip link
- Semantic HTML
- Keyboard navigation
- Accessibility checks
- 結構化內容資料
- 清楚 README
- 所有公開頁面帶 noindex
- GitHub Actions 自動部署 GitHub Pages
- 部署前 checks/build gate

第一階段不要加入：
- 登入
- 會員
- 密碼驗證
- 資料庫
- 留言
- 複雜全文搜尋
- CMS
- 大型 SPA framework

搜尋可以留作未來擴充，但目前架構不得阻礙後續增加 accessible search。

## 15. 自動與人工 accessibility QA

開發後至少執行：
- HTML semantics / validity 檢查
- heading hierarchy
- keyboard-only test
- focus visibility
- link text
- color contrast
- responsive checks
- axe-core/axe DevTools 或同等自動檢測
- Lighthouse Accessibility 或同等檢測

自動工具通過不代表完成，仍需保留人工 keyboard / screen-reader checklist。

另外必須檢查：
- 每個公開頁面是否有 `noindex, nofollow`
- production build 是否真的保留 noindex
- GitHub Pages 路徑/base path 是否正確
- 任何自動產生的 sitemap / feed 是否符合 low-discoverability 原則

## 16. Sitemap / feed 原則

目前沒有 SEO 需求。

若選用的框架預設產生 sitemap、RSS/Atom feed、SEO metadata 或公開索引功能，Codex 應評估並預設停用非必要項目。

不要主動提交 sitemap 到搜尋引擎。

## 17. README 必須包含

- Project overview
- Requirements
- Development
- Build
- Deploy
- GitHub Pages setup
- GitHub Actions deployment flow
- Folder structure
- Add a course
- Add a unit
- Add teaching material
- Add/update Dropbox link
- Content schema
- Accessibility requirements
- Accessibility testing
- noindex / low-discoverability policy
- Maintenance workflow

目標：半年或下一學期重新打開專案仍能迅速接手。

## 18. 最終驗收情境

以下流程若不順暢，MVP 不得視為完成：

> 一位全盲學生第一次進入網站，使用 Windows + Chrome + NVDA，完全不用滑鼠，能找到「1151 資訊組織 → 第 0 單元 → 教材下載 → 指定教材」，清楚知道教材用途與格式，並開啟 Dropbox 教材連結。

另外 production 網站必須：
- 可由直接網址正常開啟
- 不要求登入
- 每頁有 noindex
- 不主動公開曝光
- GitHub Actions build/check 成功後才部署

視覺美觀不得凌駕上述驗收條件。
