import { motion } from 'framer-motion'
import { ArrowRight, Shield, Zap, Lock, Wifi, Eye } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

/* Animated cyber shield SVG with floating particles */
function AnimatedShield() {
  return (
    <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">
      {/* Outer pulsing ring */}
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-brand-500/30"
        animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.1, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Middle ring */}
      <motion.div
        className="absolute inset-4 rounded-full border border-cyber-400/20"
        animate={{ scale: [1, 1.08, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
      />
      {/* Inner glowing circle */}
      <motion.div
        className="absolute inset-8 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)' }}
        animate={{ scale: [0.95, 1.05, 0.95] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Central shield */}
      <motion.div
        className="relative z-10 w-24 h-24 md:w-28 md:h-28 rounded-2xl flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', boxShadow: '0 0 60px rgba(99,102,241,0.5), 0 0 120px rgba(99,102,241,0.2)' }}
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Shield className="w-12 h-12 md:w-14 md:h-14 text-white" />
      </motion.div>

      {/* Floating icons */}
      {[
        { Icon: Lock, x: -90, y: -60, delay: 0 },
        { Icon: Wifi, x: 90, y: -40, delay: 0.8 },
        { Icon: Eye, x: -80, y: 60, delay: 1.6 },
        { Icon: Zap, x: 85, y: 55, delay: 2.4 },
      ].map(({ Icon, x, y, delay }, i) => (
        <motion.div
          key={i}
          className="absolute w-10 h-10 rounded-xl bg-dark-600/80 backdrop-blur border border-[rgba(255,255,255,0.08)] flex items-center justify-center"
          style={{ left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)` }}
          animate={{ y: [0, -10, 0], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay }}
        >
          <Icon className="w-4 h-4 text-brand-400" />
        </motion.div>
      ))}

      {/* Floating particles */}
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.div
          key={`p-${i}`}
          className="absolute w-1.5 h-1.5 rounded-full bg-cyber-400/60"
          style={{
            left: `${20 + Math.random() * 60}%`,
            top: `${20 + Math.random() * 60}%`,
          }}
          animate={{
            y: [0, -20 - Math.random() * 30, 0],
            x: [0, (Math.random() - 0.5) * 20, 0],
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: i * 0.5,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

export default function HeroSection() {
  const navigate = useNavigate()
  const { profile } = useAuth()

  return (
    <section className="relative overflow-hidden rounded-2xl mb-2">
      {/* Background glow */}
      <div className="absolute inset-0 bg-hero-glow pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyber-400/5 rounded-full blur-3xl" />

      <div className="relative glass-card p-8 md:p-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Left Content */}
          <motion.div
            className="max-w-xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            {/* Greeting */}
            <motion.p
              className="text-sm text-slate-400 mb-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Welcome back, <span className="text-brand-400 font-medium">{profile?.name?.split(' ')[0] || 'Agent'}</span>
            </motion.p>

            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-3 leading-tight">
              SCAM <span className="gradient-text">SHIELD</span>
            </h1>

            <h2 className="text-lg md:text-xl font-semibold text-cyber-400 mb-4">
              AI Powered Protection Against Digital Recruitment Fraud
            </h2>

            <p className="text-base text-slate-400 mb-8 leading-relaxed max-w-lg">
              Analyze suspicious URLs, recruiter messages, and employment documents using advanced
              Artificial Intelligence to identify scams before they become threats.
            </p>

            <div className="flex flex-wrap gap-3 mb-6">
              <button
                onClick={() => navigate('/scan/url')}
                className="btn-glow flex items-center gap-2 text-sm"
              >
                Start Security Scan <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate('/scan/pdf')}
                className="px-5 py-3 text-sm font-semibold rounded-xl border border-[rgba(255,255,255,0.12)] text-slate-200 hover:bg-[rgba(255,255,255,0.06)] hover:border-brand-500/40 transition-all duration-300"
              >
                View Fraud Reports
              </button>
            </div>

            {/* Trust Badge */}
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyber-400/10 border border-cyber-400/20"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
            >
              <div className="w-2 h-2 rounded-full bg-cyber-400 animate-pulse-slow" />
              <span className="text-xs font-medium text-cyber-400">24/7 AI Threat Detection System</span>
            </motion.div>
          </motion.div>

          {/* Right Visual */}
          <motion.div
            className="hidden md:flex"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <AnimatedShield />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
