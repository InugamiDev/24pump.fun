"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface WalletNotFoundDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WalletNotFoundDialog({ isOpen, onClose }: WalletNotFoundDialogProps) {
  const handleInstallClick = () => {
    window.open('https://phantom.app/', '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Wallet Not Found</DialogTitle>
          <DialogDescription>
            A Solana wallet is required to use this application. We recommend installing Phantom Wallet.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-4 mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleInstallClick}>
            Install Phantom Wallet
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}