import React from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

// Demo data – replace with real API data later
const demoData = [
  { name: 'Mon', scans: 34 },
  { name: 'Tue', scans: 45 },
  { name: 'Wed', scans: 31 },
  { name: 'Thu', scans: 50 },
  { name: 'Fri', scans: 42 },
  { name: 'Sat', scans: 28 },
  { name: 'Sun', scans: 36 },
]

export default function AnalyticsChart() {
  return (
    <section className="glass-card p-6 animate-fade-in">
      <h2 className="text-xl font-semibold text-white mb-4">Fraud Detection Trend (Weekly)</h2>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={demoData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} strokeOpacity={0.1} />
          <XAxis dataKey="name" stroke="rgba(255,255,255,0.6)" />
          <YAxis stroke="rgba(255,255,255,0.6)" />
          <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none' }} />
          <Bar dataKey="scans" fill="var(--color-cyber-500)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </section>
  )
}
