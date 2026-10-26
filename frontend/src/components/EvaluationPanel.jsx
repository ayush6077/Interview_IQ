import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, AlertTriangle, ChevronDown, ChevronUp, Star } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import clsx from 'clsx'

function ScoreBadge({ score }) {
  const color =
    score >= 8 ? 'from-emerald-500 to-green-400 shadow-emerald-500/30' :
    score >= 5 ? 'from-yellow-500 to-amber-400 shadow-yellow-500/30' :
    'from-red-500 to-rose-400 shadow-red-500/30'
  return (
    <div className={clsx('flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r text-white font-bold shadow-lg text-lg', color)}>
      <Star size={18} fill="currentColor" />
      {score}/10
    </div>
  )
}

export default function EvaluationPanel({ evaluation }) {
  const [showModel, setShowModel] = useState(false)
  if (!evaluation) return null
  const { score, feedback, strengths = [], improvements = [], modelAnswer } = evaluation

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      {/* Score + Feedback */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold text-lg">AI Evaluation</h3>
          <ScoreBadge score={score} />
        </div>
        <p className="text-white/70 leading-relaxed">{feedback}</p>
      </div>

      {/* Strengths + Improvements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {strengths.length > 0 && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
            <h4 className="text-emerald-400 font-semibold mb-3 flex items-center gap-2">
              <CheckCircle size={16} /> Strengths
            </h4>
            <ul className="space-y-2">
              {strengths.map((s, i) => (
                <li key={i} className="text-white/70 text-sm flex items-start gap-2">
                  <span className="text-emerald-400 mt-0.5 flex-shrink-0">✓</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}
        {improvements.length > 0 && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
            <h4 className="text-yellow-400 font-semibold mb-3 flex items-center gap-2">
              <AlertTriangle size={16} /> Areas to Improve
            </h4>
            <ul className="space-y-2">
              {improvements.map((s, i) => (
                <li key={i} className="text-white/70 text-sm flex items-start gap-2">
                  <span className="text-yellow-400 mt-0.5 flex-shrink-0">⚠</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Model Answer (collapsible) */}
      {modelAnswer && (
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <button
            onClick={() => setShowModel((v) => !v)}
            className="w-full flex items-center justify-between p-4 text-white/60 hover:text-white transition-colors"
          >
            <span className="font-semibold">View Model Answer</span>
            {showModel ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          <AnimatePresence>
            {showModel && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 text-white/70 prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown>{modelAnswer}</ReactMarkdown>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  )
}
