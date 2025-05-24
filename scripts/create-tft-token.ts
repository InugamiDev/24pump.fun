import { Keypair, Connection, Transaction, SystemProgram, PublicKey } from "@solana/web3.js";
import { 
  TOKEN_PROGRAM_ID,
  MINT_SIZE,
  createInitializeMintInstruction,
} from "@solana/spl-token";
import * as dotenv from "dotenv";

dotenv.config();

async function createTftTokenMint() {
  // Connect to devnet
  const connection = new Connection("https://api.devnet.solana.com", "confirmed");

  // Generate a new keypair for the mint
  const mintKeypair = Keypair.generate();
  console.log("Mint public key:", mintKeypair.publicKey.toString());

  // Get wallet's public key from environment variable or generate new one
  const payer = process.env.WALLET_PRIVATE_KEY
    ? Keypair.fromSecretKey(Buffer.from(process.env.WALLET_PRIVATE_KEY, 'base64'))
    : Keypair.generate();

  console.log("Payer public key:", payer.publicKey.toString());

  // Calculate rent-exempt amount
  const lamports = await connection.getMinimumBalanceForRentExemption(MINT_SIZE);

  // Create a transaction to create the mint account
  const transaction = new Transaction().add(
    SystemProgram.createAccount({
      fromPubkey: payer.publicKey,
      newAccountPubkey: mintKeypair.publicKey,
      space: MINT_SIZE,
      lamports,
      programId: TOKEN_PROGRAM_ID,
    }),
    createInitializeMintInstruction(
      mintKeypair.publicKey,  // mint pubkey
      0,                      // decimals
      payer.publicKey,        // mint authority
      payer.publicKey,        // freeze authority (you can use null to disable)
      TOKEN_PROGRAM_ID
    )
  );

  try {
    // Get recent blockhash
    const { blockhash } = await connection.getRecentBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = payer.publicKey;

    // Sign transaction
    transaction.sign(payer, mintKeypair);

    // Send and confirm transaction
    const signature = await connection.sendRawTransaction(transaction.serialize());
    await connection.confirmTransaction(signature);

    console.log("Token mint created successfully!");
    console.log("Token mint address:", mintKeypair.publicKey.toString());
    console.log("Add this address to your .env file as NEXT_PUBLIC_TFT_MINT_ADDRESS");

  } catch (error) {
    console.error("Error creating token mint:", error);
  }
}

createTftTokenMint();