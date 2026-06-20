import React, { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ElementType
  trend?: {
    value: number
    isPositive: boolean
  }
  colorClass?: string
}

function useCountUp(target: number, duration = 1200) {
  const [count, setCount] = useState(0)
  const ref = useRef<number>(0)

  useEffect(() => {
    if (target === 0) { setCount(0); return }
    const startTime = Date.now()
    const startVal = ref.current
    const step = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      const current = Math.round(startVal + (target - startVal) * eased)
      setCount(current)
      if (progress < 1) requestAnimationFrame(step)
      else ref.current = target
    }
    requestAnimationFrame(step)
  }, [target, duration])

  return count
}

export default function StatCard({ title, value, icon: Icon, trend, colorClass = 'text-indigo-400' }: StatCardProps) {
  const numericValue = typeof value === 'number' ? value : parseInt(value) || 0
  const displayValue = typeof value === 'number' ? useCountUp(numericValue) : value

  return (
    <motion.div
      className="glass-card p-6 group relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-500/0 to-transparent group-hover:from-brand-500/5 transition-all duration-500 pointer-events-none" />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400 mb-2">{title}</p>
          <h3 className="text-3xl font-bold text-white tabular-nums">{displayValue}</h3>

          {trend && (
            <div className={`flex items-center gap-1.5 mt-3 text-sm font-medium ${trend.isPositive ? 'text-cyber-400' : 'text-danger-400'}`}>
              <span className="text-xs">{trend.isPositive ? '▲' : '▼'}</span>
              <span>{Math.abs(trend.value)}% from last week</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl bg-[rgba(255,255,255,0.04)] ${colorClass} group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      {/* Bottom accent line */}
      <div className={`absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-500 ${colorClass === 'text-green-400' ? 'bg-green-400' : colorClass === 'text-yellow-400' ? 'bg-yellow-400' : colorClass === 'text-red-400' ? 'bg-red-400' : 'bg-brand-400'}`} />
    </motion.div>
  )
}
