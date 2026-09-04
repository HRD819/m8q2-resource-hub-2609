# Content data

這個目錄是網站內容的單一來源，只放課程、單元、教材與補充資源的結構化 metadata，不放實際教材檔案。實際教材繼續以 Dropbox 為唯一來源。

- `site.json`：全站名稱、用途、使用方式與首頁聲明。
- `courses/<slug>/course.json`：課程 metadata。
- `courses/<slug>/unit-XX.json`：單元說明、教材與補充資料。

請先參考 repository 根目錄 `README.md` 的完整 schema 與維護流程。修改後必須執行 `npm run ci`，不要直接編輯 `dist/` 內的 HTML。
