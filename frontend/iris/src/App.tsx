import { useState } from 'react'
import PredictTab from './components/PredictTab'
import TrainTab from './components/TrainTab'

type Tab = 'predict' | 'train'

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'predict', label: '即時預測', icon: '🔮' },
  { id: 'train', label: '線上訓練', icon: '⚙️' },
]

export default function App() {
  const [tab, setTab] = useState<Tab>('predict')

  return (
    <div className="min-h-screen px-4 py-6 md:px-8 md:py-10 max-w-6xl mx-auto">
      {/* Header */}
      <header className="text-center mb-8 animate-slide-up">
        <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-semibold text-teal-600 border border-teal-100 mb-4 shadow-sm">
          <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" />
          FastAPI + React + TailwindCSS
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold bg-gradient-to-r from-teal-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent leading-tight">
          Iris 鳶尾花
        </h1>
        <h2 className="text-3xl md:text-5xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-500 to-rose-500 bg-clip-text text-transparent leading-tight">
          機器學習平台
        </h2>
        <p className="mt-3 text-sm md:text-base text-slate-400 max-w-xl mx-auto">
          結合 FastAPI 與機器學習模型，提供即時預測與線上訓練功能
        </p>
      </header>

      {/* Tab Navigation */}
      <nav className="flex justify-center mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="inline-flex bg-white/80 backdrop-blur-sm rounded-2xl p-1.5 shadow-sm border border-white/60">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-5 md:px-8 py-2.5 rounded-xl text-sm md:text-base font-semibold transition-all duration-200 cursor-pointer ${
                tab === t.id
                  ? 'bg-gradient-to-r from-teal-500 to-indigo-500 text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="mr-1.5">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main className="animate-slide-up" style={{ animationDelay: '0.15s' }}>
        {tab === 'predict' ? <PredictTab /> : <TrainTab />}
      </main>

      {/* Footer */}
      <footer className="mt-12 text-center text-xs text-slate-300 pb-4">
        <a href="https://20260703.onrender.com/docs" target="_blank" rel="noreferrer" className="hover:text-teal-500 transition-colors">
          API Docs (Swagger)
        </a>
      </footer>
    </div>
  )
}
