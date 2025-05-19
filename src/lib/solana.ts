import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js"
import { TOKEN_PROGRAM_ID } from "@solana/spl-token"

// Initialize Solana connection
export const connection = new Connection(
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL_DEVNET || clusterApiUrl("devnet"),
  "confirmed"
)

// Mock TFT token mint address (replace with actual mint in production)
export const TFT_MINT = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")

// Utility functions
export function isValidSolanaAddress(address: string): boolean {
  try {
    new PublicKey(address)
    return true
  } catch {
    return false
  }
}

// Get token balance for a wallet
export async function getTokenBalance(
  walletAddress: string,
  mintAddress: string = TFT_MINT.toString()
): Promise<number> {
  try {
    const wallet = new PublicKey(walletAddress)
    const mint = new PublicKey(mintAddress)

    const tokenAccounts = await connection.getTokenAccountsByOwner(wallet, {
      programId: TOKEN_PROGRAM_ID,
    })

    for (const { account } of tokenAccounts.value) {
      const accountMint = account.data.slice(0, 32)
      if (accountMint.equals(mint.toBuffer())) {
        const balance = account.data.readBigUInt64LE(64)
        return Number(balance)
      }
    }

    return 0
  } catch {
    return 0
  }
}

// Check if a date is available (not minted)
export async function isDateAvailable(mmdd: string, year: number): Promise<boolean> {
  // TODO: Implement check against smart contract
  // For now, return mock data based on year and mmdd
  const takenDates: Record<number, string[]> = {
    2024: ["1225", "0101", "0214"],
    2025: ["1225", "0101"],
  }
  
  const yearDates = takenDates[year] || []
  return !yearDates.includes(mmdd)
}

// Calculate minting fee in TFT
export function calculateMintingFee(): number {
  // TODO: Implement dynamic fee calculation
  return 100 // Fixed fee of 100 TFT for now
}

// Format SOL balance
export function formatSOL(lamports: number): string {
  return (lamports / 1e9).toFixed(4)
}

// Format TFT balance
export function formatTFT(amount: number): string {
  return amount.toLocaleString()
}