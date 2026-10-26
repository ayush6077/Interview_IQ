import React from 'react'
import { motion } from 'framer-motion'
import { FileText, Trash2, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import clsx from 'clsx'

function StatusBadge({ status }) {
  const statusMap = {
    processed: { icon: CheckCircle, color: 'text-emerald-400 bg-emerald-400/10', label: 'Processed' },
    processing: { icon: Clock, color: 'text-yellow-400 bg-yellow-400/10', label: 'Processing' },
    failed: { icon: AlertCircle, color: 'text-red-400 bg-red-400/10', label: 'Failed' },
  }
  const s = statusMap[status] || statusMap.processing
  const Icon = s.icon
  return (
    <span className={clsx('flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium', s.color)}>
      <Icon size={12} />
      {s.label}
    </span>
  )
}

export default function ResumeCard({ resume, onDelete, delay = 0 }) {
  const filename = resume.originalName || resume.filename || 'Resume'
  const uploadDate = resume.createdAt
    ? new Date(resume.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Unknown date'
  const status = resume.status || 'processed'

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all duration-200 group"
    >
      <div className="p-3 bg-brand-500/20 rounded-xl text-brand-400 flex-shrink-0">
        <FileText size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white font-medium truncate">{filename}</p>
        <p className="text-white/40 text-sm mt-0.5">{uploadDate}</p>
      </div>
      <StatusBadge status={status} />
      <button
        onClick={() => onDelete(resume._id || resume.id)}
        className="p-2 text-white/30 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
        title="Delete resume"
      >
        <Trash2 size={16} />
      </button>
    </motion.div>
  )
}
