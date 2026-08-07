## 注意事項

- 不管輸入是英文或中文，所有回覆與程式碼註解請統一使用繁體中文回覆
- `backend/` 資料夾內的專案皆為 Python 專案，且每一個子資料夾都是獨立的小專案，請勿跨資料夾引用程式碼
- `backend/iris-predict-service/` 為真正要部署的服務，擁有獨立的 `requirements.txt`，請勿與最外層的依賴混用
- 本專案無自動化測試與 CI 流程，修改前端請以 `npm run lint` 和 `npm run build` 驗證，修改後端請手動測試 `/predict` 與 `/train` 端點

## 專案架構

- 根目錄：使用 `uv` 管理 Python 3.12 虛擬環境，僅供 Notebook 與草稿腳本使用
- `backend/iris-predict-service/`：FastAPI + Gradio 後端服務，提供 `/predict`、`/train`、`/docs` 與 Gradio UI，已部署至 Render
- `frontend/iris/`：React 19 + Vite + Tailwind 4 + TypeScript 的前端單頁應用程式（SPA）
- `backend/<日期>*/`：課堂獨立練習資料夾，非部署服務的一部分

## 常用指令

- 後端服務啟動：於 `backend/iris-predict-service` 執行 `python app.py`（需先安裝 `requirements.txt`）
- 前端開發：於 `frontend/iris` 執行 `npm run dev`（打包：`npm run build` / 檢查：`npm run lint`）
- 根目錄環境：執行 `uv sync` 或 `uv run <腳本>`

## 後端防呆與坑點 (Gotchas)

- `app.py` 中的 `demo.theme` 必須保留底部的 `theme_css` / `stylesheets` / `theme_hash` 區塊，否則介面樣式會失效（500 錯誤），切勿簡化
- Gradio 事件處理器已設定 `queue=False` 與 `show_progress` 以避開 Render 的 SSE 緩衝機制，請勿改回 `queue=True`
- 重新訓練模型會覆蓋 `iris_model.joblib`，訓練後必須呼叫 `load_model_state()` 重新載入全域模型狀態

## 前端防呆與坑點 (Frontend)

- `vite.config.ts` 中的開發代理預設指向 Render 雲端後端，若要在本地測試請將代理改為 `http://localhost:8000`
- 所有 UI 介面文字標籤皆需使用繁體中文