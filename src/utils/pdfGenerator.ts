import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { getScoreLabel } from '../services/heuristics'

interface ReportData {
  user: { name: string; email: string }
  scan: {
    id: string
    scan_type: string
    input_data: string
    risk_score: number
    created_at: string
  }
  analysis: Record<string, unknown>
}

function getRiskColor(score: number): [number, number, number] {
  if (score <= 30) return [34, 197, 94]    // green
  if (score <= 60) return [234, 179, 8]    // yellow
  return [239, 68, 68]                      // red
}

function addHeader(doc: jsPDF, pageWidth: number) {
  // Background header
  doc.setFillColor(13, 13, 26)
  doc.rect(0, 0, pageWidth, 40, 'F')

  // Accent stripe
  doc.setFillColor(99, 102, 241)
  doc.rect(0, 0, 4, 40, 'F')

  // Logo text
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(129, 140, 248)
  doc.text('🛡 SafeHire AI', 14, 18)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(148, 163, 184)
  doc.text('AI-Powered Job Fraud Detection Platform', 14, 27)
  doc.text('CONFIDENTIAL SECURITY REPORT', pageWidth - 14, 18, { align: 'right' })
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - 14, 27, { align: 'right' })
}

function addRiskGauge(doc: jsPDF, score: number, x: number, y: number) {
  const [r, g, b] = getRiskColor(score)

  // Gauge background bar
  doc.setFillColor(30, 30, 50)
  doc.roundedRect(x, y, 120, 8, 4, 4, 'F')

  // Filled portion
  doc.setFillColor(r, g, b)
  doc.roundedRect(x, y, (score / 100) * 120, 8, 4, 4, 'F')

  // Label
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(r, g, b)
  doc.text(`Risk Score: ${score}/100 – ${getScoreLabel(score)}`, x, y - 3)
}

export function generatePdfReport(data: ReportData): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const { user, scan, analysis } = data

  // ── Header ──
  addHeader(doc, pageWidth)

  let y = 50

  // ── User Info Section ──
  doc.setFillColor(20, 20, 38)
  doc.roundedRect(10, y, pageWidth - 20, 24, 4, 4, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(148, 163, 184)
  doc.text('USER DETAILS', 16, y + 6)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(226, 232, 240)
  doc.text(`Name: ${user.name}`, 16, y + 14)
  doc.text(`Email: ${user.email}`, 16, y + 20)
  doc.text(`Scan ID: ${scan.id.slice(0, 8)}...`, pageWidth / 2, y + 14)
  doc.text(`Date: ${new Date(scan.created_at).toLocaleString()}`, pageWidth / 2, y + 20)
  doc.text(`Scan Type: ${scan.scan_type.toUpperCase()}`, pageWidth - 14, y + 14, { align: 'right' })

  y += 32

  // ── Risk Score ──
  addRiskGauge(doc, scan.risk_score, 10, y + 8)
  y += 22

  // ── Submitted Content ──
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(129, 140, 248)
  doc.text('SUBMITTED CONTENT', 10, y)
  y += 5

  doc.setFillColor(15, 15, 30)
  const contentLines = doc.splitTextToSize(
    scan.scan_type === 'pdf'
      ? `Document analysis for: ${scan.input_data}`
      : scan.input_data,
    pageWidth - 24
  )
  const contentHeight = contentLines.length * 5 + 8
  doc.roundedRect(10, y, pageWidth - 20, contentHeight, 3, 3, 'F')
  doc.setFont('courier', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(148, 163, 184)
  doc.text(contentLines, 14, y + 6)
  y += contentHeight + 8

  // ── AI Analysis Sections (dynamic by scan type) ──
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(129, 140, 248)
  doc.text('AI ANALYSIS', 10, y)
  y += 6

  if (analysis.explanation || analysis.summary) {
    const explanationText = (analysis.explanation || analysis.summary) as string
    const lines = doc.splitTextToSize(explanationText, pageWidth - 24)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(226, 232, 240)
    doc.text(lines, 10, y)
    y += lines.length * 5 + 6
  }

  // ── Red Flags / Suspicious Phrases ──
  const redFlags = (analysis.red_flags || analysis.suspicious_phrases || []) as string[]
  if (redFlags.length > 0) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(239, 68, 68)
    doc.text('RED FLAGS DETECTED', 10, y)
    y += 5
    autoTable(doc, {
      startY: y,
      head: [['#', 'Flag / Suspicious Phrase']],
      body: redFlags.map((f, i) => [i + 1, f]),
      theme: 'plain',
      styles: { fillColor: [20, 20, 38], textColor: [226, 232, 240], fontSize: 9 },
      headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255] },
      margin: { left: 10, right: 10 },
    })
    y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8
  }

  // ── Dangerous Clauses (PDF scan) ──
  const clauses = analysis.dangerous_clauses as Array<{ type: string; text: string; risk: string; explanation: string }> | undefined
  if (clauses && clauses.length > 0) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(239, 68, 68)
    doc.text('DANGEROUS CLAUSES', 10, y)
    y += 5
    autoTable(doc, {
      startY: y,
      head: [['Type', 'Risk', 'Details']],
      body: clauses.map(c => [c.type, c.risk.toUpperCase(), `${c.text}\n→ ${c.explanation}`]),
      theme: 'plain',
      styles: { fillColor: [20, 20, 38], textColor: [226, 232, 240], fontSize: 8 },
      headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255] },
      margin: { left: 10, right: 10 },
    })
    y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8
  }

  // ── Recommendations / Safety Tips ──
  const recs = (analysis.recommendations || analysis.safety_tips || []) as string[]
  if (recs.length > 0) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(34, 197, 94)
    doc.text('RECOMMENDATIONS', 10, y)
    y += 5
    autoTable(doc, {
      startY: y,
      head: [['#', 'Recommendation']],
      body: recs.map((r, i) => [i + 1, r]),
      theme: 'plain',
      styles: { fillColor: [20, 20, 38], textColor: [226, 232, 240], fontSize: 9 },
      headStyles: { fillColor: [22, 163, 74], textColor: [255, 255, 255] },
      margin: { left: 10, right: 10 },
    })
    y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8
  }

  // ── Verdict / Recommended Action ──
  const verdict = (analysis.recommended_action || analysis.verdict) as string
  if (verdict) {
    const [r, g, b] = getRiskColor(scan.risk_score)
    doc.setFillColor(r, g, b, 0.1)
    doc.setDrawColor(r, g, b)
    doc.setLineWidth(0.5)
    const verdictLines = doc.splitTextToSize(`FINAL VERDICT: ${verdict}`, pageWidth - 28)
    const vHeight = verdictLines.length * 5 + 10
    doc.roundedRect(10, y, pageWidth - 20, vHeight, 4, 4, 'D')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(r, g, b)
    doc.text(verdictLines, 14, y + 7)
    y += vHeight + 8
  }

  // ── Footer ──
  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    const pw = doc.internal.pageSize.getWidth()
    const ph = doc.internal.pageSize.getHeight()
    doc.setFillColor(13, 13, 26)
    doc.rect(0, ph - 12, pw, 12, 'F')
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(71, 85, 105)
    doc.text('SafeHire AI – Confidential Security Report. For authorized use only.', pw / 2, ph - 5, { align: 'center' })
    doc.text(`Page ${i} of ${totalPages}`, pw - 14, ph - 5, { align: 'right' })
  }

  // ── Save ──
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  doc.save(`SafeHire-Report-${scan.scan_type}-${timestamp}.pdf`)
}
