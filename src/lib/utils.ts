import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date)
}

export function shortenAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`
}

export function formatNumber(
  number: number,
  options: Intl.NumberFormatOptions = {}
): string {
  return new Intl.NumberFormat("en-US", options).format(number)
}

/**
 * Validates if a date is mintable
 * @param date Date to validate
 * @returns boolean indicating if the date can be minted
 */
export function isDateMintable(date: Date): boolean {
  const today = new Date()
  
  // Ensure we're comparing just the dates without time
  const compareDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const compareToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  
  // Only allow current year's dates
  return (
    compareDate.getFullYear() === compareToday.getFullYear() &&
    compareDate >= compareToday
  )
}
