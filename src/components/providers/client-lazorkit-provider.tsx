"use client";

import { ReactNode, useCallback, useEffect, useState } from "react";
import { Connection, PublicKey } from "@solana/web3.js";
import { LazorkitWalletContext } from "./lazorkit-wallet-context";

interface PhantomWallet {
  isConnected: boolean;
  publicKey: PublicKey;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  on: (event: string, callback: () => void) => void;
  removeAllListeners: () => void;
}

interface WindowWithPhantom extends Window {
  phantom?: {
    solana: PhantomWallet;
  };
}

export function ClientLazorkitProvider({ children }: { children: ReactNode }) {
  const [connected, setConnected] = useState(false);
  const [publicKey, setPublicKey] = useState<PublicKey | null>(null);
  const [balance, setBalance] = useState(0);

  const checkAndUpdateWalletConnection = useCallback(async () => {
    try {
      // Check if Phantom wallet is available
      const phantom = (window as WindowWithPhantom)?.phantom?.solana;
      if (!phantom) {
        throw new Error("Phantom wallet not found! Please install it.");
      }

      // If already connected, get the public key
      if (phantom.isConnected) {
        const publicKey = phantom.publicKey;
        setPublicKey(publicKey);
        setConnected(true);

        // Get and set balance
        const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_HOST!);
        const balance = await connection.getBalance(publicKey);
        setBalance(balance / 1e9); // Convert lamports to SOL
      }
    } catch (error) {
      console.error("Wallet connection error:", error);
      setConnected(false);
      setPublicKey(null);
      setBalance(0);
    }
  }, []);

  useEffect(() => {
    checkAndUpdateWalletConnection();

    // Listen for wallet connection changes
    const phantom = (window as WindowWithPhantom)?.phantom?.solana;
    if (phantom) {
      phantom.on("connect", checkAndUpdateWalletConnection);
      phantom.on("disconnect", () => {
        setConnected(false);
        setPublicKey(null);
        setBalance(0);
      });

      return () => {
        phantom.removeAllListeners();
      };
    }
  }, [checkAndUpdateWalletConnection]);

  const connect = async () => {
    try {
      const phantom = (window as WindowWithPhantom)?.phantom?.solana;
      if (!phantom) {
        throw new Error("Phantom wallet not found! Please install it.");
      }

      // Request wallet connection
      await phantom.connect();
      await checkAndUpdateWalletConnection();
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      throw error;
    }
  };

  const disconnect = async () => {
    try {
      const phantom = (window as WindowWithPhantom)?.phantom?.solana;
      if (phantom) {
        await phantom.disconnect();
        setConnected(false);
        setPublicKey(null);
        setBalance(0);
      }
    } catch (error) {
      console.error("Failed to disconnect wallet:", error);
      throw error;
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
}