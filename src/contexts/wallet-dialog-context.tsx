"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import { WalletNotFoundDialog } from '@/components/ui/wallet-not-found-dialog';
import { setWalletDialogHandler } from '@/lib/solana';

interface WalletDialogContextType {
  showWalletNotFoundDialog: () => void;
}

const WalletDialogContext = createContext<WalletDialogContextType | null>(null);

export function WalletDialogProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const showWalletNotFoundDialog = () => {
    setIsOpen(true);
  };

  useEffect(() => {
    setWalletDialogHandler(() => {
      setIsOpen(true);
    });
  }, []);

  return (
    <WalletDialogContext.Provider value={{ showWalletNotFoundDialog }}>
      {children}
      <WalletNotFoundDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </WalletDialogContext.Provider>
  );
}

export function useWalletDialog() {
  const context = useContext(WalletDialogContext);
  if (!context) {
    throw new Error('useWalletDialog must be used within a WalletDialogProvider');
  }
  return context;
}