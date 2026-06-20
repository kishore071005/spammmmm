import { useState, useCallback, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import { FileText, UploadCloud, ShieldCheck, AlertTriangle, ShieldAlert, CheckCircle2, FileWarning } from 'lucide-react'
import * as pdfjsLib from 'pdfjs-dist'
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { useAuth } from '../contexts/AuthContext'
import { analyzePdfText, type PdfAnalysisResult } from '../services/groq'
import { saveScan } from '../services/supabase'
import toast from 'react-hot-toast'

// Set worker path for pdfjs using Vite's ?url import
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker

export default function PdfAnalyzer() {
  const { user } = useAuth()
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [statusText, setStatusText] = useState('')
  const [result, setResult] = useState<PdfAnalysisResult | null>(null)

  const extractTextFromPdf = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer()
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
    const pdfDocument = await loadingTask.promise
    let fullText = ''

    for (let i = 1; i <= pdfDocument.numPages; i++) {
      const page = await pdfDocument.getPage(i)
      const textContent = await page.getTextContent()
      const pageText = textContent.items.map((item: any) => item.str).join(' ')
      fullText += pageText + '\n'
    }

    return fullText
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0])
      setResult(null)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024 // 5MB
  })

  const handleScan = async () => {
    if (!file) return

    setLoading(true)
    setResult(null)
    setStatusText('Extracting text from PDF locally...')

    try {
      const text = await extractTextFromPdf(file)
      
      if (!text || text.trim().length < 50) {
        throw new Error('Could not extract meaningful text. The PDF might be scanned images only.')
      }

      setStatusText('Analyzing document with AI...')
      const aiResult = await analyzePdfText(text, file.name)
      setResult(aiResult)

      if (user) {
        await saveScan({
          user_id: user.id,
          scan_type: 'pdf',
          input_data: file.name,
          risk_score: aiResult.fraud_score,
          result: aiResult as unknown as Record<string, unknown>,
          ai_analysis: {}
        })
      }

    } catch (err: any) {
      toast.error('Analysis failed: ' + err.message)
    } finally {
      setLoading(false)
      setStatusText('')
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <header>
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <FileText className="w-8 h-8 text-orange-400" />
          Document Analyzer
        </h1>
        <p className="text-slate-400">Upload offer letters or employment contracts to find hidden bonds or penalty clauses.</p>
      </header>

      {/* Upload Area */}
      <div className="glass-card p-1">
        <div 
          {...getRootProps()} 
          className={`border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer ${
            isDragActive ? 'border-indigo-400 bg-indigo-400/5' : 'border-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.02)]'
          }`}
        >
          <input {...getInputProps()} />
          <UploadCloud className={`w-12 h-12 mx-auto mb-4 ${isDragActive ? 'text-indigo-400 animate-bounce' : 'text-slate-500'}`} />
          
          {file ? (
            <div>
              <p className="text-lg font-medium text-white mb-1">{file.name}</p>
              <p className="text-sm text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          ) : (
            <div>
              <p className="text-lg font-medium text-white mb-1">
                {isDragActive ? 'Drop PDF here' : 'Drag & drop your PDF document'}
              </p>
              <p className="text-sm text-slate-400">or click to browse (Max 5MB)</p>
            </div>
          )}
        </div>
      </div>

      {file && !result && (
        <div className="flex justify-end animate-fade-in">
          <button 
            onClick={handleScan}
            disabled={loading} 
            className="btn-glow px-8 py-3 flex items-center gap-2"
          >
            {loading && <div className="spinner w-4 h-4" />}
            {loading ? statusText : 'Scan Document'}
          </button>
        </div>
      )}

      {/* Results */}
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
              <h3 className="text-xl font-semibold text-white">Document Summary</h3>
              <p className="text-slate-300 leading-relaxed">{result.summary}</p>
              
              <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
                <h4 className="font-semibold text-indigo-400 mb-2">Final Verdict</h4>
                <p className="text-slate-300 font-medium">{result.verdict}</p>
              </div>
            </div>
          </div>

          {/* Dangerous Clauses */}
          <div className="glass-card p-6">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-orange-400 mb-4">
              <FileWarning className="w-5 h-5" /> Dangerous & Suspicious Clauses
            </h3>
            
            {result.dangerous_clauses.length > 0 ? (
              <div className="space-y-4">
                {result.dangerous_clauses.map((clause, i) => (
                  <div key={i} className="p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold text-white">{clause.type}</span>
                      <span className={`text-xs px-2 py-1 rounded font-bold ${
                        clause.risk === 'high' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                        clause.risk === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                        'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}>
                        {clause.risk.toUpperCase()} RISK
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm italic mb-2">"{clause.text}"</p>
                    <p className="text-indigo-300 text-sm">→ {clause.explanation}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle2 className="w-5 h-5" /> No dangerous clauses detected.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
