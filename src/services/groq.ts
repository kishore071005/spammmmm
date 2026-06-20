// ── Groq API Service ──────────────────────────────────────────
// Direct API calls to Groq from the browser. API key is stored
// in VITE_GROQ_API_KEY and never exposed in source code.

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.3-70b-versatile'

function getApiKey(): string {
  const key = import.meta.env.VITE_GROQ_API_KEY as string
  if (!key) throw new Error('VITE_GROQ_API_KEY is not set in .env')
  return key
}

interface GroqMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface GroqResponse {
  choices: Array<{ message: { content: string } }>
}

// ── Core completion call ──────────────────────────────────────
async function groqCompletion(messages: GroqMessage[], temperature = 0.3): Promise<string> {
  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getApiKey()}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature,
      max_tokens: 2048,
      response_format: { type: 'json_object' },
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(`Groq API error ${response.status}: ${JSON.stringify(err)}`)
  }

  const data: GroqResponse = await response.json()
  return data.choices[0]?.message?.content ?? ''
}

// ── Streaming completion (for chatbot) ────────────────────────
export async function groqStream(
  messages: GroqMessage[],
  onChunk: (chunk: string) => void,
  onDone: () => void
): Promise<void> {
  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getApiKey()}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 1024,
      stream: true,
    }),
  })

  if (!response.ok) {
    throw new Error(`Groq API error: ${response.status}`)
  }

  const reader = response.body!.getReader()
  const decoder = new TextDecoder()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    const text = decoder.decode(value)
    const lines = text.split('\n').filter(l => l.startsWith('data: '))
    for (const line of lines) {
      const data = line.replace('data: ', '')
      if (data === '[DONE]') { onDone(); return }
      try {
        const parsed = JSON.parse(data)
        const chunk = parsed.choices?.[0]?.delta?.content ?? ''
        if (chunk) onChunk(chunk)
      } catch {
        // skip malformed chunks
      }
    }
  }
  onDone()
}

// ────────────────────────────────────────────────────────────────
// 1. URL FRAUD ANALYSIS
// ────────────────────────────────────────────────────────────────
export interface UrlAnalysisResult {
  risk_score: number
  classification: 'Safe' | 'Suspicious' | 'Fraud'
  explanation: string
  red_flags: string[]
  recommended_action: string
  technical_details: string
}

export async function analyzeUrl(
  url: string,
  heuristicsData: Record<string, unknown>
): Promise<UrlAnalysisResult> {
  const prompt = `You are a cybersecurity expert specializing in job-related URL fraud detection. Analyze the following URL and heuristic data.

URL: ${url}

Heuristic Pre-Analysis:
${JSON.stringify(heuristicsData, null, 2)}

Perform a deep analysis considering:
- HTTPS usage and SSL validity indicators
- Suspicious keywords (earn, hire-now, work-from-home, apply-instantly, get-rich, etc.)
- Domain age signals, TLD suspiciousness (.xyz, .info, .tk, etc.)
- Subdomain abuse and excessive subdomains
- Homograph/IDN attacks (look-alike characters)
- URL length and complexity
- Redirect patterns
- Known job scam patterns

Respond ONLY with valid JSON in this exact format:
{
  "risk_score": <integer 0-100>,
  "classification": "<Safe|Suspicious|Fraud>",
  "explanation": "<2-3 sentence summary of analysis>",
  "red_flags": ["<flag1>", "<flag2>"],
  "recommended_action": "<specific actionable advice>",
  "technical_details": "<technical breakdown>"
}`

  const raw = await groqCompletion([
    { role: 'system', content: 'You are a cybersecurity AI. Always respond with valid JSON only.' },
    { role: 'user', content: prompt },
  ])
  return JSON.parse(raw) as UrlAnalysisResult
}

// ────────────────────────────────────────────────────────────────
// 2. RECRUITER MESSAGE ANALYSIS
// ────────────────────────────────────────────────────────────────
export interface MessageAnalysisResult {
  fraud_score: number
  classification: 'Safe' | 'Suspicious' | 'Fraud'
  suspicious_phrases: string[]
  scam_indicators: {
    money_request: boolean
    urgency_tactics: boolean
    unrealistic_salary: boolean
    fake_interview: boolean
    personal_data_collection: boolean
    grammar_issues: boolean
    social_engineering: boolean
  }
  explanation: string
  safety_tips: string[]
  recommended_action: string
}

export async function analyzeMessage(message: string): Promise<MessageAnalysisResult> {
  const prompt = `You are an expert in detecting job recruitment fraud and social engineering attacks. Analyze this recruiter message for fraud indicators.

MESSAGE:
"""
${message}
"""

Analyze for:
1. Money or fee requests (upfront payments, training fees, equipment deposits)
2. Urgency/pressure tactics ("act now", "limited time", "immediate joining")
3. Unrealistic salary promises (extremely high pay for simple tasks)
4. Suspicious interview processes (no interview, instant offers, WhatsApp-only)
5. Personal data collection (bank details, SSN, passport copies)
6. Grammar and spelling issues typical of scam messages
7. Social engineering patterns (flattery, false authority, fear tactics)
8. Missing company details or vague job descriptions

Respond ONLY with valid JSON in this exact format:
{
  "fraud_score": <integer 0-100>,
  "classification": "<Safe|Suspicious|Fraud>",
  "suspicious_phrases": ["<exact phrase from message>"],
  "scam_indicators": {
    "money_request": <boolean>,
    "urgency_tactics": <boolean>,
    "unrealistic_salary": <boolean>,
    "fake_interview": <boolean>,
    "personal_data_collection": <boolean>,
    "grammar_issues": <boolean>,
    "social_engineering": <boolean>
  },
  "explanation": "<3-4 sentence detailed analysis>",
  "safety_tips": ["<tip1>", "<tip2>", "<tip3>"],
  "recommended_action": "<specific advice>"
}`

  const raw = await groqCompletion([
    { role: 'system', content: 'You are a job fraud detection AI. Always respond with valid JSON only.' },
    { role: 'user', content: prompt },
  ])
  return JSON.parse(raw) as MessageAnalysisResult
}

// ────────────────────────────────────────────────────────────────
// 3. PDF DOCUMENT ANALYSIS
// ────────────────────────────────────────────────────────────────
export interface PdfAnalysisResult {
  fraud_score: number
  classification: 'Safe' | 'Suspicious' | 'Fraud'
  summary: string
  dangerous_clauses: Array<{
    type: string
    text: string
    risk: 'high' | 'medium' | 'low'
    explanation: string
  }>
  issues_detected: {
    employment_bond: boolean
    hidden_charges: boolean
    penalty_clauses: boolean
    salary_inconsistency: boolean
    missing_company_details: boolean
    illegal_requirements: boolean
  }
  recommendations: string[]
  verdict: string
}

export async function analyzePdfText(text: string, filename: string): Promise<PdfAnalysisResult> {
  // Truncate if too long (Groq context window)
  const truncated = text.length > 8000 ? text.substring(0, 8000) + '\n[... truncated for analysis ...]' : text

  const prompt = `You are an employment law and fraud detection expert. Analyze this employment document for fraud, illegal clauses, and suspicious content.

Document: "${filename}"

CONTENT:
"""
${truncated}
"""

Detect and analyze:
1. Employment bonds (forced to stay for X years or pay penalty)
2. Hidden charges (training fees, security deposits, equipment costs)
3. Penalty clauses (excessive fines for leaving, NDAs that restrict future employment)
4. Salary inconsistencies (different amounts mentioned in different sections)
5. Missing company details (no address, registration number, contact)
6. Illegal requirements (unpaid overtime, waiving legal rights, illegal conditions)
7. Suspicious or vague language that could be exploited

Respond ONLY with valid JSON in this exact format:
{
  "fraud_score": <integer 0-100>,
  "classification": "<Safe|Suspicious|Fraud>",
  "summary": "<2-3 sentence document summary>",
  "dangerous_clauses": [
    {
      "type": "<clause type>",
      "text": "<exact or paraphrased clause>",
      "risk": "<high|medium|low>",
      "explanation": "<why this is concerning>"
    }
  ],
  "issues_detected": {
    "employment_bond": <boolean>,
    "hidden_charges": <boolean>,
    "penalty_clauses": <boolean>,
    "salary_inconsistency": <boolean>,
    "missing_company_details": <boolean>,
    "illegal_requirements": <boolean>
  },
  "recommendations": ["<recommendation1>", "<recommendation2>"],
  "verdict": "<final verdict and overall assessment>"
}`

  const raw = await groqCompletion([
    { role: 'system', content: 'You are an employment fraud detection AI. Always respond with valid JSON only.' },
    { role: 'user', content: prompt },
  ])
  return JSON.parse(raw) as PdfAnalysisResult
}

// ────────────────────────────────────────────────────────────────
// 4. CHATBOT (Security Advisor)
// ────────────────────────────────────────────────────────────────
export const CHATBOT_SYSTEM_PROMPT = `You are SafeHire AI's security advisor — a friendly, knowledgeable cybersecurity and employment fraud expert. You help users:

1. Understand job scam tactics and red flags
2. Verify if a URL, email, or company seems legitimate
3. Interpret scan results from the platform
4. Get advice on how to stay safe during job hunting
5. Report and escalate fraud cases

Guidelines:
- Be conversational, empathetic, and clear
- Provide specific, actionable advice
- When uncertain, recommend professional verification
- Never ask users for sensitive personal data
- Keep responses concise (2-4 paragraphs max)
- Use bullet points for lists`

export type ChatMessage = { role: 'user' | 'assistant'; content: string }
