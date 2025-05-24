export interface PhantomProvider {
  isConnected: boolean;
  publicKey: string;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  signAndSendTransaction(transaction: unknown): Promise<{ signature: string }>;
  signMessage(message: Uint8Array): Promise<{ signature: Uint8Array }>;
}

export interface WindowWithPhantom extends Window {
  phantom?: {
    solana?: PhantomProvider;
  };
}