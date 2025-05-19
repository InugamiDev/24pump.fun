import { PublicKey } from "@solana/web3.js"
import { connection } from "./solana"
import { isValidSolanaAddress } from "./solana"

// Mock TFT token constants
export const TFT_DECIMALS = 9
export const TFT_MINT = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA") // Replace with actual mint

interface ExchangeParams {
  userAddress: string
  solAmount: number
}

interface TFTBalanceResponse {
  balance: number
  formattedBalance: string
}

// Special dates that cost more TFT
const SPECIAL_DATES = {
  "1225": 500, // Christmas
  "0101": 500, // New Year
  "0214": 300, // Valentine's
  "1031": 300, // Halloween
  // Add more special dates as needed
}

/**
 * Exchange SOL for TFT tokens
 * In production, this would interact with a liquidity pool
 */
export async function exchangeSOLtoTFT({
  userAddress,
  solAmount,
}: ExchangeParams): Promise<string> {
  try {
    if (!isValidSolanaAddress(userAddress)) {
      throw new Error("Invalid wallet address")
    }

    // Verify user has sufficient SOL
    const userBalance = await connection.getBalance(new PublicKey(userAddress))
    if (userBalance < solAmount * 1e9) {
      throw new Error("Insufficient SOL balance")
    }

    // TODO: Implement actual exchange
    console.log(`Exchanging ${solAmount} SOL for ${solAmount * 100} TFT`)
    
    return "mock_exchange_tx_signature"
  } catch (error) {
    console.error("Error exchanging SOL to TFT:", error)
    throw new Error("Failed to exchange tokens")
  }
}

/**
 * Get TFT balance for a wallet
 */
export async function getTFTBalance(walletAddress: string): Promise<TFTBalanceResponse> {
  try {
    if (!isValidSolanaAddress(walletAddress)) {
      throw new Error("Invalid wallet address")
    }

    // TODO: Implement actual balance check using SPL token account
    const mockBalance = 1000

    return {
      balance: mockBalance,
      formattedBalance: formatTFTAmount(mockBalance),
    }
  } catch (error) {
    console.error("Error getting TFT balance:", error)
    throw error
  }
}

/**
 * Calculate TFT amount needed for minting
 */
export function calculateRequiredTFT(date: string): number {
  // Remove any separators and get MMDD format
  const mmdd = date.replace(/[^0-9]/g, "").slice(0, 4)
  
  // Check if it's a special date
  if (SPECIAL_DATES[mmdd as keyof typeof SPECIAL_DATES]) {
    return SPECIAL_DATES[mmdd as keyof typeof SPECIAL_DATES]
  }

  // Base price for regular dates
  return 100
}

/**
 * Check if wallet has sufficient TFT balance
 */
export async function hasSufficientTFT(
  walletAddress: string,
  requiredAmount: number
): Promise<boolean> {
  try {
    const { balance } = await getTFTBalance(walletAddress)
    return balance >= requiredAmount
  } catch {
    return false
  }
}

/**
 * Format TFT amount with proper decimals
 */
export function formatTFTAmount(amount: number): string {
  return (amount / Math.pow(10, TFT_DECIMALS)).toFixed(2)
}