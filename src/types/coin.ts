export interface Coin {
  id: string
  date: string
  name: string
  creator: string
  mintedAt: string
  description: string
  transactionHash?: string
}

export interface CoinFilters {
  search?: string
  timePeriod?: '24h' | '7d' | '30d' | 'all'
  sortBy?: 'recent' | 'oldest' | 'name-asc' | 'name-desc'
}

export interface CoinFeedProps {
  coins: Coin[]
  isLoading?: boolean
}

export interface CoinGridProps {
  coins: Coin[]
  isLoading?: boolean
}