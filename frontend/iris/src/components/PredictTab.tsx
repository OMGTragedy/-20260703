import { useState, useEffect, useRef } from 'react'
import { predict } from '../api/client'
import type { IrisOutput } from '../api/types'

const FEATURES = [
  { key: 'sepal_length' as const, label: '花萼長度', sub: 'Sepal Length', unit: 'cm', min: 0.1, max: 10, default: 5.1, color: 'from-teal-400 to-emerald-500' },
  { key: 'sepal_width' as const, label: '花萼寬度', sub: 'Sepal Width', unit: 'cm', min: 0.1, max: 10, default: 3.5, color: 'from-sky-400 to-blue-500' },
  { key: 'petal_length' as const, label: '花瓣長度', sub: 'Petal Length', unit: 'cm', min: 0.1, max: 10, default: 1.4, color: 'from-violet-400 to-purple-500' },
  { key: 'petal_width' as const, label: '花瓣寬度', sub: 'Petal Width', unit: 'cm', min: 0.1, max: 10, default: 0.2, color: 'from-pink-400 to-rose-500' },
]

const SPECIES_META: Record<string, { emoji: string; cn: string; bg: string; border: string; text: string; bar: string }> = {
  setosa:     { emoji: '🌿', cn: '山鳶尾',      bg: 'bg-emerald-50',  border: 'border-emerald-200',  text: 'text-emerald-700',  bar: 'bg-emerald-500' },
  versicolor: { emoji: '🍁', cn: '變色鳶尾',    bg: 'bg-amber-50',   border: 'border-amber-200',   text: 'text-amber-700',   bar: 'bg-amber-500' },
  virginica:  { emoji: '🪻', cn: '維吉尼亞鳶尾', bg: 'bg-rose-50',    border: 'border-rose-200',    text: 'text-rose-700',    bar: 'bg-rose-500' },
}

export default function PredictTab() {
  const [values, setValues] = useState({
    sepal_length: 5.1,
    sepal_width: 3.5,
    petal_length: 1.4,
    petal_width: 0.2,
  })
  const [result, setResult] = useState<IrisOutput | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const handleChange = (key: string, val: number) => {
    const next = { ...values, [key]: val }
    setValues(next)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => runPredict(next), 120)
  }

  const runPredict = async (vals: typeof values) => {
    setLoading(true)
    setError('')
    try {
      const res = await predict(vals)
      setResult(res)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '預測失敗')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    runPredict(values)
    return () => clearTimeout(debounceRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const meta = result ? SPECIES_META[result.prediction_label] ?? { emoji: '🌸', cn: result.prediction_label, bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700', bar: 'bg-slate-500' } : null

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
      {/* Left: Sliders */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/60">
        <h3 className="text-lg font-bold text-slate-800 mb-1">輸入特徵</h3>
        <p className="text-sm text-slate-400 mb-5">拖動滑桿調整鳶尾花的量測數據</p>
        <div className="space-y-5">
          {FEATURES.map((f) => (
            <div key={f.key}>
              <div className="flex justify-between mb-1.5">
                <span className="text-sm font-semibold text-slate-700">{f.label} <span className="text-slate-400 font-normal">{f.sub}</span></span>
                <span className="text-sm font-mono font-bold text-teal-600">{values[f.key].toFixed(1)} {f.unit}</span>
              </div>
              <input
                type="range"
                min={f.min}
                max={f.max}
                step={0.1}
                value={values[f.key]}
                onChange={(e) => handleChange(f.key, parseFloat(e.target.value))}
                className="w-full cursor-pointer"
              />
              <div className="flex justify-between text-xs text-slate-300 mt-0.5">
                <span>{f.min}</span><span>{f.max}</span>
              </div>
            </div>
          ))}
        </div>
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>
        )}
      </div>

      {/* Right: Result */}
      <div className="space-y-5">
        {/* Prediction Card */}
        <div className={`rounded-2xl p-6 shadow-sm border-2 transition-all duration-500 ${meta ? `${meta.bg} ${meta.border}` : 'bg-slate-50 border-slate-200'}`}>
          <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">預測分析品種</div>
          {meta && result ? (
            <>
              <div className={`text-4xl font-extrabold ${meta.text} mb-1 flex items-center gap-3 justify-center`}>
                <span className="text-5xl">{meta.emoji}</span>
                {meta.cn}
              </div>
              <div className={`text-xl font-bold ${meta.text} opacity-80`}>
                {result.prediction_label.charAt(0).toUpperCase() + result.prediction_label.slice(1)}
              </div>
              <div className="mt-3 text-sm text-slate-500">
                預測機率 <span className={`text-2xl font-extrabold ${meta.text}`}>{((result.probabilities[result.prediction_label] ?? 0) * 100).toFixed(1)}%</span>
              </div>
            </>
          ) : (
            <div className="text-slate-300 text-center py-8">
              {loading ? '分析中...' : '等待輸入...'}
            </div>
          )}
        </div>

        {/* Probability Bars */}
        {result && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/60">
            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">機率分佈分析</h4>
            <div className="space-y-4">
              {Object.entries(result.probabilities)
                .sort(([, a], [, b]) => b - a)
                .map(([cls, prob]) => {
                  const m = SPECIES_META[cls]
                  const pct = prob * 100
                  const isTop = cls === result.prediction_label
                  return (
                    <div key={cls}>
                      <div className="flex justify-between mb-1.5">
                        <span className={`text-sm font-semibold ${isTop ? (m?.text ?? 'text-slate-700') : 'text-slate-500'}`}>
                          {m?.emoji} {m?.cn ?? cls}
                          {isTop && <span className="ml-2 text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">最佳</span>}
                        </span>
                        <span className={`text-sm font-mono font-bold ${isTop ? (m?.text ?? 'text-slate-700') : 'text-slate-400'}`}>{pct.toFixed(1)}%</span>
                      </div>
                      <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ease-out ${m?.bar ?? 'bg-slate-400'} ${isTop ? 'shadow-sm' : 'opacity-60'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
