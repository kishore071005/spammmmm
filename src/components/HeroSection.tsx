import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

// Placeholder for animated visual - could be replaced with Lottie or custom SVG animation
const AnimatedVisual: React.FC = () => (
  <motion.div
    className="w-64 h-64 bg-gradient-to-br from-brand-500 to-cyber-400 rounded-full opacity-30"
    animate={{ rotate: [0, 15, -15, 0] }}
    transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
  />
)

const HeroSection: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-dark-900 rounded-3xl glass-card p-10 mb-12">
      {/* Background gradient glow */}
      <div className="absolute inset-0 bg-hero-glow pointer-events-none" />

      <div className="relative flex flex-col md:flex-row items-center justify-between">
        {/* Left Side */}
        <motion.div
          className="max-w-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl font-extrabold text-white tracking-tight mb-4">
            SCAM SHIELD
          </h1>
          <h2 className="text-2xl font-semibold text-cyber-400 mb-6">
            AI Powered Protection Against Digital Recruitment Fraud
          </h2>
          <p className="text-lg text-slate-300 mb-8">
            Analyze suspicious URLs, recruiter messages, and employment documents using advanced Artificial Intelligence to identify scams before they become threats.
          </p>
          <div className="flex gap-4">
            <button className="px-6 py-3 bg-cyber-500 text-white rounded-lg hover:bg-cyber-600 transition flex items-center gap-2 shadow-glow-green">
              Start Security Scan <ArrowRight size={16} />
            </button>
            <button className="px-6 py-3 border border-white/30 text-white rounded-lg hover:bg-white/10 transition flex items-center gap-2 shadow-glow-brand">
              View Fraud Reports <ArrowRight size={16} />
            </button>
          </div>
          <p className="mt-6 text-sm text-slate-400">
            <span className="inline-block bg-white/10 rounded-full px-3 py-1">24/7 AI Threat Detection System</span>
          </p>
        </motion.div>

        {/* Right Side – animated visual */}
        <motion.div
          className="mt-8 md:mt-0"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <AnimatedVisual />
        </motion.div>
      </div>
    </section>
  )
}

export default HeroSection
