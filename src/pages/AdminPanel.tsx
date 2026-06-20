import { useEffect, useState } from 'react'
import { ShieldAlert, Trash2, Plus, Users, Search } from 'lucide-react'
import { getAllScans, getAllUsers, getBlacklistedDomains, addBlacklistedDomain, removeBlacklistedDomain } from '../services/supabase'
import { formatRelativeTime } from '../services/heuristics'
import toast from 'react-hot-toast'

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<'blacklist' | 'users' | 'scans'>('blacklist')
  
  // Data
  const [blacklist, setBlacklist] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [scans, setScans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Blacklist form
  const [newDomain, setNewDomain] = useState('')
  const [threatType, setThreatType] = useState('scam')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [blRes, usersRes, scansRes] = await Promise.all([
        getBlacklistedDomains(),
        getAllUsers(),
        getAllScans(50)
      ])
      
      if (blRes.data) setBlacklist(blRes.data)
      if (usersRes.data) setUsers(usersRes.data)
      if (scansRes.data) setScans(scansRes.data)
    } catch (err: any) {
      toast.error('Failed to load admin data: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newDomain.trim()) return

    try {
      const { data, error } = await addBlacklistedDomain({
        domain_name: newDomain.toLowerCase().trim(),
        threat_type: threatType,
        notes: notes.trim()
      })
      
      if (error) throw error
      
      toast.success('Domain added to blacklist')
      setBlacklist([data, ...blacklist])
      setNewDomain('')
      setNotes('')
    } catch (err: any) {
      toast.error('Failed to add domain: ' + err.message)
    }
  }

  const handleRemoveDomain = async (id: string) => {
    try {
      const { error } = await removeBlacklistedDomain(id)
      if (error) throw error
      toast.success('Domain removed')
      setBlacklist(blacklist.filter(d => d.id !== id))
    } catch (err: any) {
      toast.error('Failed to remove domain: ' + err.message)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      <header>
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <ShieldAlert className="w-8 h-8 text-red-500" />
          Admin Panel
        </h1>
        <p className="text-slate-400">Manage platform security, blacklisted domains, and monitor activity.</p>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-[rgba(255,255,255,0.08)]">
        {(['blacklist', 'users', 'scans'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 font-medium text-sm transition-colors relative ${
              activeTab === tab ? 'text-indigo-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
            )}
          </button>
        ))}
      </div>

      <div className="animate-slide-up">
        {loading ? (
          <div className="glass-card p-12 flex justify-center"><div className="spinner w-8 h-8" /></div>
        ) : (
          <>
            {/* BLACKLIST TAB */}
            {activeTab === 'blacklist' && (
              <div className="space-y-6">
                <div className="glass-card p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Add Domain to Blacklist</h3>
                  <form onSubmit={handleAddDomain} className="flex flex-wrap gap-4 items-end">
                    <div className="flex-1 min-w-[200px]">
                      <label className="block text-xs text-slate-400 mb-1">Domain Name</label>
                      <input type="text" value={newDomain} onChange={e => setNewDomain(e.target.value)} placeholder="example-scam.com" className="cyber-input py-2" required />
                    </div>
                    <div className="w-40">
                      <label className="block text-xs text-slate-400 mb-1">Threat Type</label>
                      <select value={threatType} onChange={e => setThreatType(e.target.value)} className="cyber-input py-2 bg-[#0a0a0f]">
                        <option value="scam">Scam</option>
                        <option value="phishing">Phishing</option>
                        <option value="malware">Malware</option>
                        <option value="fake_jobs">Fake Jobs</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="flex-1 min-w-[200px]">
                      <label className="block text-xs text-slate-400 mb-1">Notes (Optional)</label>
                      <input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Why is this blocked?" className="cyber-input py-2" />
                    </div>
                    <button type="submit" className="btn-glow py-2 px-6 flex items-center gap-2">
                      <Plus className="w-4 h-4" /> Add
                    </button>
                  </form>
                </div>

                <div className="glass-card overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[rgba(255,255,255,0.02)] text-slate-400 text-xs uppercase tracking-wider">
                        <th className="px-6 py-4 font-medium">Domain</th>
                        <th className="px-6 py-4 font-medium">Type</th>
                        <th className="px-6 py-4 font-medium">Notes</th>
                        <th className="px-6 py-4 font-medium">Added</th>
                        <th className="px-6 py-4 font-medium text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[rgba(255,255,255,0.04)] text-sm">
                      {blacklist.map((b) => (
                        <tr key={b.id} className="hover:bg-[rgba(255,255,255,0.02)]">
                          <td className="px-6 py-4 font-mono text-red-400">{b.domain_name}</td>
                          <td className="px-6 py-4 text-slate-300 capitalize">{b.threat_type.replace('_', ' ')}</td>
                          <td className="px-6 py-4 text-slate-400">{b.notes || '-'}</td>
                          <td className="px-6 py-4 text-slate-400">{formatRelativeTime(b.created_at)}</td>
                          <td className="px-6 py-4 text-right">
                            <button onClick={() => handleRemoveDomain(b.id)} className="text-slate-500 hover:text-red-400 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {blacklist.length === 0 && (
                        <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No blacklisted domains found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* USERS TAB */}
            {activeTab === 'users' && (
              <div className="glass-card overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[rgba(255,255,255,0.02)] text-slate-400 text-xs uppercase tracking-wider">
                      <th className="px-6 py-4 font-medium">Name</th>
                      <th className="px-6 py-4 font-medium">Email</th>
                      <th className="px-6 py-4 font-medium">Role</th>
                      <th className="px-6 py-4 font-medium">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgba(255,255,255,0.04)] text-sm">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-[rgba(255,255,255,0.02)]">
                        <td className="px-6 py-4 font-medium text-white flex items-center gap-2">
                          <Users className="w-4 h-4 text-slate-500" /> {u.name}
                        </td>
                        <td className="px-6 py-4 text-slate-300">{u.email}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${u.role === 'admin' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-500/20 text-slate-400'}`}>
                            {u.role.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-400">{new Date(u.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* SCANS TAB */}
            {activeTab === 'scans' && (
              <div className="glass-card overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[rgba(255,255,255,0.02)] text-slate-400 text-xs uppercase tracking-wider">
                      <th className="px-6 py-4 font-medium">User</th>
                      <th className="px-6 py-4 font-medium">Type</th>
                      <th className="px-6 py-4 font-medium">Risk Score</th>
                      <th className="px-6 py-4 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgba(255,255,255,0.04)] text-sm">
                    {scans.map((s) => (
                      <tr key={s.id} className="hover:bg-[rgba(255,255,255,0.02)]">
                        <td className="px-6 py-4 text-slate-300">{s.users?.name || 'Unknown User'}</td>
                        <td className="px-6 py-4 text-slate-300 capitalize">{s.scan_type}</td>
                        <td className="px-6 py-4">
                          <span className={`font-bold ${s.risk_score <= 30 ? 'text-green-400' : s.risk_score <= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                            {s.risk_score}/100
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-400">{formatRelativeTime(s.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
