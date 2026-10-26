import React, { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { Zap, Brain, FileSearch, MessageSquare, Star, ChevronRight, ArrowRight, Upload, Play, BarChart2 } from 'lucide-react'
import Navbar from '../components/Navbar.jsx'

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
}

function Section({ children, className = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })
  return (
    <motion.section
      ref={ref}
      variants={fadeUp}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      transition={{ duration: 0.6 }}
      className={className}
    >
      {children}
    </motion.section>
  )
}

const features = [
  {
    icon: FileSearch,
    title: 'Resume Analysis',
    desc: 'Upload your resume and our AI extracts skills, experiences, and technologies to craft personalized questions.',
    color: 'from-brand-500/20 to-brand-600/5 border-brand-500/20',
    iconColor: 'text-brand-400 bg-brand-400/10',
  },
  {
    icon: Brain,
    title: 'AI-Powered Questions',
    desc: 'RAG-powered system generates role-specific questions based on your background, target role, and experience level.',
    color: 'from-purple-500/20 to-purple-600/5 border-purple-500/20',
    iconColor: 'text-purple-400 bg-purple-400/10',
  },
  {
    icon: MessageSquare,
    title: 'Instant Feedback',
    desc: 'Get detailed AI feedback on every answer with scores, strengths, areas to improve, and model answers.',
    color: 'from-cyan-500/20 to-cyan-600/5 border-cyan-500/20',
    iconColor: 'text-cyan-400 bg-cyan-400/10',
  },
]

const steps = [
  { icon: Upload, step: '01', title: 'Upload Your Resume', desc: 'Upload your resume in PDF or Word format. Our AI parses and understands your complete profile.', color: 'text-brand-400' },
  { icon: Play, step: '02', title: 'Start Your Interview', desc: 'Choose your target role and experience level. The AI generates 10 tailored interview questions just for you.', color: 'text-purple-400' },
  { icon: BarChart2, step: '03', title: 'Get Detailed Feedback', desc: 'Receive instant AI feedback on every answer with scores, insights, and a comprehensive final report.', color: 'text-cyan-400' },
]

const stats = [
  { value: '10K+', label: 'Questions Generated' },
  { value: '95%', label: 'User Satisfaction' },
  { value: '500+', label: 'Companies Covered' },
  { value: '24/7', label: 'AI Availability' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32 px-4">
        {/* Background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-600/20 rounded-full filter blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent-purple/15 rounded-full filter blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-accent-cyan/10 rounded-full filter blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500/10 border border-brand-500/20 rounded-full text-brand-400 text-sm font-medium mb-8"
          >
            <Zap size={14} fill="currentColor" />
            AI-Powered Interview Preparation
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6"
          >
            Ace Your Next{' '}
            <span className="bg-gradient-to-r from-brand-400 via-accent-purple to-accent-cyan bg-clip-text text-transparent">
              Tech Interview
            </span>{' '}
            with AI
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Upload your resume and let our RAG-powered AI generate personalized interview questions, evaluate your answers in real-time, and provide expert feedback to help you land your dream job.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/register" className="btn-primary flex items-center gap-2 text-base px-8 py-4">
              Get Started Free <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn-secondary flex items-center gap-2 text-base px-8 py-4">
              Sign In <ChevronRight size={18} />
            </Link>
          </motion.div>

          {/* Hero Visual */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-16 relative"
          >
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 max-w-2xl mx-auto shadow-2xl animate-float">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="ml-2 text-white/30 text-sm font-mono">AI Interview Session</span>
              </div>
              <div className="space-y-3 text-left">
                <div className="bg-brand-500/10 border border-brand-500/20 rounded-xl p-4">
                  <p className="text-brand-400 text-xs font-semibold mb-1">QUESTION 3 of 10 · Technical</p>
                  <p className="text-white text-sm">Explain the difference between useEffect and useLayoutEffect in React. When would you use each?</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-white/40 text-xs mb-2">YOUR ANSWER</p>
                  <p className="text-white/70 text-sm">useEffect runs asynchronously after the browser paints, while useLayoutEffect runs synchronously before the paint. I'd use useLayoutEffect when...</p>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex items-center justify-between">
                  <span className="text-emerald-400 text-sm font-semibold">AI Score</span>
                  <span className="text-emerald-400 font-bold text-lg">8.5/10</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <Section className="py-16 px-4 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <p className="text-4xl font-extrabold bg-gradient-to-r from-brand-400 to-accent-purple bg-clip-text text-transparent">{stat.value}</p>
              <p className="text-white/50 mt-1 font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Features Section */}
      <Section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Everything You Need to <span className="gradient-text">Succeed</span></h2>
            <p className="text-white/50 text-lg max-w-xl mx-auto">Our AI-powered platform covers every aspect of interview preparation from resume analysis to detailed feedback.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                whileHover={{ y: -5 }}
                className={`bg-gradient-to-br ${f.color} border rounded-2xl p-6 hover:shadow-xl transition-all duration-300`}
              >
                <div className={`w-12 h-12 rounded-xl ${f.iconColor} flex items-center justify-center mb-4`}>
                  <f.icon size={24} />
                </div>
                <h3 className="text-white text-xl font-bold mb-3">{f.title}</h3>
                <p className="text-white/60 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* How It Works */}
      <Section className="py-24 px-4 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">How It <span className="gradient-text">Works</span></h2>
            <p className="text-white/50 text-lg">Three simple steps to interview success</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="relative text-center"
              >
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-px bg-gradient-to-r from-white/20 to-transparent" />
                )}
                <div className={`w-16 h-16 mx-auto rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 ${s.color}`}>
                  <s.icon size={28} />
                </div>
                <div className={`text-5xl font-black ${s.color} opacity-20 mb-2`}>{s.step}</div>
                <h3 className="text-white text-lg font-bold mb-2">{s.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* CTA Section */}
      <Section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-gradient-to-br from-brand-600/20 to-accent-purple/20 border border-brand-500/20 rounded-3xl p-12">
            <div className="flex justify-center mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={24} className="text-yellow-400" fill="currentColor" />
              ))}
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Land Your Dream Job?</h2>
            <p className="text-white/60 mb-8">Join thousands of developers who've aced their interviews with InterviewAI</p>
            <Link to="/register" className="btn-primary inline-flex items-center gap-2 text-base px-8 py-4">
              Start Practicing Free <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </Section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-brand-500 to-accent-purple rounded-lg flex items-center justify-center">
              <Zap size={14} className="text-white" fill="currentColor" />
            </div>
            <span className="text-white/60 font-medium">InterviewAI</span>
          </div>
          <p className="text-white/30 text-sm">© {new Date().getFullYear()} InterviewAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
