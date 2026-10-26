import React from 'react'
import { motion } from 'framer-motion'
import { Briefcase, Calendar, ChevronRight, Clock, CheckCircle, XCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'

function StatusBadge({ status }) {
  const statusMap = {
    completed: { icon: CheckCircle, color: 'text-emerald-400 bg-emerald-400/10', label: 'Completed' },
    active: { icon: Clock, color: 'text-brand-400 bg-brand-400/10', label: 'In Progress' },
    pending: { icon: Clock, color: 'text-yellow-400 bg-yellow-400/10', label: 'Pending' },
    failed: { icon: XCircle, color: 'text-red-400 bg-red-400/10', label: 'Failed' },
  }
  const s = statusMap[status] || statusMap.pending
  const Icon = s.icon
  return (
    <span className={clsx('flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold', s.color)}>
      <Icon size={12} />
      {s.label}
    </span>
  )
}

function ScoreBadge({ score }) {
  if (score == null) return null
  const color =
    score >= 8 ? 'text-emerald-400 bg-emerald-400/10' :
    score >= 5 ? 'text-yellow-400 bg-yellow-400/10' :
    'text-red-400 bg-red-400/10'
  return (
    <span className={clsx('px-2.5 py-1 rounded-lg text-xs font-bold', color)}>
      {score.toFixed(1)}/10
    </span>
  )
}

export default function InterviewCard({ interview, delay = 0 }) {
  const navigate = useNavigate()
  const role = interview.targetRole || interview.role || 'Software Engineer'
  const level = interview.experienceLevel || interview.level || 'Mid'
  const date = interview.createdAt
    ? new Date(interview.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Unknown'
  const status = interview.status || 'pending'
  const score = interview.averageScore || interview.score

  const handleClick = () => {
    if (status === 'completed' && interview.sessionId) {
      navigate(`/results/${interview.sessionId}`)
    } else if (status === 'active' || status === 'pending') {
      navigate(`/interview/${interview._id || interview.id}`)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      onClick={handleClick}
      className="flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all duration-200 cursor-pointer group"
    >
      <div className="p-3 bg-accent-purple/20 rounded-xl text-accent-purple flex-shrink-0">
        <Briefcase size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white font-semibold truncate">{role}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-white/40 text-xs flex items-center gap-1">
            <Calendar size={10} />
            {date}
          </span>
          <span className="text-white/20">•</span>
          <span className="text-white/40 text-xs">{level}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <StatusBadge status={status} />
        <ScoreBadge score={score} />
        <ChevronRight size={16} className="text-white/20 group-hover:text-white/60 transition-colors" />
      </div>
    </motion.div>
  )
}
