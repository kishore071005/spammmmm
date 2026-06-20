import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

interface QuickActionCardProps {
  title: string
  description: string
  icon: React.ReactNode
  accentColor: string  // e.g. '#6366f1'
  stats: { label: string; value: string | number }[]
  onClick?: () => void
  delay?: number
}

export default function QuickActionCard({
  title,
  description,
  icon,
  accentColor,
  stats,
  onClick,
  delay = 0,
}: QuickActionCardProps) {
  return (
    <motion.button
      onClick={onClick}
      className="glass-card p-6 text-left w-full group relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -4 }}
    >
      {/* Top accent gradient */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5 opacity-60 group-hover:opacity-100 transition-opacity"
        style={{ background: `linear-gradient(90deg, ${accentColor}, transparent)` }}
      />

      {/* Icon */}
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300"
        style={{ background: `${accentColor}15`, border: `1px solid ${accentColor}30` }}
      >
        <div style={{ color: accentColor }}>{icon}</div>
      </div>

      {/* Title & Description */}
      <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-brand-300 transition-colors">{title}</h3>
      <p className="text-sm text-slate-400 mb-4 leading-relaxed line-clamp-2">{description}</p>

      {/* Stats */}
      <div className="flex gap-4 mb-4">
        {stats.map((s, i) => (
          <div key={i} className="text-center">
            <div className="text-lg font-bold text-white">{s.value}</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider">{s.label}</div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="flex items-center gap-1 text-sm font-medium group-hover:gap-2 transition-all"
        style={{ color: accentColor }}>
        <span>Open Scanner</span>
        <ArrowRight className="w-4 h-4" />
      </div>
    </motion.button>
  )
}
