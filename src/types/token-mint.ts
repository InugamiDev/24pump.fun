export interface ParsedMintInfo {
  isInitialized: boolean;
  decimals: number;
  mintAuthority: string;
  supply: string;
  freezeAuthority?: string;
}

export interface ParsedMintAccountData {
  type: string;
  info: ParsedMintInfo;
}

export interface ParsedMintAccount {
  program: string;
  parsed: ParsedMintAccountData;
  space: number;
}