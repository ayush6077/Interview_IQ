import React from 'react'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'
import clsx from 'clsx'

function getScoreColor(score) {
  if (score >= 8) return { path: '#10b981', trail: '#10b98130', text: '#10b981' }
  if (score >= 5) return { path: '#f59e0b', trail: '#f59e0b30', text: '#f59e0b' }
  return { path: '#ef4444', trail: '#ef444430', text: '#ef4444' }
}

export default function ScoreCircle({ score = 0, maxScore = 10, size = 'md', showLabel = true }) {
  const percent = (score / maxScore) * 100
  const colors = getScoreColor(score)
  const sizeMap = { sm: 'w-16 h-16', md: 'w-28 h-28', lg: 'w-40 h-40', xl: 'w-52 h-52' }
  const textSizeMap = { sm: 'text-xs', md: 'text-sm', lg: 'text-base', xl: 'text-lg' }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={clsx(sizeMap[size] || sizeMap.md)}>
        <CircularProgressbar
          value={percent}
          text={`${score.toFixed(1)}`}
          styles={buildStyles({
            pathColor: colors.path,
            trailColor: colors.trail,
            textColor: colors.text,
            textSize: size === 'xl' ? '20px' : size === 'lg' ? '18px' : '22px',
            pathTransitionDuration: 1,
          })}
        />
      </div>
      {showLabel && (
        <span className={clsx('text-white/60', textSizeMap[size] || textSizeMap.md)}>
          out of {maxScore}
        </span>
      )}
    </div>
  )
}
