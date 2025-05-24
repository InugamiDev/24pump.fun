import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { PhantomProvider, WindowWithPhantom } from "@/types/phantom";

export const SOLANA_RPC_ENDPOINT = process.env.NEXT_PUBLIC_SOLANA_RPC_HOST!;
export const connection = new Connection(SOLANA_RPC_ENDPOINT);

export async function getBalance(publicKey: PublicKey): Promise<number> {
  try {
    const balance = await connection.getBalance(publicKey);
    return balance / 1e9; // Convert lamports to SOL
  } catch (error) {
    console.error("Error fetching balance:", error);
    return 0;
  }
}

export async function signAndSendTransaction(
  transaction: Transaction,
  phantom: PhantomProvider,
  feePayer: PublicKey
): Promise<string> {
  try {
    // Get the latest blockhash and set transaction parameters
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = feePayer;

    // Sign and send the transaction
    const { signature } = await phantom.signAndSendTransaction(transaction);
    await connection.confirmTransaction(signature, "confirmed");
    return signature;
  } catch (error) {
    console.error("Transaction failed:", error);
    throw error;
  }
}

export function shortenAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

let showWalletNotFoundDialog: (() => void) | null = null;

export function setWalletDialogHandler(handler: () => void) {
  showWalletNotFoundDialog = handler;
}

export async function getPhantomWallet(): Promise<PhantomProvider | null> {
  const phantom = (window as WindowWithPhantom)?.phantom?.solana;
  
  if (!phantom) {
    if (showWalletNotFoundDialog) {
      showWalletNotFoundDialog();
    }
    return null;
  }
  
  return phantom;
}

export async function requestWalletConnection(): Promise<PublicKey | null> {
  const phantom = await getPhantomWallet();
  
  if (!phantom) {
    return null;
  }
  
  if (!phantom.isConnected) {
    try {
      await phantom.connect();
    } catch (error) {
      console.error("Error connecting to Phantom wallet:", error);
      return null;
    }
  }
  
  return phantom.publicKey ? new PublicKey(phantom.publicKey) : null;
}

export function isValidPublicKey(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}