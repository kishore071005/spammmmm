import { ShieldAlert } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="mt-12 pt-8 pb-6 border-t border-[rgba(255,255,255,0.06)]">
      <div className="flex flex-col items-center text-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
            <ShieldAlert className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-sm gradient-text">Scam Shield</span>
        </div>
        <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">
          Scam Shield leverages Artificial Intelligence and cyber threat intelligence to create
          a safer digital environment for students, professionals, and job seekers.
        </p>
        <p className="text-xs text-slate-600">
          © {new Date().getFullYear()} Scam Shield. Detect. Analyze. Protect.
        </p>
      </div>
    </footer>
  )
}
