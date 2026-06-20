import { getScoreLabel, getScoreBadgeClass, formatRelativeTime, truncateText } from '../services/heuristics'
import { Link2, MessageSquareText, FileText, Download } from 'lucide-react'

interface ScanHistoryProps {
  scans: any[]
  loading: boolean
  onDownloadReport?: (scan: any) => void
}

export default function ScanHistory({ scans, loading, onDownloadReport }: ScanHistoryProps) {
  if (loading) {
    return (
      <div className="glass-card p-6 flex justify-center items-center h-48">
        <div className="spinner" />
      </div>
    )
  }

  if (!scans || scans.length === 0) {
    return (
      <div className="glass-card p-8 text-center flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-[rgba(255,255,255,0.02)] flex items-center justify-center mb-4 border border-[rgba(255,255,255,0.05)]">
          <FileText className="w-8 h-8 text-slate-500" />
        </div>
        <h3 className="text-lg font-medium text-white mb-2">No Scans Yet</h3>
        <p className="text-slate-400 text-sm max-w-md">
          You haven't scanned any URLs, messages, or documents. Start a scan to protect yourself from job fraud.
        </p>
      </div>
    )
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'url': return <Link2 className="w-4 h-4 text-blue-400" />
      case 'message': return <MessageSquareText className="w-4 h-4 text-purple-400" />
      case 'pdf': return <FileText className="w-4 h-4 text-orange-400" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="p-6 border-b border-[rgba(255,255,255,0.08)] flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">Recent Scans</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[rgba(255,255,255,0.02)] text-slate-400 text-xs uppercase tracking-wider">
              <th className="px-6 py-4 font-medium">Type</th>
              <th className="px-6 py-4 font-medium">Input / Subject</th>
              <th className="px-6 py-4 font-medium">Risk Score</th>
              <th className="px-6 py-4 font-medium">Result</th>
              <th className="px-6 py-4 font-medium">Date</th>
              {onDownloadReport && <th className="px-6 py-4 font-medium text-right">Action</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgba(255,255,255,0.04)] text-sm">
            {scans.map((scan) => (
              <tr key={scan.id} className="hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-[rgba(255,255,255,0.04)]">
                      {getIcon(scan.scan_type)}
                    </div>
                    <span className="capitalize font-medium text-slate-300">{scan.scan_type}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-300">
                  <div className="max-w-[200px] truncate" title={scan.input_data}>
                    {truncateText(scan.input_data, 40)}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">{scan.risk_score}/100</span>
                    <div className="w-16 h-2 rounded-full bg-[rgba(255,255,255,0.1)] overflow-hidden hidden sm:block">
                      <div 
                        className="h-full rounded-full transition-all duration-1000"
                        style={{ 
                          width: `${scan.risk_score}%`,
                          backgroundColor: scan.risk_score <= 30 ? '#22c55e' : scan.risk_score <= 60 ? '#eab308' : '#ef4444'
                        }}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={getScoreBadgeClass(getScoreLabel(scan.risk_score))}>
                    {getScoreLabel(scan.risk_score)}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-400">
                  {formatRelativeTime(scan.created_at)}
                </td>
                {onDownloadReport && (
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => onDownloadReport(scan)}
                      className="p-2 rounded-lg bg-[rgba(99,102,241,0.1)] text-indigo-400 hover:bg-indigo-500 hover:text-white transition-colors"
                      title="Download PDF Report"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
