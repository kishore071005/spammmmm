import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts'

/* Demo data — replaced by real data when available */
const weeklyData = [
  { name: 'Mon', scans: 34, threats: 8 },
  { name: 'Tue', scans: 45, threats: 12 },
  { name: 'Wed', scans: 31, threats: 5 },
  { name: 'Thu', scans: 50, threats: 15 },
  { name: 'Fri', scans: 42, threats: 10 },
  { name: 'Sat', scans: 28, threats: 4 },
  { name: 'Sun', scans: 36, threats: 7 },
]

const categoryData = [
  { name: 'Phishing URLs', value: 35, color: '#6366f1' },
  { name: 'Fake Job Portals', value: 25, color: '#8b5cf6' },
  { name: 'Fake Recruiters', value: 20, color: '#ec4899' },
  { name: 'Payment Scams', value: 12, color: '#f59e0b' },
  { name: 'Fraud Contracts', value: 8, color: '#ef4444' },
]

const riskData = [
  { name: 'Safe', value: 65, color: '#22c55e' },
  { name: 'Suspicious', value: 23, color: '#eab308' },
  { name: 'Dangerous', value: 12, color: '#ef4444' },
]

const trendData = [
  { day: 'W1', threats: 12 },
  { day: 'W2', threats: 19 },
  { day: 'W3', threats: 14 },
  { day: 'W4', threats: 28 },
  { day: 'W5', threats: 22 },
  { day: 'W6', threats: 16 },
  { day: 'W7', threats: 20 },
  { day: 'W8', threats: 25 },
]

const tooltipStyle = {
  backgroundColor: 'rgba(13,13,26,0.95)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '12px',
  padding: '8px 12px',
  color: '#e2e8f0',
  fontSize: '0.8rem',
}

type Tab = 'weekly' | 'categories' | 'risk' | 'trend'

export default function AnalyticsChart() {
  const [tab, setTab] = useState<Tab>('weekly')

  const tabs: { id: Tab; label: string }[] = [
    { id: 'weekly', label: 'Weekly Overview' },
    { id: 'categories', label: 'Scam Categories' },
    { id: 'risk', label: 'Risk Distribution' },
    { id: 'trend', label: 'Threat Timeline' },
  ]

  return (
    <motion.section
      className="glass-card p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-xl font-bold text-white">Threat Intelligence Analytics</h2>
        <div className="flex rounded-xl p-1 bg-[rgba(255,255,255,0.04)]">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 ${
                tab === t.id
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[300px]">
        {tab === 'weekly' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeOpacity={0.06} />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={12} />
              <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="scans" fill="#6366f1" radius={[6, 6, 0, 0]} name="Total Scans" />
              <Bar dataKey="threats" fill="#ef4444" radius={[6, 6, 0, 0]} name="Threats Found" />
            </BarChart>
          </ResponsiveContainer>
        )}

        {tab === 'categories' && (
          <div className="flex flex-col md:flex-row items-center gap-6 h-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-2 min-w-[180px]">
              {categoryData.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-slate-300">{item.name}</span>
                  <span className="ml-auto text-sm font-semibold text-white">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'risk' && (
          <div className="flex flex-col md:flex-row items-center gap-6 h-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {riskData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-3 min-w-[160px]">
              {riskData.map((item, i) => (
                <div key={i} className="glass-card p-3 flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                  <div>
                    <div className="text-sm font-medium text-white">{item.name}</div>
                    <div className="text-2xl font-bold text-white">{item.value}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'trend' && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="threatGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeOpacity={0.06} />
              <XAxis dataKey="day" stroke="rgba(255,255,255,0.4)" fontSize={12} />
              <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area
                type="monotone"
                dataKey="threats"
                stroke="#ef4444"
                strokeWidth={2}
                fill="url(#threatGradient)"
                name="Threats Detected"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.section>
  )
}
