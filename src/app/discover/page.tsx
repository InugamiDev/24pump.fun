"use client"

import { useState, useCallback } from "react"
import { CoinFeed } from "@/components/coin-feed"
import { CoinGrid } from "@/components/coin-grid"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import { type Coin, type CoinFilters } from "@/types/coin"

type ViewMode = "feed" | "grid"

// Example data - In production, this would come from the blockchain
const initialCoins = [
  {
    id: "1",
    date: "2024-12-25",
    name: "Christmas 2024",
    creator: "0x1234...5678",
    mintedAt: "2024-05-19T08:30:00.000Z",
    description: "The magic of Christmas, preserved on-chain.",
  },
  {
    id: "2",
    date: "2024-01-01",
    name: "New Year 2024",
    creator: "0x8765...4321",
    mintedAt: "2024-05-18T15:45:00.000Z",
    description: "A fresh start, tokenized forever.",
  },
]

// More example data for load more simulation
const moreCoins = [
  {
    id: "3",
    date: "2024-02-14",
    name: "Valentine's Day",
    creator: "0x9876...5432",
    mintedAt: "2024-05-17T10:20:00.000Z",
    description: "Love, immortalized on the blockchain.",
  },
  {
    id: "4",
    date: "2024-07-04",
    name: "Independence Day",
    creator: "0x5432...8765",
    mintedAt: "2024-05-16T14:30:00.000Z",
    description: "Freedom rings on the blockchain.",
  },
]

export default function DiscoverPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("feed")
  const [coins, setCoins] = useState<Coin[]>(initialCoins)
  const [isLoading, setIsLoading] = useState(false)
  const [filters, setFilters] = useState<CoinFilters>({})

  const handleSearch = useCallback((value: string) => {
    setFilters(prev => ({ ...prev, search: value }))
    // Simple client-side search
    if (!value) {
      setCoins(initialCoins)
      return
    }
    
    const searchValue = value.toLowerCase()
    const filtered = initialCoins.filter(coin => 
      coin.name.toLowerCase().includes(searchValue) ||
      coin.creator.toLowerCase().includes(searchValue) ||
      coin.description.toLowerCase().includes(searchValue)
    )
    setCoins(filtered)
  }, [])

  const handleTimePeriodChange = (value: string) => {
    setFilters(prev => ({ ...prev, timePeriod: value as CoinFilters['timePeriod'] }))
    // In production, this would trigger a filtered request
  }

  const handleSortChange = useCallback((value: string) => {
    setFilters(prev => ({ ...prev, sortBy: value as CoinFilters['sortBy'] }))
    
    // Simple client-side sorting
    const sorted = [...coins]
    switch (value) {
      case 'recent':
        sorted.sort((a, b) => new Date(b.mintedAt).getTime() - new Date(a.mintedAt).getTime())
        break
      case 'oldest':
        sorted.sort((a, b) => new Date(a.mintedAt).getTime() - new Date(b.mintedAt).getTime())
        break
      case 'name-asc':
        sorted.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'name-desc':
        sorted.sort((a, b) => b.name.localeCompare(a.name))
        break
    }
    setCoins(sorted)
  }, [coins])

  const handleLoadMore = () => {
    setIsLoading(true)
    // Simulate loading more data
    setTimeout(() => {
      setCoins(prevCoins => [...prevCoins, ...moreCoins])
      setIsLoading(false)
    }, 1000)
  }

  const resetFilters = () => {
    setFilters({})
    setCoins(initialCoins)
  }

  return (
    <div className="container py-10">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">Discover Coins</h1>
          <p className="text-lg text-muted-foreground">
            Explore the latest timestamped coins and their stories
          </p>
        </div>

        {/* Filters */}
        <div className="space-y-4 rounded-lg border bg-card p-4">
          {/* Search and View Toggle */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:w-96">
              <Input
                placeholder="Search by name or creator..."
                className="w-full"
                value={filters.search || ""}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            <ToggleGroup 
              type="single" 
              value={viewMode}
              onValueChange={(value: ViewMode) => {
                if (value) setViewMode(value)
              }}
            >
              <ToggleGroupItem value="feed">Feed View</ToggleGroupItem>
              <ToggleGroupItem value="grid">Grid View</ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* Filter Controls */}
          <div className="flex flex-col gap-4 sm:flex-row">
            <Select
              value={filters.timePeriod}
              onValueChange={handleTimePeriodChange}
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Time Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24 Hours</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.sortBy}
              onValueChange={handleSortChange}
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                <SelectItem value="name-desc">Name (Z-A)</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              className="w-full sm:w-40"
              onClick={resetFilters}
            >
              Reset Filters
            </Button>
          </div>
        </div>

        {/* Content */}
        {viewMode === "feed" ? (
          <CoinFeed coins={coins} isLoading={isLoading} />
        ) : (
          <CoinGrid coins={coins} isLoading={isLoading} />
        )}

        {/* Load More */}
        <div className="flex justify-center">
          <Button 
            variant="outline" 
            size="lg"
            onClick={handleLoadMore}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Load More"}
          </Button>
        </div>
      </div>
    </div>
  )
}