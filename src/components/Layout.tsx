import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Link2, MessageSquareText, FileText, ShieldAlert,
  LogOut, ChevronLeft, ChevronRight, Menu, X
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { signOut } from '../services/supabase'

export default function Layout() {
  const { profile, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

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

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className={`h-16 flex items-center border-b border-[rgba(255,255,255,0.08)] ${collapsed ? 'justify-center px-2' : 'px-6'}`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', boxShadow: '0 0 20px rgba(99,102,241,0.4)' }}>
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div>
              <span className="font-bold text-lg gradient-text tracking-tight">Scam Shield</span>
              <p className="text-[10px] text-slate-500 leading-none mt-0.5">AI Fraud Detection</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        <div className={`text-[10px] uppercase tracking-widest text-slate-500 font-semibold mb-3 ${collapsed ? 'text-center' : 'px-3'}`}>
          {collapsed ? '•••' : 'Main Menu'}
        </div>
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `sidebar-item group ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-2' : ''}`
            }
            title={collapsed ? item.name : undefined}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>{item.name}</span>}
            {collapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-dark-600 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                {item.name}
              </div>
            )}
          </NavLink>
        ))}
      </div>

      {/* Collapse Toggle (desktop only) */}
      <div className="hidden md:block px-3 py-2 border-t border-[rgba(255,255,255,0.06)]">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs text-slate-500 hover:text-slate-300 hover:bg-[rgba(255,255,255,0.04)] rounded-lg transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <><ChevronLeft className="w-4 h-4" /><span>Collapse</span></>}
        </button>
      </div>

      {/* User Profile */}
      <div className="p-3 border-t border-[rgba(255,255,255,0.08)]">
        <div className={`flex items-center gap-3 mb-3 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
            {profile?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate text-white">{profile?.name}</div>
              <div className="text-xs text-slate-500 truncate">{profile?.email}</div>
            </div>
          )}
        </div>
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-400/10 rounded-lg transition-colors ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? 'Sign Out' : undefined}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-dark-900 text-[#e2e8f0]">
      {/* Desktop Sidebar */}
      <aside className={`${collapsed ? 'w-[72px]' : 'w-64'} border-r border-[rgba(255,255,255,0.06)] bg-dark-800/50 backdrop-blur-xl flex-col hidden md:flex transition-all duration-300 relative`}>
        <SidebarContent />
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 bg-dark-800 border-r border-[rgba(255,255,255,0.08)] flex flex-col z-50 animate-slide-up">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Mobile Header */}
        <header className="h-14 md:hidden border-b border-[rgba(255,255,255,0.08)] bg-dark-800/80 backdrop-blur-xl flex items-center px-4 justify-between">
          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-[rgba(255,255,255,0.06)] transition-colors">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
              <ShieldAlert className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm gradient-text">Scam Shield</span>
          </div>
          <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-white">
            <LogOut className="w-5 h-5" />
          </button>
        </header>

        <div className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto p-6 md:p-8">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  )
}
