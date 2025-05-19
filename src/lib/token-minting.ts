import {
  PublicKey,
  Keypair,
  SystemProgram,
  Transaction,
} from "@solana/web3.js"
import { connection } from "./solana"

// In production, this would be properly secured
const AUTHORITY_KEYPAIR = Keypair.generate()

interface MintTokenParams {
  recipientAddress: string
  name: string
  symbol: string
  mmdd: string
  year: number
}

export async function mintDateToken({
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  recipientAddress,
  name,
  symbol,
  mmdd,
  year,
}: MintTokenParams): Promise<{ signature: string; tokenAddress: string }> {
  try {
    // Create a new token mint account
    const mintKeypair = Keypair.generate()
    const mintAccount = mintKeypair.publicKey

    // Calculate the rent-exempt reserve
    const rentExemptBalance = await connection.getMinimumBalanceForRentExemption(
      82 // Token mint size
    )

    // Create transaction
    const transaction = new Transaction()

    // Add create account instruction
    transaction.add(
      SystemProgram.createAccount({
        fromPubkey: AUTHORITY_KEYPAIR.publicKey,
        newAccountPubkey: mintAccount,
        space: 82,
        lamports: rentExemptBalance,
        programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
      })
    )

    // TODO: Add instructions for:
    // 1. Initialize mint
    // 2. Create associated token account for recipientAddress
    // 3. Mint token to recipient
    // 4. Create metadata with name and symbol

    const metadata = {
      name: `${name} (${mmdd}/${year})`,
      symbol,
      uri: `https://api.24pump.fun/metadata/${mmdd}-${year}`,
    }
    console.log("Token metadata:", metadata)

    // Send transaction
    const signature = await connection.sendTransaction(
      transaction,
      [AUTHORITY_KEYPAIR, mintKeypair],
      { skipPreflight: false }
    )

    // Wait for confirmation
    await connection.confirmTransaction(signature)

    return {
      signature,
      tokenAddress: mintAccount.toString(),
    }
  } catch (error) {
    console.error("Error minting token:", error)
    throw new Error("Failed to mint token")
  }
}

// Function to generate PDA for date uniqueness check
export function getDatePDA(mmdd: string, year: number): PublicKey {
  // Convert date components to bytes
  const mmddBuffer = Buffer.from(mmdd)
  const yearBuffer = Buffer.alloc(2)
  yearBuffer.writeUInt16LE(year)

  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("date"), mmddBuffer, yearBuffer],
    new PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID || "")
  )

  return pda
}

// Function to validate date PDA ownership
export async function isDateAvailableOnChain(
  mmdd: string,
  year: number
): Promise<boolean> {
  try {
    const datePDA = getDatePDA(mmdd, year)
    const accountInfo = await connection.getAccountInfo(datePDA)
    return accountInfo === null // if null, date is available
  } catch (error) {
    console.error("Error checking date availability:", error)
    throw error
  }
}