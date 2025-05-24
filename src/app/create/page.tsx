"use client";

import { CreateCoinForm } from "@/components/create-coin-form";
import { FeedbackBar } from "@/components/ui/feedback-bar";
import { TokenExchange } from "@/components/token-exchange";

export default function CreatePage() {
  return (
    <div className="container max-w-2xl py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create Moment Coin</h1>
        <p className="text-muted-foreground">
          Create a unique moment coin that captures a special date and contributes to social causes.
        </p>
      </div>

      <div className="space-y-8">
        {/* Token Exchange Section */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-xl font-semibold mb-4">Get TFT Tokens</h2>
          <p className="text-muted-foreground mb-6">
            Exchange SOL for TFT tokens to create moment coins. You can also exchange TFT back to SOL if needed.
          </p>
          <TokenExchange />
        </div>

        {/* Create Coin Form Section */}
        <div className="rounded-lg border border-border bg-card p-6">
          <CreateCoinForm />
        </div>
      </div>

      <div className="mt-8 text-sm text-muted-foreground">
        <h3 className="font-medium mb-2">Note:</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>
            Creating a moment coin requires TFT tokens as a platform fee
          </li>
          <li>
            A portion of the fee will be contributed to your chosen social cause
          </li>
          <li>
            Make sure your wallet has sufficient SOL for transaction fees
          </li>
        </ul>
      </div>
    </div>
  );
}