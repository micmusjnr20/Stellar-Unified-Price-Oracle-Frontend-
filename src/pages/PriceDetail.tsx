import { useParams, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { usePriceHistory } from '../hooks/usePriceHistory'
import { useWebSocket } from '../hooks/useWebSocket'
import { usePrices } from '../hooks/usePrices'
import { PriceChart } from '../components/PriceChart'
import { SourceHealthBadge } from '../components/SourceHealthBadge'
import { ConnectionBadge } from '../components/ConnectionBadge'
import { formatPrice, formatTimestamp } from '../utils/format'

export function PriceDetail() {
  const { pair } = useParams<{ pair: string }>()
  const navigate = useNavigate()
  const decodedPair = pair ? decodeURIComponent(pair) : null
  const { history, loading: historyLoading } = usePriceHistory(decodedPair)
  const { prices } = usePrices(decodedPair ? [decodedPair] : undefined)
  const { livePrices, status, subscribe, unsubscribe } = useWebSocket()

  useEffect(() => {
    if (decodedPair) subscribe([decodedPair])
    return () => {
      if (decodedPair) unsubscribe([decodedPair])
    }
  }, [decodedPair, subscribe, unsubscribe])

  const priceData = livePrices.get(decodedPair ?? '') ?? prices.find((p) => p.assetPair === decodedPair)

  if (!decodedPair) {
    navigate('/')
    return null
  }

  return (
    <div>
      <button
        onClick={() => navigate('/')}
        className="mb-6 text-sm text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors flex items-center gap-1 cursor-pointer"
        type="button"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Dashboard
      </button>

      {priceData && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{decodedPair}</h1>
                {livePrices.has(decodedPair) && (
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                )}
              </div>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Last updated: {formatTimestamp(priceData.timestamp)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-cyan-600 dark:text-cyan-400">
                {(priceData.confidence * 100).toFixed(1)}% confidence
              </span>
              <ConnectionBadge status={status} />
            </div>
          </div>

          <div className="text-5xl font-bold text-gray-900 dark:text-white mb-4 font-mono tracking-tight">
            ${formatPrice(priceData.price)}
          </div>

          <div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">Oracle Sources</p>
            <SourceHealthBadge sources={priceData.sources} />
          </div>
        </div>
      )}

      {!priceData && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 mb-8 flex items-center justify-center text-gray-400 dark:text-gray-500">
          {historyLoading ? (
            <div className="animate-spin w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full" role="status" aria-label="Loading" />
          ) : (
            <p>No price data for {decodedPair}</p>
          )}
        </div>
      )}

      <PriceChart
        data={history}
        pair={decodedPair}
        loading={historyLoading}
      />
    </div>
  )
}
