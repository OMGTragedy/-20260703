import { useState } from 'react'
import { trainModel } from '../api/client'
import type { TrainResult } from '../api/types'

const IMPORTANCE_COLORS = ['#0d9488', '#6366f1', '#f59e0b', '#ec4899']

export default function TrainTab() {
  const [config, setConfig] = useState({
    n_estimators: 100,
    max_depth: 0,
    test_size: 0.2,
    random_state: 42,
  })
  const [result, setResult] = useState<TrainResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleTrain = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await trainModel({ ...config, max_depth: config.max_depth === 0 ? 0 : config.max_depth })
      setResult(res)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '訓練失敗')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
      {/* Left: Config */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/60">
        <h3 className="text-lg font-bold text-slate-800 mb-1">超參數設定</h3>
        <p className="text-sm text-slate-400 mb-5">調整隨機森林超參數後點擊訓練</p>

        <div className="space-y-5">
          <div>
            <div className="flex justify-between mb-1.5">
              <span className="text-sm font-semibold text-slate-700">決策樹數量 <span className="text-slate-400 font-normal">n_estimators</span></span>
              <span className="text-sm font-mono font-bold text-indigo-600">{config.n_estimators}</span>
            </div>
            <input type="range" min={10} max={500} step={10} value={config.n_estimators}
              onChange={(e) => setConfig({ ...config, n_estimators: +e.target.value })} className="w-full cursor-pointer" />
            <div className="flex justify-between text-xs text-slate-300 mt-0.5"><span>10</span><span>500</span></div>
          </div>

          <div>
            <div className="flex justify-between mb-1.5">
              <span className="text-sm font-semibold text-slate-700">最大深度 <span className="text-slate-400 font-normal">max_depth</span></span>
              <span className="text-sm font-mono font-bold text-indigo-600">{config.max_depth === 0 ? '無限制' : config.max_depth}</span>
            </div>
            <input type="range" min={0} max={20} step={1} value={config.max_depth}
              onChange={(e) => setConfig({ ...config, max_depth: +e.target.value })} className="w-full cursor-pointer" />
            <div className="flex justify-between text-xs text-slate-300 mt-0.5"><span>無限制</span><span>20</span></div>
          </div>

          <div>
            <div className="flex justify-between mb-1.5">
              <span className="text-sm font-semibold text-slate-700">測試集比例 <span className="text-slate-400 font-normal">test_size</span></span>
              <span className="text-sm font-mono font-bold text-indigo-600">{(config.test_size * 100).toFixed(0)}%</span>
            </div>
            <input type="range" min={0.1} max={0.5} step={0.05} value={config.test_size}
              onChange={(e) => setConfig({ ...config, test_size: +e.target.value })} className="w-full cursor-pointer" />
            <div className="flex justify-between text-xs text-slate-300 mt-0.5"><span>10%</span><span>50%</span></div>
          </div>

          <div>
            <div className="flex justify-between mb-1.5">
              <span className="text-sm font-semibold text-slate-700">隨機種子 <span className="text-slate-400 font-normal">random_state</span></span>
              <span className="text-sm font-mono font-bold text-indigo-600">{config.random_state}</span>
            </div>
            <input type="range" min={0} max={100} step={1} value={config.random_state}
              onChange={(e) => setConfig({ ...config, random_state: +e.target.value })} className="w-full cursor-pointer" />
            <div className="flex justify-between text-xs text-slate-300 mt-0.5"><span>0</span><span>100</span></div>
          </div>
        </div>

        <button
          onClick={handleTrain}
          disabled={loading}
          className="mt-6 w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98]"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
              訓練中...
            </span>
          ) : '🚀 開始訓練模型'}
        </button>

        {error && <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>}
      </div>

      {/* Right: Results */}
      <div className="space-y-5">
        {result ? (
          <>
            {/* Status Banner */}
            <div className={`rounded-2xl p-4 text-center font-bold text-sm tracking-wide ${result.status === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {result.status === 'success' ? '✅ 線上重新訓練並載入成功！' : result.message}
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center shadow-sm border border-white/60">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">準確度</div>
                <div className="text-2xl font-extrabold text-teal-600">{(result.accuracy * 100).toFixed(2)}%</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center shadow-sm border border-white/60">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">訓練耗時</div>
                <div className="text-2xl font-extrabold text-emerald-600">{result.train_time.toFixed(4)}s</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center shadow-sm border border-white/60">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">決策樹數量</div>
                <div className="text-2xl font-extrabold text-purple-600">{config.n_estimators}</div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-3 flex justify-between text-sm font-medium text-slate-600 border border-slate-100">
              <span>🌲 最大樹深度: <strong>{config.max_depth === 0 ? '無限制' : config.max_depth}</strong></span>
              <span>📊 測試集比例: <strong>{(config.test_size * 100).toFixed(0)}%</strong></span>
            </div>

            {/* Feature Importance */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/60">
              <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">特徵重要性分析</h4>
              <div className="space-y-3">
                {Object.entries(result.feature_importances)
                  .sort(([, a], [, b]) => b - a)
                  .map(([feature, val], idx) => {
                    const pct = val * 100
                    const maxVal = Math.max(...Object.values(result.feature_importances)) * 100
                    return (
                      <div key={feature}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-semibold text-slate-600 capitalize">{feature}</span>
                          <span className="text-sm font-mono font-bold" style={{ color: IMPORTANCE_COLORS[idx % 4] }}>{pct.toFixed(1)}%</span>
                        </div>
                        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${(pct / maxVal) * 100}%`, backgroundColor: IMPORTANCE_COLORS[idx % 4] }} />
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 shadow-sm border border-white/60 flex flex-col items-center justify-center text-slate-400 min-h-[300px]">
            <svg className="w-16 h-16 mb-4 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            <p className="text-lg font-medium">調整參數後點擊「開始訓練」</p>
            <p className="text-sm text-slate-300 mt-1">結果將顯示於此</p>
          </div>
        )}
      </div>
    </div>
  )
}
