import { useEffect, useState } from 'react'
import { ShieldCheck, ShieldAlert, Activity, FileText } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { getUserScans, getScanStats } from '../services/supabase'
import { generatePdfReport } from '../utils/pdfGenerator'
import StatCard from '../components/StatCard'
import ScanHistory from '../components/ScanHistory'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const { user, profile } = useAuth()
  const [scans, setScans] = useState<any[]>([])
  const [stats, setStats] = useState({
    total: 0,
    safe: 0,
    suspicious: 0,
    fraud: 0,
    avgScore: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const loadData = async () => {
      try {
        const [scansRes, statsRes] = await Promise.all([
          getUserScans(user.id, 10),
          getScanStats(user.id)
        ])

        if (scansRes.error) throw scansRes.error
        if (statsRes.error) throw statsRes.error

        setScans(scansRes.data || [])

        const allStats = statsRes.data || []
        let safe = 0, suspicious = 0, fraud = 0, totalScore = 0

        allStats.forEach(s => {
          totalScore += s.risk_score
          if (s.risk_score <= 30) safe++
          else if (s.risk_score <= 60) suspicious++
          else fraud++
        })

        setStats({
          total: allStats.length,
          safe,
          suspicious,
          fraud,
          avgScore: allStats.length ? Math.round(totalScore / allStats.length) : 0
        })
      } catch (err: any) {
        toast.error('Failed to load dashboard data: ' + err.message)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user])

  const handleDownloadReport = (scan: any) => {
    if (!profile) return
    generatePdfReport({
      user: { name: profile.name, email: profile.email },
      scan: {
        id: scan.id,
        scan_type: scan.scan_type,
        input_data: scan.input_data,
        risk_score: scan.risk_score,
        created_at: scan.created_at
      },
      analysis: scan.result || scan.ai_analysis || {}
    })
    toast.success('Report downloaded successfully')
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Welcome back, {profile?.name?.split(' ')[0]}</h1>
        <p className="text-slate-400">Here's your latest security overview and scan history.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Scans" 
          value={stats.total} 
          icon={Activity} 
          colorClass="text-indigo-400"
        />
        <StatCard 
          title="Safe Findings" 
          value={stats.safe} 
          icon={ShieldCheck} 
          colorClass="text-green-400"
        />
        <StatCard 
          title="Suspicious" 
          value={stats.suspicious} 
          icon={FileText} 
          colorClass="text-yellow-400"
        />
        <StatCard 
          title="Fraud Detected" 
          value={stats.fraud} 
          icon={ShieldAlert} 
          colorClass="text-red-400"
        />
      </div>

      {/* Recent Scans */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Recent Activity</h2>
        </div>
        <ScanHistory 
          scans={scans} 
          loading={loading} 
          onDownloadReport={handleDownloadReport} 
        />
      </div>
    </div>
  )
}
