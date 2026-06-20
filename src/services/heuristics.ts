// ── URL Heuristics Engine ─────────────────────────────────────
// Performs static analysis before AI call to enrich context.

const SUSPICIOUS_KEYWORDS = [
  'earn', 'hire-now', 'work-from-home', 'apply-instantly', 'get-rich',
  'job-offer', 'easy-money', 'guaranteed-job', 'no-experience', 'urgent-hiring',
  'free-money', 'investment', 'forex', 'crypto-job', 'mlm', 'pyramid',
  'join-now', 'limited-slots', 'secret-job', 'homebiz', 'makemoney',
]

const SUSPICIOUS_TLDS = ['.xyz', '.tk', '.ml', '.cf', '.ga', '.gq', '.pw', '.top', '.click', '.link', '.info']

const KNOWN_LEGIT_DOMAINS = [
  'linkedin.com', 'indeed.com', 'glassdoor.com', 'monster.com', 'naukri.com',
  'github.com', 'google.com', 'microsoft.com', 'amazon.com', 'apple.com',
  'facebook.com', 'twitter.com', 'instagram.com', 'youtube.com', 'reddit.com',
]

export interface HeuristicsResult {
  has_https: boolean
  url_length: number
  domain: string
  tld: string
  subdomain_count: number
  has_suspicious_keywords: boolean
  suspicious_keywords_found: string[]
  has_suspicious_tld: boolean
  has_ip_address: boolean
  has_homograph_risk: boolean
  is_known_legit: boolean
  heuristic_score: number
  flags: string[]
}

function extractDomain(url: string): { domain: string; tld: string; subdomains: string[] } {
  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`)
    const parts = parsed.hostname.split('.')
    const tld = parts.length >= 2 ? `.${parts[parts.length - 1]}` : ''
    const domain = parts.length >= 2 ? `${parts[parts.length - 2]}${tld}` : parsed.hostname
    const subdomains = parts.slice(0, -2)
    return { domain, tld, subdomains }
  } catch {
    return { domain: url, tld: '', subdomains: [] }
  }
}

function detectHomograph(hostname: string): boolean {
  // Check for look-alike Unicode characters
  const homographChars = /[а-яёА-ЯЁ\u0370-\u03FF\u0400-\u04FF\u0600-\u06FF]/
  return homographChars.test(hostname)
}

function detectIpAddress(url: string): boolean {
  const ipPattern = /https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/
  return ipPattern.test(url)
}

export function analyzeUrlHeuristics(url: string): HeuristicsResult {
  const flags: string[] = []
  let score = 0

  // Protocol check
  const has_https = url.startsWith('https://')
  if (!has_https) {
    flags.push('No HTTPS – connection is not encrypted')
    score += 20
  }

  // Parse domain
  const { domain, tld, subdomains } = extractDomain(url)

  // URL length
  const url_length = url.length
  if (url_length > 100) {
    flags.push(`Unusually long URL (${url_length} characters)`)
    score += 10
  }

  // Suspicious keywords
  const lowerUrl = url.toLowerCase()
  const suspicious_keywords_found = SUSPICIOUS_KEYWORDS.filter(kw => lowerUrl.includes(kw))
  const has_suspicious_keywords = suspicious_keywords_found.length > 0
  if (has_suspicious_keywords) {
    flags.push(`Suspicious keywords: ${suspicious_keywords_found.join(', ')}`)
    score += Math.min(suspicious_keywords_found.length * 10, 30)
  }

  // Suspicious TLD
  const has_suspicious_tld = SUSPICIOUS_TLDS.includes(tld)
  if (has_suspicious_tld) {
    flags.push(`High-risk TLD: "${tld}"`)
    score += 25
  }

  // Subdomain abuse
  const subdomain_count = subdomains.length
  if (subdomain_count > 2) {
    flags.push(`Excessive subdomains (${subdomain_count}) – possible domain masking`)
    score += 15
  }

  // IP address
  const has_ip_address = detectIpAddress(url)
  if (has_ip_address) {
    flags.push('URL uses raw IP address instead of domain name')
    score += 30
  }

  // Homograph
  const has_homograph_risk = detectHomograph(domain)
  if (has_homograph_risk) {
    flags.push('Potential homograph attack – non-ASCII characters in domain')
    score += 35
  }

  // Known legit domain
  const is_known_legit = KNOWN_LEGIT_DOMAINS.some(d => domain.includes(d))
  if (is_known_legit) {
    score = Math.max(0, score - 20)
  }

  const heuristic_score = Math.min(100, score)

  return {
    has_https,
    url_length,
    domain,
    tld,
    subdomain_count,
    has_suspicious_keywords,
    suspicious_keywords_found,
    has_suspicious_tld,
    has_ip_address,
    has_homograph_risk,
    is_known_legit,
    heuristic_score,
    flags,
  }
}

// ── Rate Limiter ──────────────────────────────────────────────
// Simple in-memory rate limiter per scan type (client-side guard)
const scanTimestamps: Record<string, number[]> = {}
const RATE_LIMIT = { maxCalls: 10, windowMs: 60_000 }

export function checkRateLimit(key: string): boolean {
  const now = Date.now()
  if (!scanTimestamps[key]) scanTimestamps[key] = []
  
  // Remove old timestamps
  scanTimestamps[key] = scanTimestamps[key].filter(ts => now - ts < RATE_LIMIT.windowMs)
  
  if (scanTimestamps[key].length >= RATE_LIMIT.maxCalls) {
    return false
  }
  
  scanTimestamps[key].push(now)
  return true
}

// ── Score Helpers ─────────────────────────────────────────────
export function getScoreColor(score: number): string {
  if (score <= 30) return '#22c55e'
  if (score <= 60) return '#eab308'
  return '#ef4444'
}

export function getScoreLabel(score: number): 'Safe' | 'Suspicious' | 'Fraud' {
  if (score <= 30) return 'Safe'
  if (score <= 60) return 'Suspicious'
  return 'Fraud'
}

export function getScoreBadgeClass(classification: string): string {
  switch (classification) {
    case 'Safe': return 'badge-safe'
    case 'Suspicious': return 'badge-suspicious'
    case 'Fraud': return 'badge-fraud'
    default: return 'badge-suspicious'
  }
}

// ── Format helpers ────────────────────────────────────────────
export function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}
