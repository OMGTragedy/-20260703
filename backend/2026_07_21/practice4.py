from datetime import datetime
import gradio as gr
import pandas as pd
import plotly.graph_objects as go
from requests import Response, HTTPError as ReqHTTPError
import requests


def fetch_yahoo_chart(symbol: str, period: str) -> dict:
  url = f"https://query1.finance.yahoo.com/v8/finance/chart/{symbol}?interval=1d&range={period}"
  headers = {"User-Agent": "Mozilla/5.0"}
  r: Response = requests.get(url, headers=headers, timeout=10)
  r.raise_for_status()
  data = r.json()
  return data["chart"]["result"][0]


def build_quote_info(result: dict) -> str:
  meta = result["meta"]
  indicators = result["indicators"]["quote"][0]
  price = meta.get("regularMarketPrice", 0)
  change = meta.get("regularMarketChange", 0)
  change_pct = meta.get("regularMarketChangePercent", 0)
  volume = meta.get("regularMarketVolume", 0)
  market_cap = meta.get("regularMarketCap", 0)
  year_high = meta.get("fiftyTwoWeekHigh", 0)
  year_low = meta.get("fiftyTwoWeekLow", 0)
  day_high = max(indicators["high"]) if indicators["high"] else 0
  day_low = min(indicators["low"]) if indicators["low"] else 0

  arrow = "▲" if change > 0 else ("▼" if change < 0 else "─")
  color = "#f87171" if change > 0 else ("#34d399" if change < 0 else "#fbbf24")

  info = f"""
### {meta.get('shortName', meta['symbol'])} ({meta['symbol']})

| 項目 | 數值 |
|------|------|
| 目前價格 | **{price} {meta.get('currency', 'TWD')}** |
| 漲跌 | <span style="color:{color}">{arrow} {change:+.2f} ({change_pct:+.2f}%)</span> |
| 今日最高 | {day_high} |
| 今日最低 | {day_low} |
| 成交量 | {volume:,} |
| 市值 | {market_cap:,.0f} |
| 52 週高 | {year_high} |
| 52 週低 | {year_low} |
"""
  return info


def build_charts(result: dict) -> go.Figure:
  timestamps = result["timestamp"]
  indicators = result["indicators"]["quote"][0]

  dates = [datetime.fromtimestamp(ts).strftime("%Y-%m-%d") for ts in timestamps]
  closes = [round(c, 2) if c else 0 for c in indicators["close"]]
  highs = [round(h, 2) if h else 0 for h in indicators["high"]]
  lows = [round(l, 2) if l else 0 for l in indicators["low"]]

  fig = go.Figure()

  fig.add_trace(
      go.Scatter(
          x=dates,
          y=closes,
          name="收盤價",
          line=dict(color="#a78bfa", width=2),
          fill="tozeroy",
          fillcolor="rgba(167,139,250,0.08)",
      )
  )
  fig.add_trace(
      go.Scatter(
          x=dates,
          y=highs,
          name="最高價",
          line=dict(color="rgba(248,113,113,0.5)", width=1, dash="dot"),
      )
  )
  fig.add_trace(
      go.Scatter(
          x=dates,
          y=lows,
          name="最低價",
          line=dict(color="rgba(52,211,153,0.5)", width=1, dash="dot"),
      )
  )

  fig.update_layout(
      title="股價走勢圖",
      template="plotly_dark",
      paper_bgcolor="#1a1a2e",
      plot_bgcolor="#1a1a2e",
      font=dict(color="#e0e0e0"),
      xaxis=dict(gridcolor="rgba(255,255,255,0.05)"),
      yaxis=dict(gridcolor="rgba(255,255,255,0.08)"),
      legend=dict(
          orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1
      ),
      height=400,
      margin=dict(l=40, r=20, t=50, b=40),
  )

  return fig


def build_volume_chart(result: dict) -> go.Figure:
  timestamps = result["timestamp"]
  indicators = result["indicators"]["quote"][0]

  dates = [datetime.fromtimestamp(ts).strftime("%Y-%m-%d") for ts in timestamps]
  closes = [round(c, 2) if c else 0 for c in indicators["close"]]
  volumes = [v or 0 for v in indicators["volume"]]

  colors = [
      "#f87171"
      if closes[i] >= closes[i - 1]
      else ("#34d399" if i > 0 and closes[i - 1] else "#a78bfa")
      for i in range(len(closes))
  ]

  fig = go.Figure()
  fig.add_trace(
      go.Bar(
          x=dates,
          y=volumes,
          name="成交量",
          marker_color=colors,
      )
  )

  fig.update_layout(
      title="成交量",
      template="plotly_dark",
      paper_bgcolor="#1a1a2e",
      plot_bgcolor="#1a1a2e",
      font=dict(color="#e0e0e0"),
      xaxis=dict(gridcolor="rgba(255,255,255,0.05)"),
      yaxis=dict(gridcolor="rgba(255,255,255,0.08)"),
      height=300,
      margin=dict(l=40, r=20, t=50, b=40),
  )

  return fig


def build_table(result: dict) -> pd.DataFrame:
  timestamps = result["timestamp"]
  indicators = result["indicators"]["quote"][0]

  rows = []
  for i, ts in enumerate(timestamps):
    dt = datetime.fromtimestamp(ts)
    rows.append({
        "日期": dt.strftime("%Y-%m-%d"),
        "開盤": (
            round(indicators["open"][i], 2) if indicators["open"][i] else 0
        ),
        "最高": (
            round(indicators["high"][i], 2) if indicators["high"][i] else 0
        ),
        "最低": round(indicators["low"][i], 2) if indicators["low"][i] else 0,
        "收盤": (
            round(indicators["close"][i], 2) if indicators["close"][i] else 0
        ),
        "成交量": indicators["volume"][i] or 0,
    })

  return pd.DataFrame(rows)


def query_stock(symbol: str, period: str):
  symbol = symbol.strip().upper()
  if not symbol:
    return "請輸入股票代碼", None, None, pd.DataFrame()

  try:
    result = fetch_yahoo_chart(symbol, period)
    quote_info = build_quote_info(result)
    price_chart = build_charts(result)
    vol_chart = build_volume_chart(result)
    table = build_table(result)
    return quote_info, price_chart, vol_chart, table
  except ReqHTTPError as e:
    error_msg = f"### 錯誤\n\nYahoo Finance API 回應異常：{e}"
    return error_msg, None, None, pd.DataFrame()
  except Exception as e:
    error_msg = f"### 錯誤\n\n查詢失敗：{e}"
    return error_msg, None, None, pd.DataFrame()


with gr.Blocks(title="台灣股市查詢") as demo:
  gr.Markdown("# 台灣股市查詢\n資料來源：Yahoo Finance", elem_classes=["gr-title"])

  with gr.Row():
    symbol_input = gr.Textbox(
        label="股票代碼",
        value="2330.TW",
        placeholder="例: 2330.TW, 2317.TW, 2454.TW",
    )
    period_input = gr.Dropdown(
        label="時間範圍",
        choices=["1d", "5d", "7d", "1mo", "3mo", "6mo", "1y"],
        value="1mo",
    )
    query_btn = gr.Button("查詢", variant="primary", scale=1)

  with gr.Row():
    btn_tsmc = gr.Button("台積電 2330.TW", size="sm")
    btn_honhai = gr.Button("鴻海 2317.TW", size="sm")
    btn_mediatek = gr.Button("聯發科 2454.TW", size="sm")
    btn_delta = gr.Button("台達電 2308.TW", size="sm")
    btn_fubon = gr.Button("富邦金 2881.TW", size="sm")
    btn_cathay = gr.Button("國泰金 2882.TW", size="sm")

  quote_output = gr.Markdown()
  with gr.Row():
    price_plot = gr.Plot(label="股價走勢")
    volume_plot = gr.Plot(label="成交量")
  table_output = gr.Dataframe(label="歷史資料")

  # 綁定快速按鈕事件
  btn_tsmc.click(lambda: "2330.TW", outputs=symbol_input).then(
      query_stock,
      inputs=[symbol_input, period_input],
      outputs=[quote_output, price_plot, volume_plot, table_output],
  )
  btn_honhai.click(lambda: "2317.TW", outputs=symbol_input).then(
      query_stock,
      inputs=[symbol_input, period_input],
      outputs=[quote_output, price_plot, volume_plot, table_output],
  )
  btn_mediatek.click(lambda: "2454.TW", outputs=symbol_input).then(
      query_stock,
      inputs=[symbol_input, period_input],
      outputs=[quote_output, price_plot, volume_plot, table_output],
  )
  btn_delta.click(lambda: "2308.TW", outputs=symbol_input).then(
      query_stock,
      inputs=[symbol_input, period_input],
      outputs=[quote_output, price_plot, volume_plot, table_output],
  )
  btn_fubon.click(lambda: "2881.TW", outputs=symbol_input).then(
      query_stock,
      inputs=[symbol_input, period_input],
      outputs=[quote_output, price_plot, volume_plot, table_output],
  )
  btn_cathay.click(lambda: "2882.TW", outputs=symbol_input).then(
      query_stock,
      inputs=[symbol_input, period_input],
      outputs=[quote_output, price_plot, volume_plot, table_output],
  )

  # 綁定一般查詢按鈕與文字輸入框事件
  query_btn.click(
      query_stock,
      inputs=[symbol_input, period_input],
      outputs=[quote_output, price_plot, volume_plot, table_output],
  )

  symbol_input.submit(
      query_stock,
      inputs=[symbol_input, period_input],
      outputs=[quote_output, price_plot, volume_plot, table_output],
  )

if __name__ == "__main__":
    demo.launch(
        theme=gr.themes.Base(
            primary_hue="purple",
            neutral_hue="slate",
        ).set(
            body_background_fill="#0f0f23",
            block_background_fill="#1a1a2e",
            block_border_color="#2d2d5e",
        ),
    )