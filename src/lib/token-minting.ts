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

interface MintConfig {
  name: string;
  symbol: string;
  totalSupply: bigint;
  decimals: number;
  burnable: boolean;
}

function createMintToInstructionData(amount: bigint): Buffer {
  const buffer = Buffer.alloc(9);
  buffer[0] = 7; // MintTo instruction
  buffer.writeBigUInt64LE(amount, 1);
  return buffer;
}

export async function createMomentCoinMint(
  creatorWallet: PublicKey,
  config: MintConfig
): Promise<{ mintAddress: string; signature: string }> {
  try {
    // Generate a new keypair for the mint
    const mintKeypair = Keypair.generate();
    const mintPubkey = mintKeypair.publicKey;

    // Calculate the rent-exempt reserve for the mint
    const rentExemptMinimum = await connection.getMinimumBalanceForRentExemption(82);

    // Create the mint account
    const createMintAccountIx = SystemProgram.createAccount({
      fromPubkey: creatorWallet,
      newAccountPubkey: mintPubkey,
      space: 82,
      lamports: rentExemptMinimum,
      programId: TOKEN_PROGRAM_ID,
    });

    // Initialize the mint
    const initializeMintIx = new Transaction().add({
      keys: [
        { pubkey: mintPubkey, isSigner: false, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      programId: TOKEN_PROGRAM_ID,
      data: Buffer.from([
        0, // Initialize instruction
        ...new Uint8Array([config.decimals]), // Number of decimals
        ...creatorWallet.toBuffer(), // Mint authority
        ...Buffer.from([0]), // Freeze authority (none)
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
    if (!phantom) throw new Error("Phantom wallet not found");

    // Sign and send transaction
    const { signature } = await phantom.signAndSendTransaction(transaction);
    await connection.confirmTransaction(signature, "confirmed");

    return {
      mintAddress: mintPubkey.toString(),
      signature,
    };

  } catch (error) {
    console.error("Error creating moment coin mint:", error);
    throw error;
  }
}

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