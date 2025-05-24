import { Connection, PublicKey, Transaction, TransactionInstruction, SystemProgram } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { connection } from "./solana";

// Minimum SOL balance required for fees
export const MINIMUM_SOL_BALANCE = 0.001; // 0.001 SOL for fees

export const TFT_MINT_ADDRESS = process.env.NEXT_PUBLIC_TFT_MINT_ADDRESS;
if (!TFT_MINT_ADDRESS) {
  throw new Error("NEXT_PUBLIC_TFT_MINT_ADDRESS environment variable is not set!");
}
export const tftMintPubkey = new PublicKey(TFT_MINT_ADDRESS);

// ATA derivation constants (from spl-token source)
export const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID = new PublicKey(
  'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'
);

export async function getTftBalance(walletPublicKey: PublicKey): Promise<number> {
  try {
    // Get all token accounts for this wallet
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      walletPublicKey,
      { mint: tftMintPubkey }
    );

    // Find the account for our TFT token
    const tftAccount = tokenAccounts.value[0];
    if (!tftAccount) return 0;

    const amount = (tftAccount.account.data as any).parsed.info.tokenAmount.uiAmount;
    return amount;
  } catch (error) {
    console.error("Error fetching TFT balance:", error);
    return 0;
  }
}

function createATAInstruction(
  payer: PublicKey,
  owner: PublicKey,
  mint: PublicKey,
): TransactionInstruction {
  const [ataAddress] = PublicKey.findProgramAddressSync(
    [
      owner.toBuffer(),
      TOKEN_PROGRAM_ID.toBuffer(),
      mint.toBuffer()
    ],
    SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID
  );

  return new TransactionInstruction({
    keys: [
      { pubkey: payer, isSigner: true, isWritable: true },             // Funding account (payer)
      { pubkey: ataAddress, isSigner: false, isWritable: true },       // New ATA account
      { pubkey: owner, isSigner: false, isWritable: false },           // Wallet address
      { pubkey: mint, isSigner: false, isWritable: false },            // Token mint account
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }, // Rent sysvar
    ],
    programId: SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
    data: Buffer.from([1]), // Initialize instruction
  });
}

export async function createTftAta(walletPublicKey: PublicKey): Promise<string> {
  try {
    // Create instruction to create ATA
    const instruction = createATAInstruction(
      walletPublicKey,  // payer
      walletPublicKey,  // owner
      tftMintPubkey,    // mint
    );

    const transaction = new Transaction();
    
    // Get the latest blockhash
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = walletPublicKey;
    
    // Add the instruction
    transaction.add(instruction);

    const phantom = (window as any).phantom?.solana;
    if (!phantom) throw new Error("Phantom wallet not found");

    // Sign and send transaction
    const { signature } = await phantom.signAndSendTransaction(transaction);
    await connection.confirmTransaction(signature, "confirmed");
    
    // Return the derived ATA address
    const [ataAddress] = PublicKey.findProgramAddressSync(
      [walletPublicKey.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), tftMintPubkey.toBuffer()],
      SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID
    );
    
    return ataAddress.toString();
  } catch (error) {
    console.error("Error creating TFT ATA:", error);
    throw error;
  }
}

export async function checkTftAta(walletPublicKey: PublicKey): Promise<{ exists: boolean, address: string }> {
  try {
    // Derive the ATA address
    const [ataAddress] = PublicKey.findProgramAddressSync(
      [
        walletPublicKey.toBuffer(),
        TOKEN_PROGRAM_ID.toBuffer(),
        tftMintPubkey.toBuffer()
      ],
      SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID
    );

    // Check if the account exists
    const account = await connection.getAccountInfo(ataAddress);
    
    return {
      exists: account !== null,
      address: ataAddress.toString()
    };
  } catch (error) {
    console.error("Error checking TFT ATA:", error);
    return {
      exists: false,
      address: ""
    };
  }
}

export async function ensureTftAta(walletPublicKey: PublicKey): Promise<string> {
  const { exists, address } = await checkTftAta(walletPublicKey);
  
  if (!exists) {
    return await createTftAta(walletPublicKey);
  }
  
  return address;
}

export async function exchangeSolToTft(
  walletPublicKey: PublicKey,
  solAmount: number
): Promise<string> {
  try {
    // Ensure TFT token account exists
    await ensureTftAta(walletPublicKey);

    // Check for minimum SOL balance for fees
    const solBalance = await connection.getBalance(walletPublicKey);
    const currentSolBalance = solBalance / 1e9;
    
    if (currentSolBalance < solAmount + MINIMUM_SOL_BALANCE) {
      throw new Error(`Please keep at least ${MINIMUM_SOL_BALANCE} SOL for transaction fees`);
    }

    const lamports = solAmount * 1e9; // Convert SOL to lamports
    const tftAmount = solAmount * 100; // 1 SOL = 100 TFT

    const transaction = new Transaction();
    
    // Get the latest blockhash
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = walletPublicKey;
    
    // Get TFT token account
    const { address: tftAccount } = await checkTftAta(walletPublicKey);
    if (!tftAccount) {
      throw new Error("Failed to locate TFT token account");
    }

    // First transfer SOL
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: walletPublicKey,
        toPubkey: walletPublicKey,
        lamports
      })
    );

    // Then mint TFT tokens
    // Calculate token amount and create buffer (with 9 decimals)
    const tokenAmount = Math.floor(tftAmount * 1e9);
    const amountBuffer = new Uint8Array(8);
    new DataView(amountBuffer.buffer).setBigUint64(0, BigInt(tokenAmount), true); // true for little-endian

    const mintInstruction = new TransactionInstruction({
      keys: [
        { pubkey: tftMintPubkey, isSigner: false, isWritable: true },      // Token mint account
        { pubkey: new PublicKey(tftAccount), isSigner: false, isWritable: true }, // Token account to mint to
        { pubkey: walletPublicKey, isSigner: true, isWritable: false },    // Mint authority (wallet owner)
      ],
      programId: TOKEN_PROGRAM_ID,
      data: Buffer.concat([
        Buffer.from([7]), // MintTo instruction
        amountBuffer
      ])
    });
    transaction.add(mintInstruction);
    
    // Get phantom wallet
    const phantom = (window as any).phantom?.solana;
    if (!phantom) throw new Error("Phantom wallet not found");

    // Sign and send transaction
    const { signature } = await phantom.signAndSendTransaction(transaction);
    await connection.confirmTransaction(signature, "confirmed");
    
    return signature;
  } catch (error) {
    console.error("Error exchanging SOL to TFT:", error);
    throw error;
  }
}

export async function exchangeTftToSol(
  walletPublicKey: PublicKey,
  tftAmount: number
): Promise<string> {
  try {
    // Ensure TFT token account exists
    await ensureTftAta(walletPublicKey);

    // Check for minimum SOL balance for fees
    const solBalance = await connection.getBalance(walletPublicKey);
    const currentSolBalance = solBalance / 1e9;
    
    if (currentSolBalance < MINIMUM_SOL_BALANCE) {
      throw new Error(`Please keep at least ${MINIMUM_SOL_BALANCE} SOL for transaction fees`);
    }

    const solAmount = tftAmount / 100; // 100 TFT = 1 SOL
    const lamports = solAmount * 1e9;

    const transaction = new Transaction();
    
    // Get the latest blockhash
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = walletPublicKey;
    
    // Get TFT token account
    const { address: tftAccount } = await checkTftAta(walletPublicKey);
    if (!tftAccount) {
      throw new Error("Failed to locate TFT token account");
    }

    // First burn TFT tokens
    const transferInstruction = new TransactionInstruction({
      keys: [
        { pubkey: new PublicKey(tftAccount), isSigner: false, isWritable: true },
        { pubkey: tftMintPubkey, isSigner: false, isWritable: true },
        { pubkey: walletPublicKey, isSigner: true, isWritable: false }
      ],
      programId: TOKEN_PROGRAM_ID,
      data: Buffer.from([
        3, // Transfer instruction
        ...new Uint8Array(Buffer.from(tftAmount.toString()))
      ])
    });
    transaction.add(transferInstruction);

    // Then transfer minimum SOL for the transaction
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: walletPublicKey,
        toPubkey: walletPublicKey,
        lamports: 100 // Minimum transfer amount
      })
    );
    
    // Get phantom wallet
    const phantom = (window as any).phantom?.solana;
    if (!phantom) throw new Error("Phantom wallet not found");

    // Sign and send transaction
    const { signature } = await phantom.signAndSendTransaction(transaction);
    await connection.confirmTransaction(signature, "confirmed");
    
    return signature;
  } catch (error) {
    console.error("Error exchanging TFT to SOL:", error);
    throw error;
  }
}