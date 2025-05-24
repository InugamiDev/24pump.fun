import { Keypair, Connection, Transaction, SystemProgram, TransactionInstruction } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

// The size of a token mint account is 82 bytes
const MINT_ACCOUNT_SIZE = 82;

function createInitializeMintInstruction(
  mint: Keypair,
  decimals: number,
  mintAuthority: Keypair,
  freezeAuthority: Keypair | null
): TransactionInstruction {
  const data = Buffer.alloc(67);
  // Instruction code for InitializeMint
  data[0] = 0;
  // Write decimals
  data[1] = decimals;
  // Write mint authority
  mintAuthority.publicKey.toBuffer().copy(data, 2);
  // Write freeze authority
  if (freezeAuthority) {
    data[34] = 1;
    freezeAuthority.publicKey.toBuffer().copy(data, 35);
  }

  return new TransactionInstruction({
    keys: [
      { pubkey: mint.publicKey, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }
    ],
    programId: TOKEN_PROGRAM_ID,
    data
  });
}

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
  const lamports = await connection.getMinimumBalanceForRentExemption(MINT_ACCOUNT_SIZE);

  // Create a transaction to create the mint account
  const transaction = new Transaction().add(
    SystemProgram.createAccount({
      fromPubkey: payer.publicKey,
      newAccountPubkey: mintKeypair.publicKey,
      space: MINT_ACCOUNT_SIZE,
      lamports,
      programId: TOKEN_PROGRAM_ID,
    }),
    createInitializeMintInstruction(
      mintKeypair,  // mint
      0,            // decimals
      payer,        // mint authority
      payer         // freeze authority
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