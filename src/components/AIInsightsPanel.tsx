import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, AlertTriangle, CheckCircle2, TrendingUp, ChevronRight, Sparkles } from 'lucide-react'

const insights = [
  {
    type: 'warning',
    icon: AlertTriangle,
    color: '#f59e0b',
    title: 'Trending Scam Pattern',
    text: 'Most online recruitment scams begin with fake recruiter messages asking for registration or processing fees.',
  },
  {
    type: 'warning',
    icon: AlertTriangle,
    color: '#f59e0b',
    title: 'Domain Verification Alert',
    text: 'Always verify company domains before submitting personal information. Look for HTTPS and check WHOIS records.',
  },
  {
    type: 'safe',
    icon: CheckCircle2,
    color: '#22c55e',
    title: 'Best Practice',
    text: 'Genuine employers rarely demand payments before hiring. Any upfront fee request is a major red flag.',
  },
  {
    type: 'trend',
    icon: TrendingUp,
    color: '#6366f1',
    title: 'AI Detection Update',
    text: 'Our AI models have been updated to detect the latest wave of Telegram and WhatsApp job scam patterns.',
  },
  {
    type: 'warning',
    icon: AlertTriangle,
    color: '#ef4444',
    title: 'High-Risk Alert',
    text: 'PDF documents with hidden links and embedded macros are being used in fake employment offers. Scan all documents before opening.',
  },
  {
    type: 'safe',
    icon: CheckCircle2,
    color: '#22c55e',
    title: 'Prevention Tip',
    text: 'Cross-reference recruiter LinkedIn profiles with the company\'s official page. Scammers often use cloned profiles.',
  },
]

export default function AIInsightsPanel() {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % insights.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [])

  const current = insights[activeIndex]
  const CurrentIcon = current.icon

  return (
    <motion.section
      className="glass-card p-6 relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-brand-500/10 border border-brand-500/20">
          <Brain className="w-5 h-5 text-brand-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">AI Security Insights</h2>
          <p className="text-xs text-slate-500">Powered by Scam Shield Intelligence</p>
        </div>
        <div className="ml-auto flex items-center gap-1 px-2 py-1 rounded-full bg-cyber-400/10">
          <Sparkles className="w-3 h-3 text-cyber-400" />
          <span className="text-[10px] text-cyber-400 font-medium">LIVE</span>
        </div>
      </div>

      {/* Rotating Insight */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeIndex}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.4 }}
          className="p-4 rounded-xl mb-5"
          style={{ background: `${current.color}08`, border: `1px solid ${current.color}20` }}
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg flex-shrink-0" style={{ background: `${current.color}15` }}>
              <CurrentIcon className="w-5 h-5" style={{ color: current.color }} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white mb-1">{current.title}</h3>
              <p className="text-sm text-slate-300 leading-relaxed">{current.text}</p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Dots indicator */}
      <div className="flex items-center justify-center gap-2 mb-4">
        {insights.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i === activeIndex ? 'w-6 bg-brand-500' : 'bg-slate-600 hover:bg-slate-500'
            }`}
          />
        ))}
      </div>

      {/* Quick tips grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: 'Daily Scam Alerts', value: '12', icon: AlertTriangle, color: '#f59e0b' },
          { label: 'Prevention Tips', value: '8', icon: CheckCircle2, color: '#22c55e' },
          { label: 'Fraud Patterns', value: '5', icon: TrendingUp, color: '#6366f1' },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
            <item.icon className="w-4 h-4 flex-shrink-0" style={{ color: item.color }} />
            <div>
              <div className="text-sm font-bold text-white">{item.value}</div>
              <div className="text-[10px] text-slate-500">{item.label}</div>
            </div>
          </div>
        ))}
      </div>
    </motion.section>
  )
}
