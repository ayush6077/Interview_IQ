import React from 'react'
import { motion } from 'framer-motion'
import clsx from 'clsx'

export default function StatCard({ icon: Icon, label, value, color = 'brand', delay = 0 }) {
  const colorMap = {
    brand: 'from-brand-500/20 to-brand-600/10 border-brand-500/30 text-brand-400',
    purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/30 text-purple-400',
    green: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 text-emerald-400',
    yellow: 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30 text-yellow-400',
    red: 'from-red-500/20 to-red-600/10 border-red-500/30 text-red-400',
    cyan: 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/30 text-cyan-400',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className={clsx(
        'bg-gradient-to-br border rounded-2xl p-5 flex items-center gap-4',
        colorMap[color] || colorMap.brand
      )}
    >
      {Icon && (
        <div className="p-3 bg-white/10 rounded-xl">
          <Icon size={22} className="flex-shrink-0" />
        </div>
      )}
      <div>
        <p className="text-white/50 text-sm font-medium">{label}</p>
        <p className="text-white text-2xl font-bold mt-0.5">{value}</p>
      </div>
    </motion.div>
  )
}
