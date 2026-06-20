import React from 'react'

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

export default function StatCard({ title, value, icon: Icon, trend, colorClass = 'text-indigo-400' }: StatCardProps) {
  return (
    <div className="glass-card p-6 animate-slide-up">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-white">{value}</h3>
          
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-sm font-medium ${trend.isPositive ? 'text-green-400' : 'text-red-400'}`}>
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}% from last week</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl bg-[rgba(255,255,255,0.04)] ${colorClass}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  )
}
