import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Link2, MessageSquareText, FileText, ShieldAlert, LogOut } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { signOut } from '../services/supabase'

export default function Layout() {
  const { profile, isAdmin } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'URL Scanner', path: '/scan/url', icon: Link2 },
    { name: 'Message Analyzer', path: '/scan/message', icon: MessageSquareText },
    { name: 'Document Scanner', path: '/scan/pdf', icon: FileText },
    ...(isAdmin ? [{ name: 'Admin Panel', path: '/admin', icon: ShieldAlert }] : []),
  ]

  return (
    <div className="flex h-screen overflow-hidden bg-[#07070f] text-[#e2e8f0]">
      {/* Sidebar */}
      <aside className="w-64 border-r border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] flex flex-col hidden md:flex">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-[rgba(255,255,255,0.08)]">
          <div className="flex items-center gap-3 text-indigo-400 font-bold text-xl">
            <ShieldAlert className="w-6 h-6" />
            SafeHire AI
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-item ${isActive ? 'active' : ''}`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </NavLink>
          ))}
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-[rgba(255,255,255,0.08)]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
              {profile?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate text-white">{profile?.name}</div>
              <div className="text-xs text-slate-400 truncate">{profile?.email}</div>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Mobile Header */}
        <header className="h-16 md:hidden border-b border-[rgba(255,255,255,0.08)] bg-[#0d0d1a] flex items-center px-4 justify-between">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-lg">
            <ShieldAlert className="w-5 h-5" /> SafeHire
          </div>
          <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-white">
            <LogOut className="w-5 h-5" />
          </button>
        </header>

        <div className="flex-1 overflow-auto p-6 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
