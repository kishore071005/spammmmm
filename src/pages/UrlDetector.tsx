import { useState } from 'react'
import { Link2, ShieldCheck, AlertTriangle, ShieldAlert, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { analyzeUrlHeuristics, checkRateLimit } from '../services/heuristics'
import { analyzeUrl, type UrlAnalysisResult } from '../services/groq'
import { saveScan } from '../services/supabase'
import toast from 'react-hot-toast'

export default function UrlDetector() {
  const { user } = useAuth()
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<UrlAnalysisResult | null>(null)

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return

    if (!checkRateLimit('url')) {
      toast.error('Rate limit exceeded. Please wait a minute.')
      return
    }

    setLoading(true)
    setResult(null)

    try {
      // 1. Local Heuristics
      const heuristics = analyzeUrlHeuristics(url)
      
      // 2. Groq AI Analysis
      const aiResult = await analyzeUrl(url, heuristics)
      setResult(aiResult)

      // 3. Save to Supabase
      if (user) {
        await saveScan({
          user_id: user.id,
          scan_type: 'url',
          input_data: url,
          risk_score: aiResult.risk_score,
          result: aiResult as unknown as Record<string, unknown>,
          ai_analysis: heuristics as unknown as Record<string, unknown>
        })
      }
    } catch (err: any) {
      toast.error('Analysis failed: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <header>
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Link2 className="w-8 h-8 text-indigo-400" />
          URL Fraud Detector
        </h1>
        <p className="text-slate-400">Scan job portals, recruiter links, and application forms for phishing or scams.</p>
      </header>

      {/* Input Section */}
      <div className="glass-card p-6">
        <form onSubmit={handleScan} className="flex gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="text-slate-500 font-mono">https://</span>
            </div>
            <input
              type="text"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="example.com/job-application"
              className="cyber-input w-full pl-20 py-4 text-lg font-mono"
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={loading || !url} 
            className="btn-glow px-8 py-4 whitespace-nowrap"
            style={{ opacity: (loading || !url) ? 0.7 : 1 }}
          >
            {loading ? <div className="spinner" /> : 'Scan URL'}
          </button>
        </form>
      </div>

      {/* Results Section */}
      {result && (
        <div className="space-y-6 animate-slide-up">
          {/* Main Score Card */}
          <div className="glass-card p-8 flex flex-col md:flex-row items-center gap-8"
               style={{
                 borderColor: result.risk_score <= 30 ? 'rgba(34,197,94,0.3)' : 
                              result.risk_score <= 60 ? 'rgba(234,179,8,0.3)' : 
                              'rgba(239,68,68,0.3)'
               }}>
            
            <div className="flex flex-col items-center justify-center min-w-[200px]">
              <div className="relative flex items-center justify-center w-32 h-32 rounded-full mb-4"
                   style={{
                     background: `conic-gradient(${
                       result.risk_score <= 30 ? '#22c55e' : 
                       result.risk_score <= 60 ? '#eab308' : '#ef4444'
                     } ${result.risk_score}%, rgba(255,255,255,0.05) ${result.risk_score}%)`
                   }}>
                <div className="absolute inset-2 rounded-full bg-[#0d0d1a] flex items-center justify-center flex-col">
                  <span className="text-4xl font-bold text-white">{result.risk_score}</span>
                  <span className="text-xs text-slate-400">/ 100</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {result.risk_score <= 30 ? <ShieldCheck className="w-5 h-5 text-green-400" /> :
                 result.risk_score <= 60 ? <AlertTriangle className="w-5 h-5 text-yellow-400" /> :
                 <ShieldAlert className="w-5 h-5 text-red-400" />}
                <span className="font-bold text-lg" style={{
                  color: result.risk_score <= 30 ? '#4ade80' : 
                         result.risk_score <= 60 ? '#facc15' : '#f87171'
                }}>
                  {result.classification}
                </span>
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <h3 className="text-xl font-semibold text-white">AI Analysis Summary</h3>
              <p className="text-slate-300 leading-relaxed">{result.explanation}</p>
              
              <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
                <h4 className="font-semibold text-indigo-400 mb-2">Recommended Action</h4>
                <p className="text-slate-300">{result.recommended_action}</p>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Red Flags */}
            <div className="glass-card p-6">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-red-400 mb-4">
                <ShieldAlert className="w-5 h-5" /> Detected Red Flags
              </h3>
              {result.red_flags.length > 0 ? (
                <ul className="space-y-3">
                  {result.red_flags.map((flag, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-300 text-sm">
                      <div className="mt-0.5 min-w-[6px] w-1.5 h-1.5 rounded-full bg-red-400" />
                      {flag}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle2 className="w-5 h-5" /> No major red flags detected.
                </div>
              )}
            </div>

            {/* Technical Details */}
            <div className="glass-card p-6">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-indigo-400 mb-4">
                <Link2 className="w-5 h-5" /> Technical Breakdown
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                {result.technical_details}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
