"use client"
 
import React from "react"
import { useWallet } from "@lazorkit/wallet"
import { LazorKitWalletContext } from "./lazorkit-wallet-context"
 
export function ClientLazorKitProvider({ children }: { children: React.ReactNode }) {
  const walletState = useWallet()
  
  return (
    <LazorKitWalletContext.Provider value={walletState}>
      {children}
    </LazorKitWalletContext.Provider>
  )
}