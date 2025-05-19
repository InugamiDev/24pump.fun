"use client"
import * as React from "react"
import { useForm } from "react-hook-form"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useWallet } from "@solana/wallet-adapter-react"
import { WalletButton } from "@/components/wallet-button"

type FormData = {
  date: Date | undefined
}

const steps = [
  {
    id: "wallet",
    title: "Connect Wallet",
    description: "Connect your Solana wallet to proceed",
  },
  {
    id: "date",
    title: "Choose Date",
    description: "Select the date you want to mint",
  },
  {
    id: "confirm",
    title: "Confirm Creation",
    description: "Review and confirm your coin creation",
  },
]

// Example of minted dates - in production this would come from the blockchain
const mintedDates = [
  new Date("2025-12-25"), // Christmas
  new Date("2025-01-01"), // New Year
  new Date("2025-02-14"), // Valentine's
]

export function CreateCoinForm() {
  const [step, setStep] = React.useState(0)
  const { connected } = useWallet()
  
  const form = useForm<FormData>({
    defaultValues: {
      date: undefined,
    },
  })

  // Auto-advance to next step when wallet is connected
  React.useEffect(() => {
    if (connected && step === 0) {
      setStep(1)
    }
  }, [connected, step])

  function onSubmit(data: FormData) {
    if (step < steps.length - 1) {
      setStep(step + 1)
    } else {
      console.log("Form submitted", data)
      // TODO: Call contract to mint coin
    }
  }

  return (
    <div className="space-y-8">
      {/* Progress Steps */}
      <nav aria-label="Progress">
        <ol role="list" className="space-y-4 md:flex md:space-x-8 md:space-y-0">
          {steps.map((s, i) => (
            <li key={s.id} className="md:flex-1">
              <div
                className={`group flex flex-col border-l-4 py-2 pl-4 hover:border-slate-400 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4 ${
                  step === i
                    ? "border-primary"
                    : step > i
                    ? "border-primary/50"
                    : "border-slate-200"
                }`}
              >
                <span className="text-sm font-medium">Step {i + 1}</span>
                <span className="text-sm">{s.title}</span>
              </div>
            </li>
          ))}
        </ol>
      </nav>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {step === 0 && (
            <div className="flex flex-col items-center gap-6">
              <p className="text-center text-muted-foreground">
                Connect your wallet to start minting your timestamped coin
              </p>
              <WalletButton />
            </div>
          )}

          {step === 1 && (
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Select Date</FormLabel>
                  <FormControl>
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => {
                        // Check if the date is already minted
                        return mintedDates.some(
                          (mintedDate) =>
                            mintedDate.getMonth() === date.getMonth() &&
                            mintedDate.getDate() === date.getDate()
                        )
                      }}
                      className="rounded-md border"
                    />
                  </FormControl>
                  <FormDescription>
                    Choose a date that means something special to you. Dates that are already minted will be disabled.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {step === 2 && (
            <div className="rounded-lg border bg-card p-6">
              <h3 className="mb-4 text-lg font-semibold">Review Your Selection</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Selected Date</span>
                  <span className="font-medium">
                    {form.getValues("date")?.toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cost</span>
                  <span className="font-medium">100 TFT</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Your TFT Balance</span>
                  <span className="font-medium">
                    {/* TODO: Get actual TFT balance */}
                    0 TFT
                  </span>
                </div>
              </div>
            </div>
          )}

          {step > 0 && (
            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(step - 1)}
              >
                Previous
              </Button>
              <Button type="submit">
                {step === steps.length - 1 ? "Create Coin" : "Next"}
              </Button>
            </div>
          )}
        </form>
      </Form>
    </div>
  )
}