# Accessibility manual test checklist

自動檢查通過後，仍需以本清單完成人工驗收。記錄測試日期、瀏覽器版本、NVDA 版本、結果與發現。

## Keyboard-only

1. 建置並啟動預覽：`npm run build`、`npm run serve`。
2. 開啟首頁後不使用滑鼠，按 Tab。
3. 確認第一個焦點是「跳至主要內容」，且焦點樣式清楚可見。
4. 按 Enter，確認焦點進入主要內容。
5. 以 Tab 與 Shift+Tab 走過主要導覽、課程連結、單元連結與教材連結。
6. 確認每個焦點都可見，無焦點陷阱，順序與視覺及閱讀順序一致。
7. 以 Enter 依序開啟「1151 資訊組織」、「第 0 單元」與示範 Dropbox 連結。
8. 確認連結不會未經說明強制開新視窗。

## NVDA + Chrome critical flow

1. 在 Windows 啟動 NVDA 與 Chrome，進入首頁。
2. 確認頁面 title、網站 `h1` 與用途可被正確朗讀。
3. 以 landmark 導覽確認 header、navigation、main 與 footer 均可辨識。
4. 以標題導覽找到「課程」，並開啟「1151 資訊組織」。
5. 找到「第 0 單元」並進入。
6. 以標題導覽找到「教材下載」。
7. 開啟 NVDA Links List（NVDA+F7），確認教材連結在脫離上下文時仍可辨識課程、單元、教材名稱與格式。
8. 在開啟 Dropbox 前，確認頁面已朗讀教材用途、格式、示範狀態與注意事項。
9. 開啟 Dropbox 連結，再返回課程網站，確認全流程不需滑鼠。

## Responsive and visual

至少檢查 320、390、768 與 1440 CSS pixel 寬度：

- 無水平捲動才能讀取的主要內容。
- 標題、breadcrumb、metadata 與 Dropbox 連結不被裁切或重疊。
- 焦點框不被邊界或 sticky 元素遮蔽。
- 放大至 200% 時核心功能仍可用。
- 不靠顏色或 hover 才能理解示範狀態與連結。

## Automated tool follow-up

正式上線前，對首頁、一個課程頁與一個含正式教材的單元頁各執行：

- axe DevTools 或同等 axe-core 檢查
- Lighthouse Accessibility
- HTML validator

將所有錯誤與高影響警告修正後，重跑 `npm run ci` 與本清單。
