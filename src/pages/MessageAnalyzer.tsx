import { useState } from 'react'
import { MessageSquareText, ShieldCheck, AlertTriangle, ShieldAlert, CheckCircle2, Info } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { checkRateLimit } from '../services/heuristics'
import { analyzeMessage, type MessageAnalysisResult } from '../services/groq'
import { saveScan } from '../services/supabase'
import toast from 'react-hot-toast'

export default function MessageAnalyzer() {
  const { user } = useAuth()
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<MessageAnalysisResult | null>(null)

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    if (!checkRateLimit('message')) {
      toast.error('Rate limit exceeded. Please wait a minute.')
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const aiResult = await analyzeMessage(message)
      setResult(aiResult)

      if (user) {
        await saveScan({
          user_id: user.id,
          scan_type: 'message',
          input_data: message,
          risk_score: aiResult.fraud_score,
          result: aiResult as unknown as Record<string, unknown>,
          ai_analysis: {}
        })
      }
    } catch (err: any) {
      toast.error('Analysis failed: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Helper to render scam indicators nicely
  const renderIndicators = (indicators: MessageAnalysisResult['scam_indicators']) => {
    const items = [
      { key: 'money_request', label: 'Money / Fee Request', active: indicators.money_request },
      { key: 'urgency_tactics', label: 'Urgency Tactics', active: indicators.urgency_tactics },
      { key: 'unrealistic_salary', label: 'Unrealistic Salary', active: indicators.unrealistic_salary },
      { key: 'fake_interview', label: 'Fake Interview Process', active: indicators.fake_interview },
      { key: 'personal_data_collection', label: 'Personal Data Collection', active: indicators.personal_data_collection },
      { key: 'grammar_issues', label: 'Grammar / Spelling Issues', active: indicators.grammar_issues },
      { key: 'social_engineering', label: 'Social Engineering', active: indicators.social_engineering }
    ]

    return (
      <div className="flex flex-wrap gap-2 mt-4">
        {items.map(item => (
          <div key={item.key} 
               className={`px-3 py-1.5 rounded-full text-xs font-medium border ${
                 item.active 
                   ? 'bg-red-500/10 border-red-500/30 text-red-400' 
                   : 'bg-white/5 border-white/10 text-slate-400 opacity-50'
               }`}>
            {item.label}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <header>
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <MessageSquareText className="w-8 h-8 text-indigo-400" />
          Message Analyzer
        </h1>
        <p className="text-slate-400">Paste an email, SMS, or LinkedIn message to check for recruitment fraud tactics.</p>
      </header>

      <div className="glass-card p-6">
        <form onSubmit={handleScan} className="flex flex-col gap-4">
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Paste the recruiter message here..."
            className="cyber-input w-full min-h-[150px] resize-y p-4 text-base"
            required
          />
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500">
              <Info className="w-3 h-3 inline mr-1" />
              Do not include personal information like your SSN or bank details in the text.
            </span>
            <button 
              type="submit" 
              disabled={loading || !message.trim()} 
              className="btn-glow px-8 py-3"
              style={{ opacity: (loading || !message.trim()) ? 0.7 : 1 }}
            >
              {loading ? <div className="spinner" /> : 'Analyze Message'}
            </button>
          </div>
        </form>
      </div>

      {result && (
        <div className="space-y-6 animate-slide-up">
          <div className="glass-card p-8 flex flex-col md:flex-row gap-8"
               style={{
                 borderColor: result.fraud_score <= 30 ? 'rgba(34,197,94,0.3)' : 
                              result.fraud_score <= 60 ? 'rgba(234,179,8,0.3)' : 
                              'rgba(239,68,68,0.3)'
               }}>
            
            <div className="flex flex-col items-center justify-center min-w-[200px] border-r border-[rgba(255,255,255,0.08)] pr-8">
              <div className="relative flex items-center justify-center w-32 h-32 rounded-full mb-4"
                   style={{
                     background: `conic-gradient(${
                       result.fraud_score <= 30 ? '#22c55e' : 
                       result.fraud_score <= 60 ? '#eab308' : '#ef4444'
                     } ${result.fraud_score}%, rgba(255,255,255,0.05) ${result.fraud_score}%)`
                   }}>
                <div className="absolute inset-2 rounded-full bg-[#0d0d1a] flex items-center justify-center flex-col">
                  <span className="text-4xl font-bold text-white">{result.fraud_score}</span>
                  <span className="text-xs text-slate-400">/ 100</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {result.fraud_score <= 30 ? <ShieldCheck className="w-5 h-5 text-green-400" /> :
                 result.fraud_score <= 60 ? <AlertTriangle className="w-5 h-5 text-yellow-400" /> :
                 <ShieldAlert className="w-5 h-5 text-red-400" />}
                <span className="font-bold text-lg" style={{
                  color: result.fraud_score <= 30 ? '#4ade80' : 
                         result.fraud_score <= 60 ? '#facc15' : '#f87171'
                }}>
                  {result.classification}
                </span>
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <h3 className="text-xl font-semibold text-white">Analysis Summary</h3>
              <p className="text-slate-300 leading-relaxed">{result.explanation}</p>
              
              <div className="mt-4">
                <h4 className="text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider">Detected Tactics</h4>
                {renderIndicators(result.scam_indicators)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card p-6">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-red-400 mb-4">
                <ShieldAlert className="w-5 h-5" /> Suspicious Phrases
              </h3>
              {result.suspicious_phrases.length > 0 ? (
                <ul className="space-y-3">
                  {result.suspicious_phrases.map((phrase, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-300 text-sm">
                      <div className="mt-1 min-w-[12px] h-[12px] rounded border border-red-500/50 bg-red-500/20 flex items-center justify-center text-[8px] text-red-400">"{/* Icon visual placeholder */}"</div>
                      <span className="italic">"{phrase}"</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle2 className="w-5 h-5" /> No clearly suspicious phrases found.
                </div>
              )}
            </div>

            <div className="glass-card p-6 flex flex-col">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-green-400 mb-4">
                <ShieldCheck className="w-5 h-5" /> Safety Tips & Recommendations
              </h3>
              <ul className="space-y-3 flex-1">
                {result.safety_tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-300 text-sm">
                    <div className="mt-0.5 min-w-[6px] w-1.5 h-1.5 rounded-full bg-green-400" />
                    {tip}
                  </li>
                ))}
              </ul>
              <div className="mt-6 p-4 rounded-xl bg-[rgba(99,102,241,0.05)] border border-[rgba(99,102,241,0.15)]">
                <p className="text-sm text-indigo-300 font-medium">{result.recommended_action}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
