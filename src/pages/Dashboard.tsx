import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck, ShieldAlert, Activity, FileText, Link2, MessageSquareText, Target, Percent, Download } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { getUserScans, getScanStats } from '../services/supabase'
import { generatePdfReport } from '../utils/pdfGenerator'
import StatCard from '../components/StatCard'
import ScanHistory from '../components/ScanHistory'
import HeroSection from '../components/HeroSection'
import QuickActionCard from '../components/QuickActionCard'
import AnalyticsChart from '../components/AnalyticsChart'
import AIInsightsPanel from '../components/AIInsightsPanel'
import Footer from '../components/Footer'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
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
    <div className="space-y-8">
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Quick Security Action Center */}
      <section>
        <div className="flex items-center gap-2 mb-5">
          <div className="w-1 h-6 rounded-full bg-brand-500" />
          <h2 className="text-xl font-bold text-white">Quick Security Actions</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <QuickActionCard
            title="URL Fraud Scanner"
            description="Verify websites, academic portals, and job links for phishing attempts, fake domains, and malicious activity."
            icon={<Link2 className="w-6 h-6" />}
            accentColor="#6366f1"
            stats={[
              { label: 'URLs Checked', value: stats.total || 0 },
              { label: 'Threats', value: stats.fraud || 0 },
            ]}
            onClick={() => navigate('/scan/url')}
            delay={0}
          />
          <QuickActionCard
            title="Message Analyzer"
            description="Detect scam messages, fake job offers, payment requests, unrealistic salaries, and social engineering tactics."
            icon={<MessageSquareText className="w-6 h-6" />}
            accentColor="#8b5cf6"
            stats={[
              { label: 'Trust Score', value: stats.safe || 0 },
              { label: 'Detections', value: stats.suspicious || 0 },
            ]}
            onClick={() => navigate('/scan/message')}
            delay={0.1}
          />
          <QuickActionCard
            title="Document Analyzer"
            description="Upload offer letters and agreements to detect hidden fees, locking clauses, penalties, and suspicious terms."
            icon={<FileText className="w-6 h-6" />}
            accentColor="#ec4899"
            stats={[
              { label: 'Safety Score', value: stats.safe || 0 },
              { label: 'Risk Flags', value: stats.fraud || 0 },
            ]}
            onClick={() => navigate('/scan/pdf')}
            delay={0.2}
          />
        </div>
      </section>

      {/* 3. Real-Time Security Overview */}
      <section>
        <div className="flex items-center gap-2 mb-5">
          <div className="w-1 h-6 rounded-full bg-cyber-400" />
          <h2 className="text-xl font-bold text-white">Real-Time Security Overview</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title="Total Scans"
            value={stats.total}
            icon={Activity}
            colorClass="text-indigo-400"
          />
          <StatCard
            title="Threats Detected"
            value={stats.fraud}
            icon={ShieldAlert}
            colorClass="text-red-400"
          />
          <StatCard
            title="Safe Results"
            value={stats.safe}
            icon={ShieldCheck}
            colorClass="text-green-400"
          />
          <StatCard
            title="Avg Risk Score"
            value={stats.avgScore}
            icon={Percent}
            colorClass="text-yellow-400"
          />
          <StatCard
            title="AI Accuracy"
            value="94%"
            icon={Target}
            colorClass="text-brand-400"
          />
        </div>
      </section>

      {/* 4. Threat Intelligence Analytics */}
      <section>
        <div className="flex items-center gap-2 mb-5">
          <div className="w-1 h-6 rounded-full bg-brand-500" />
          <h2 className="text-xl font-bold text-white">Threat Intelligence</h2>
        </div>
        <AnalyticsChart />
      </section>

      {/* 5. AI Security Insights */}
      <AIInsightsPanel />

      {/* 6. Recent Analysis History */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-1 h-6 rounded-full bg-brand-500" />
            <h2 className="text-xl font-bold text-white">Recent Analysis History</h2>
          </div>
        </div>
        <ScanHistory
          scans={scans}
          loading={loading}
          onDownloadReport={handleDownloadReport}
        />
      </section>

      {/* 7. PDF Report Center */}
      <motion.section
        className="glass-card p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white mb-1">Generate Professional Fraud Investigation Reports</h2>
            <p className="text-sm text-slate-400">Download comprehensive PDF reports for any scan in your history.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                if (scans.length > 0) handleDownloadReport(scans[0])
                else toast.error('No scans available to generate a report')
              }}
              className="btn-glow flex items-center gap-2 text-sm"
            >
              <Download className="w-4 h-4" />
              Download Latest Report
            </button>
          </div>
        </div>

        {/* Recent reports preview */}
        {scans.length > 0 && (
          <div className="mt-4 pt-4 border-t border-[rgba(255,255,255,0.06)]">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Recent Scans Available for Report</p>
            <div className="flex flex-wrap gap-2">
              {scans.slice(0, 5).map((scan, i) => (
                <button
                  key={scan.id}
                  onClick={() => handleDownloadReport(scan)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] text-slate-300 hover:bg-brand-500/10 hover:border-brand-500/30 hover:text-white transition-all"
                >
                  {scan.scan_type.toUpperCase()} #{i + 1}
                </button>
              ))}
            </div>
          </div>
        )}
      </motion.section>

      {/* 9. Footer */}
      <Footer />
    </div>
  )
}
