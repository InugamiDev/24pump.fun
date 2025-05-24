"use client";

import { Button } from "@/components/ui/button";
import { useLazorkitWallet } from "./providers/lazorkit-wallet-context";

export function WalletButton() {
  const { connected, publicKey, balance, connect, disconnect } = useLazorkitWallet();

  const handleClick = async () => {
    try {
      if (connected) {
        await disconnect();
      } else {
        await connect();
      }
    } catch (error) {
      console.error("Wallet operation failed:", error);
    }
  };

  return (
    <Button
      onClick={handleClick}
      variant={connected ? "outline" : "default"}
    >
      {connected ? (
        <div className="flex items-center gap-2">
          <span>{`${publicKey?.toString().slice(0, 4)}...${publicKey?.toString().slice(-4)}`}</span>
          <span className="text-sm text-muted-foreground">
            ({balance.toFixed(2)} SOL)
          </span>
        </div>
      ) : (
        "Connect Wallet"
      )}
    </Button>
  );
}