"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { PublicKey } from "@solana/web3.js";
import { createMomentCoinMint } from "@/lib/token-minting";
import { getTftBalance } from "@/lib/tft-token";

// Input validation schemas
const CreateMomentCoinSeriesSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  symbol: z.string().min(2, "Symbol must be at least 2 characters").max(10, "Symbol too long"),
  momentDateTimeUTC: z.string().datetime("Invalid date/time format"),
  narrative: z.string().min(10, "Narrative is too short"),
  totalSupply: z.bigint(),
  socialCauseId: z.string().cuid("Invalid social cause ID"),
  burnable: z.boolean().optional().default(false),
  creatorWallet: z.string(), // Public key of the creator's wallet
});

export type CreateMomentCoinSeriesInput = z.infer<typeof CreateMomentCoinSeriesSchema>;

export interface CreateMomentCoinSeriesResult {
  success: boolean;
  message: string;
  seriesId?: string;
  smartContractAddress?: string;
  transactionSignature?: string;
}

export interface ListSocialCausesResult {
  success: boolean;
  message?: string;
  causes?: Array<{
    id: string;
    name: string;
    description: string | null;
  }>;
}

const REQUIRED_TFT_AMOUNT = BigInt(1000); // Example: 1000 TFT tokens required to create a series

export async function createMomentCoinSeries(
  input: CreateMomentCoinSeriesInput
): Promise<CreateMomentCoinSeriesResult> {
  try {
    // 1. Validate input
    const validation = CreateMomentCoinSeriesSchema.safeParse(input);
    if (!validation.success) {
      return { 
        success: false, 
        message: "Invalid input: " + JSON.stringify(validation.error.flatten().fieldErrors) 
      };
    }

    const { name, symbol, momentDateTimeUTC, narrative, totalSupply, socialCauseId, burnable, creatorWallet } = validation.data;
    const creatorPublicKey = new PublicKey(creatorWallet);

    // 2. Verify social cause exists
    const socialCause = await prisma.socialCause.findUnique({
      where: { id: socialCauseId, isActive: true },
    });

    if (!socialCause) {
      return { success: false, message: "Invalid or inactive social cause." };
    }

    // 3. Check TFT balance
    const tftBalance = await getTftBalance(creatorPublicKey);
    if (tftBalance < Number(REQUIRED_TFT_AMOUNT)) {
      return { success: false, message: "Insufficient TFT balance." };
    }

    // 4. Create the SPL token for this moment coin series
    const { mintAddress, signature } = await createMomentCoinMint(creatorPublicKey, {
      name,
      symbol,
      totalSupply,
      decimals: 0, // Non-divisible tokens
      burnable,
    });

    // 5. Create or get the user
    const user = await prisma.user.upsert({
      where: { wallet: creatorWallet },
      update: {},
      create: { wallet: creatorWallet },
    });

    // 6. Save the moment coin series
    const momentCoinSeries = await prisma.momentCoinSeries.create({
      data: {
        name,
        symbol,
        momentDateTimeUTC: new Date(momentDateTimeUTC),
        narrative,
        totalSupply,
        smartContractAddress: mintAddress,
        creationTxSignature: signature,
        burnable,
        socialCauseId,
        ownerId: user.id,
      },
    });

    return {
      success: true,
      message: "Moment Coin Series created successfully!",
      seriesId: momentCoinSeries.id,
      smartContractAddress: mintAddress,
      transactionSignature: signature,
    };

  } catch (error) {
    console.error("Error creating moment coin series:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to create moment coin series",
    };
  }
}

// Action to list available social causes
export async function listSocialCauses(): Promise<ListSocialCausesResult> {
  try {
    const causes = await prisma.socialCause.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        description: true,
      },
    });
    return { success: true, causes };
  } catch (error) {
    console.error("Error fetching social causes:", error);
    return { 
      success: false, 
      message: "Failed to fetch social causes",
      causes: [] 
    };
  }
}