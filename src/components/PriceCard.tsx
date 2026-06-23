import { memo } from 'react'
import type { PriceData } from '../types'
import { formatPrice, timeAgo } from '../utils/format'

const SOURCE_COLORS: Record<string, string> = {
  chainlink: 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30',
  redstone: 'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30',
  band: 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30',
  reflector: 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border-cyan-500/30',
}

interface PriceCardProps {
  price: PriceData
  onClick?: () => void
  isLive?: boolean
}

export const PriceCard = memo(function PriceCard({ price, onClick, isLive }: PriceCardProps) {
  const confidencePct = (price.confidence * 100).toFixed(1)

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 hover:border-gray-300 dark:hover:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900/80 transition-all shadow-sm dark:shadow-lg dark:shadow-black/20"
      aria-label={`View details for ${price.assetPair}`}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{price.assetPair}</h3>
        {isLive && <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" role="status" aria-label="Live data" />}
      </div>

      <div className="text-3xl font-bold text-gray-900 dark:text-white mb-3 font-mono tracking-tight">
        ${formatPrice(price.price)}
      </div>

      <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500 mb-3">
        <span>Updated {timeAgo(price.timestamp)}</span>
        <span className="text-cyan-600 dark:text-cyan-400">{confidencePct}% confidence</span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {price.sources.map((src) => (
          <span
            key={src}
            className={`px-2 py-0.5 rounded text-xs font-medium border ${SOURCE_COLORS[src] ?? 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700'}`}
          >
            {src}
          </span>
        ))}
      </div>
    </button>
  )
})
