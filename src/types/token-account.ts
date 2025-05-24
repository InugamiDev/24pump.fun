import { PublicKey } from "@solana/web3.js";

export interface TokenAmount {
  amount: string;
  decimals: number;
  uiAmount: number;
  uiAmountString: string;
}

export interface ParsedTokenAccountInfo {
  mint: string;
  owner: string;
  state: string;
  tokenAmount: TokenAmount;
}

export interface ParsedTokenAccountData {
  program: string;
  space: number;
  parsed: {
    info: ParsedTokenAccountInfo;
    type: string;
  };
}

export interface ParsedTokenAccount {
  pubkey: PublicKey;
  account: {
    data: ParsedTokenAccountData;
    executable: boolean;
    lamports: number;
    owner: PublicKey;
    rentEpoch: number;
  };
}