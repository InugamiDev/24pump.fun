import {
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  ParsedAccountData,
} from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { connection } from "./solana";
import { SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID } from "./tft-token";
import { WindowWithPhantom } from "@/types/phantom";
import { ParsedMintAccount } from "@/types/token-mint";
import { ExchangeError } from "@/types/errors";

// Token program constants
const MINT_ACCOUNT_SIZE = 82; // Size of mint account data
const MINT_INITIALIZE_INSTRUCTION = 0; // Token program instruction for InitializeMint
const MINT_TO_INSTRUCTION = 7; // Token program instruction for MintTo

interface MintConfig {
  name: string;
  symbol: string;
  totalSupply: bigint;
  decimals: number;
  burnable: boolean;
}

/**
 * Creates the instruction data for minting tokens
 * Layout:
 * - Byte 0: Instruction code (7 for MintTo)
 * - Bytes 1-8: Amount as little-endian 64-bit integer
 */
function createMintToInstructionData(amount: bigint): Buffer {
  const buffer = Buffer.alloc(9);
  buffer[0] = MINT_TO_INSTRUCTION;
  buffer.writeBigUInt64LE(amount, 1);
  return buffer;
}

/**
 * Creates a new moment coin mint with the specified configuration
 * @param creatorWallet - Public key of the wallet that will be the mint authority
 * @param config - Configuration for the new token mint
 * @returns Object containing the mint address and transaction signature
 */
export async function createMomentCoinMint(
  creatorWallet: PublicKey,
  config: MintConfig
): Promise<{ mintAddress: string; signature: string }> {
  try {
    // Generate a new keypair for the mint
    const mintKeypair = Keypair.generate();
    const mintPubkey = mintKeypair.publicKey;

    // Calculate the rent-exempt reserve for the mint
    const rentExemptMinimum = await connection.getMinimumBalanceForRentExemption(MINT_ACCOUNT_SIZE);

    // Create the mint account
    const createMintAccountIx = SystemProgram.createAccount({
      fromPubkey: creatorWallet,
      newAccountPubkey: mintPubkey,
      space: MINT_ACCOUNT_SIZE,
      lamports: rentExemptMinimum,
      programId: TOKEN_PROGRAM_ID,
    });

    /**
     * Initialize mint instruction data layout:
     * - Byte 0: Instruction code (0 for InitializeMint)
     * - Byte 1: Number of decimals
     * - Bytes 2-33: Mint authority public key (32 bytes)
     * - Byte 34: Has freeze authority (0 = no, 1 = yes)
     * - Bytes 35-66: Freeze authority public key (32 bytes, if has_freeze = 1)
     */
    const initializeMintIx = new Transaction().add({
      keys: [
        { pubkey: mintPubkey, isSigner: false, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      programId: TOKEN_PROGRAM_ID,
      data: Buffer.from([
        MINT_INITIALIZE_INSTRUCTION,
        config.decimals,
        ...creatorWallet.toBuffer(),
        0, // No freeze authority
      ]),
    });

    // Derive creator's ATA
    const [ataAddress] = PublicKey.findProgramAddressSync(
      [creatorWallet.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mintPubkey.toBuffer()],
      SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID
    );

    // Create ATA for creator
    const createAtaIx = new Transaction().add({
      keys: [
        { pubkey: creatorWallet, isSigner: true, isWritable: true },
        { pubkey: ataAddress, isSigner: false, isWritable: true },
        { pubkey: creatorWallet, isSigner: false, isWritable: false },
        { pubkey: mintPubkey, isSigner: false, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        { pubkey: SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID, isSigner: false, isWritable: false },
      ],
      programId: SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
      data: Buffer.from([]),
    });

    // Mint tokens to creator's ATA
    const mintToIx = new Transaction().add({
      keys: [
        { pubkey: mintPubkey, isSigner: false, isWritable: true },
        { pubkey: ataAddress, isSigner: false, isWritable: true },
        { pubkey: creatorWallet, isSigner: true, isWritable: false },
      ],
      programId: TOKEN_PROGRAM_ID,
      data: createMintToInstructionData(config.totalSupply),
    });

    // Create transaction with latest blockhash
    const transaction = new Transaction();
    
    // Get the latest blockhash
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = creatorWallet;

    // Add all instructions
    transaction
      .add(createMintAccountIx)
      .add(initializeMintIx)
      .add(createAtaIx)
      .add(mintToIx);

    // Get phantom wallet
    const phantom = (window as WindowWithPhantom).phantom?.solana;
    if (!phantom) {
      const error = new Error("Phantom wallet not found") as ExchangeError;
      error.code = "WALLET_NOT_FOUND";
      throw error;
    }

    // Sign and send transaction
    const { signature } = await phantom.signAndSendTransaction(transaction);
    await connection.confirmTransaction(signature, "confirmed");

    return {
      mintAddress: mintPubkey.toString(),
      signature,
    };

  } catch (error) {
    console.error("Error creating moment coin mint:", error);
    const exchangeError = error as ExchangeError;
    exchangeError.code = exchangeError.code || "MINT_CREATE_ERROR";
    throw exchangeError;
  }
}

/**
 * Checks if a wallet is the owner (mint authority) of a token mint
 * @param mintAddress - Address of the token mint to check
 * @param walletAddress - Address of the wallet to check ownership for
 * @returns True if the wallet is the mint authority
 */
export async function isMintOwner(mintAddress: string, walletAddress: string): Promise<boolean> {
  try {
    const mintInfo = await connection.getParsedAccountInfo(new PublicKey(mintAddress));
    if (!mintInfo.value) return false;

    const data = mintInfo.value.data as ParsedAccountData;
    const parsedData = data as unknown as ParsedMintAccount;
    return parsedData.parsed.info.mintAuthority === walletAddress;
  } catch (error) {
    console.error("Error checking mint ownership:", error);
    return false;
  }
}