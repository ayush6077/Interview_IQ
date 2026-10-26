import React from 'react'
import { motion } from 'framer-motion'
import clsx from 'clsx'

export default function ProgressBar({ value = 0, max = 100, className = '', showLabel = false, color = 'brand' }) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100))
  const colorMap = {
    brand: 'from-brand-500 to-accent-purple',
    green: 'from-accent-green to-emerald-400',
    red: 'from-accent-red to-rose-400',
    yellow: 'from-accent-yellow to-orange-400',
  }
  return (
    <div className={clsx('w-full', className)}>
      <div className="w-full bg-white/10 rounded-full overflow-hidden h-2">
        <motion.div
          className={clsx('h-full rounded-full bg-gradient-to-r', colorMap[color] || colorMap.brand)}
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between mt-1 text-xs text-white/40">
          <span>{value}</span>
          <span>{max}</span>
        </div>
      )}
    </div>
  )
}
