import React from 'react'
import { motion } from 'framer-motion'
import clsx from 'clsx'
import { Tag, BarChart2 } from 'lucide-react'

const difficultyColor = {
  easy: 'text-emerald-400 bg-emerald-400/10',
  medium: 'text-yellow-400 bg-yellow-400/10',
  hard: 'text-red-400 bg-red-400/10',
}

const typeColor = {
  technical: 'text-brand-400 bg-brand-400/10',
  behavioral: 'text-purple-400 bg-purple-400/10',
  situational: 'text-cyan-400 bg-cyan-400/10',
  conceptual: 'text-orange-400 bg-orange-400/10',
}

export default function QuestionCard({ question, questionNumber, type = 'technical', difficulty = 'medium' }) {
  return (
    <motion.div
      key={questionNumber}
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -60 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-xl"
    >
      <div className="flex items-center gap-3 mb-4">
        <span className="text-white/40 text-sm font-medium">Question {questionNumber}</span>
        <div className="flex items-center gap-2">
          <span className={clsx('flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold capitalize', typeColor[type] || typeColor.technical)}>
            <Tag size={10} />
            {type}
          </span>
          <span className={clsx('flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold capitalize', difficultyColor[difficulty] || difficultyColor.medium)}>
            <BarChart2 size={10} />
            {difficulty}
          </span>
        </div>
      </div>
      <p className="text-white text-lg leading-relaxed font-medium">{question}</p>
    </motion.div>
  )
}
