"use client";

import { useCallback, useEffect, useState } from "react";
import { useLazorkitWallet } from "@/components/providers/lazorkit-wallet-context";
import {
  getTftBalance,
  ensureTftAta,
  exchangeSolToTft,
  exchangeTftToSol
} from "@/lib/tft-token";

export function useTFT() {
  const { connected, publicKey } = useLazorkitWallet();
  const [balance, setBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = useCallback(async () => {
    if (!connected || !publicKey) {
      setBalance(0);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const balance = await getTftBalance(publicKey);
      setBalance(balance);
    } catch (error) {
      console.error("Error fetching TFT balance:", error);
      setError("Failed to fetch TFT balance");
      setBalance(0);
    } finally {
      setIsLoading(false);
    }
  }, [connected, publicKey]);

  const setupTftAccount = useCallback(async () => {
    if (!connected || !publicKey) {
      throw new Error("Wallet not connected");
    }

    try {
      setIsLoading(true);
      setError(null);
      const ataAddress = await ensureTftAta(publicKey);
      await fetchBalance();
      return ataAddress;
    } catch (error) {
      console.error("Error setting up TFT account:", error);
      setError("Failed to setup TFT account");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [connected, publicKey, fetchBalance]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  const exchangeToTft = useCallback(async (solAmount: number) => {
    if (!connected || !publicKey) {
      throw new Error("Wallet not connected");
    }

    try {
      setIsLoading(true);
      setError(null);
      const signature = await exchangeSolToTft(publicKey, solAmount);
      await fetchBalance();
      return signature;
    } catch (error) {
      console.error("Error exchanging SOL to TFT:", error);
      setError("Failed to exchange SOL to TFT");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [connected, publicKey, fetchBalance]);

  const exchangeToSol = useCallback(async (tftAmount: number) => {
    if (!connected || !publicKey) {
      throw new Error("Wallet not connected");
    }

    try {
      setIsLoading(true);
      setError(null);
      const signature = await exchangeTftToSol(publicKey, tftAmount);
      await fetchBalance();
      return signature;
    } catch (error) {
      console.error("Error exchanging TFT to SOL:", error);
      setError("Failed to exchange TFT to SOL");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [connected, publicKey, fetchBalance]);

  return {
    balance,
    isLoading,
    error,
    fetchBalance,
    setupTftAccount,
    exchangeToTft,
    exchangeToSol,
    formattedBalance: balance.toLocaleString(),
  };
}