import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ── Auth Helpers ──────────────────────────────────────────────
export const signUp = async (email: string, password: string, name: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: name } },
  })
  return { data, error }
}

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  return { data, error }
}

export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}/` },
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// ── Profile Helpers ───────────────────────────────────────────
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()
  return { data, error }
}

export const updateUserProfile = async (userId: string, updates: { name?: string; avatar_url?: string }) => {
  const { data, error } = await supabase
    .from('users')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single()
  return { data, error }
}

// ── Scan Helpers ──────────────────────────────────────────────
export const saveScan = async (scan: {
  user_id: string
  scan_type: 'url' | 'message' | 'pdf'
  input_data: string
  risk_score: number
  result: Record<string, unknown>
  ai_analysis: Record<string, unknown>
}) => {
  const { data, error } = await supabase
    .from('scans')
    .insert(scan)
    .select()
    .single()
  return { data, error }
}

export const getUserScans = async (userId: string, limit = 20) => {
  const { data, error } = await supabase
    .from('scans')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  return { data, error }
}

export const getScanById = async (scanId: string) => {
  const { data, error } = await supabase
    .from('scans')
    .select('*')
    .eq('id', scanId)
    .single()
  return { data, error }
}

export const deleteScan = async (scanId: string) => {
  const { error } = await supabase.from('scans').delete().eq('id', scanId)
  return { error }
}

// ── Analytics Helpers ─────────────────────────────────────────
export const getScanStats = async (userId: string) => {
  const { data, error } = await supabase
    .from('scans')
    .select('scan_type, risk_score, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(100)
  return { data, error }
}

// ── Blacklist Helpers ─────────────────────────────────────────
export const getBlacklistedDomains = async () => {
  const { data, error } = await supabase
    .from('blacklisted_domains')
    .select('*')
    .order('created_at', { ascending: false })
  return { data, error }
}

export const addBlacklistedDomain = async (domain: {
  domain_name: string
  threat_type: string
  notes?: string
  added_by?: string
}) => {
  const { data, error } = await supabase
    .from('blacklisted_domains')
    .insert(domain)
    .select()
    .single()
  return { data, error }
}

export const removeBlacklistedDomain = async (id: string) => {
  const { error } = await supabase.from('blacklisted_domains').delete().eq('id', id)
  return { error }
}

// ── Admin Helpers ─────────────────────────────────────────────
export const getAllScans = async (limit = 50) => {
  const { data, error } = await supabase
    .from('scans')
    .select('*, users(name, email)')
    .order('created_at', { ascending: false })
    .limit(limit)
  return { data, error }
}

export const getAllUsers = async () => {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, role, created_at')
    .order('created_at', { ascending: false })
  return { data, error }
}

// ── Reports Helpers ───────────────────────────────────────────
export const saveReport = async (scanId: string, pdfUrl?: string) => {
  const { data, error } = await supabase
    .from('reports')
    .insert({ scan_id: scanId, pdf_url: pdfUrl })
    .select()
    .single()
  return { data, error }
}

export const getUserReports = async (userId: string) => {
  const { data, error } = await supabase
    .from('reports')
    .select('*, scans!inner(user_id, scan_type, risk_score, created_at)')
    .eq('scans.user_id', userId)
    .order('generated_at', { ascending: false })
  return { data, error }
}

// ── Audit Log ─────────────────────────────────────────────────
export const logAudit = async (entry: {
  user_id: string
  action: string
  resource_type?: string
  resource_id?: string
  metadata?: Record<string, unknown>
}) => {
  await supabase.from('audit_logs').insert(entry)
}
