import { createContext, useContext, useState } from "react";
import { Connection, PublicKey } from "@solana/web3.js";

interface SolanaWallet {
  connect: () => Promise<void>;
  publicKey: PublicKey;
}

interface WindowWithSolana extends Window {
  solana?: SolanaWallet;
}

interface LazorkitWalletContextType {
  connected: boolean;
  publicKey: PublicKey | null;
  balance: number;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

export const LazorkitWalletContext = createContext<LazorkitWalletContextType>({
  connected: false,
  publicKey: null,
  balance: 0,
  connect: async () => {},
  disconnect: async () => {},
});

export const LazorKitWalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const [publicKey, setPublicKey] = useState<PublicKey | null>(null);
  const [balance, setBalance] = useState(0);

  const connect = async (): Promise<void> => {
    try {
      // Check if Solana wallet is available in the browser
      const solana = (window as WindowWithSolana).solana;
      
      if (!solana) {
        throw new Error("Solana wallet not found! Please install a Solana wallet extension.");
      }
      
      // Request connection to the wallet
      await solana.connect();
      
      // Get the public key
      const publicKeyObj = solana.publicKey;
      if (!publicKeyObj) {
        throw new Error("Failed to get public key from wallet");
      }
      
      setPublicKey(publicKeyObj);
      
      // Get the account balance
      const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT || "https://api.mainnet-beta.solana.com");
      const balance = await connection.getBalance(publicKeyObj);
      setBalance(balance / 1000000000); // Convert lamports to SOL
      
      setConnected(true);
      console.log("Connected to wallet:", publicKeyObj.toString());
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      setConnected(false);
    }
  };

  const disconnect = async (): Promise<void> => {
    try {
      // Implement actual wallet disconnection logic
      console.log("Disconnecting wallet...");
      setConnected(false);
      setPublicKey(null);
      setBalance(0);
    } catch (error) {
      console.error("Failed to disconnect wallet:", error);
    }
  };

  return (
    <LazorkitWalletContext.Provider
      value={{
        connected,
        publicKey,
        balance,
        connect,
        disconnect,
      }}
    >
      {children}
    </LazorkitWalletContext.Provider>
  );
};

export const useLazorkitWallet = () => useContext(LazorkitWalletContext);