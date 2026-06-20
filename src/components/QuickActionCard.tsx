import React from 'react'
import { motion } from 'framer-motion'

interface QuickActionCardProps {
  title: string
  description: string
  icon: React.ReactNode
  stats: React.ReactNode
  onClick?: () => void
  bgColor?: string // Tailwind bg class e.g. 'bg-brand-600'
}

export default function QuickActionCard({
  title,
  description,
  icon,
  stats,
  onClick,
  bgColor = 'bg-dark-800',
}: QuickActionCardProps) {
  return (
    <motion.button
      onClick={onClick}
      className={`glass-card p-6 ${bgColor} text-white rounded-xl hover:shadow-glow-brand transition transform hover:-translate-y-1`} // glass-card defined in tailwind config
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold mb-1">{title}</h3>
          <p className="text-sm text-slate-300 mb-3 max-w-xs">{description}</p>
          <div className="text-sm font-medium text-slate-200">{stats}</div>
        </div>
        <div className="text-3xl opacity-70">{icon}</div>
      </div>
    </motion.button>
  )
}
