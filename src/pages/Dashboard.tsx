import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePrices } from '../hooks/usePrices'
import { useWebSocket } from '../hooks/useWebSocket'
import { PriceCard } from '../components/PriceCard'
import { PriceCardSkeleton } from '../components/PriceCardSkeleton'
import { ConnectionBadge } from '../components/ConnectionBadge'
import { NetworkStatusBanner } from '../components/NetworkStatusBanner'

function mergePrices(
  restPrices: { assetPair: string; price: number; timestamp: number; confidence: number; sources: string[] }[],
  livePrices: Map<string, { assetPair: string; price: number; timestamp: number; confidence: number; sources: string[] }>,
) {
  return restPrices.map((p) => {
    const live = livePrices.get(p.assetPair)
    if (live && live.timestamp >= p.timestamp) {
      return { ...p, ...live }
    }
    return p
  })
}

export function Dashboard() {
  const { prices, loading, error } = usePrices()
  const { livePrices, status } = useWebSocket(prices.map((p) => p.assetPair))
  const navigate = useNavigate()

  const merged = mergePrices(prices, livePrices)

  const handleCardClick = useCallback(
    (pair: string) => navigate(`/price/${encodeURIComponent(pair)}`),
    [navigate],
  )

  const SKELETON_COUNT = 8

  return (
    <div>
      <NetworkStatusBanner />
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Price Oracle Dashboard</h1>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            Aggregated from Chainlink, Redstone, Band &amp; Reflector
          </p>
        </div>
        <ConnectionBadge status={status} />
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </div>
      )}

      {loading && prices.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" aria-label="Loading price cards">
          {Array.from({ length: SKELETON_COUNT }, (_, i) => (
            <PriceCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" role="list" aria-label="Price feeds">
          {merged.map((p) => (
            <PriceCard
              key={p.assetPair}
              price={p}
              isLive={livePrices.has(p.assetPair)}
              onClick={() => handleCardClick(p.assetPair)}
            />
          ))}
        </div>
      )}

      {!loading && merged.length === 0 && (
        <div className="text-center py-32 text-gray-400 dark:text-gray-500">
          <p className="text-lg mb-2">No price feeds available</p>
          <p className="text-sm">Connect to the aggregator API to see price data.</p>
        </div>
      )}
    </div>
  )
}
