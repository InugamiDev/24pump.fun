"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { CalendarTime } from "@/components/ui/calendar-time";
import { useLazorkitWallet } from "./providers/lazorkit-wallet-context";
import { createMomentCoinSeries, listSocialCauses } from "@/app/actions";
import { MomentCoinError, getErrorMessage } from "@/lib/errors";
import { useTFT } from "@/hooks/use-tft";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Switch } from "./ui/switch";
import { Spinner } from "./ui/spinner";
import { FeedbackBar } from "./ui/feedback-bar";
import { toast } from "sonner";

interface SocialCause {
  id: string;
  name: string;
  description: string | null;
}

const formSchema = z.object({
  name: z.string().min(3, {
    message: "Name must be at least 3 characters.",
  }),
  symbol: z
    .string()
    .min(2, {
      message: "Symbol must be at least 2 characters.",
    })
    .max(10, {
      message: "Symbol must be at most 10 characters.",
    })
    .toUpperCase(),
  momentDateTime: z.date({
    required_error: "Please select a date and time.",
  }),
  narrative: z.string().min(10, {
    message: "Please provide a meaningful narrative for your moment.",
  }),
  totalSupply: z.string().regex(/^\d+$/, {
    message: "Total supply must be a positive number.",
  }),
  socialCauseId: z.string({
    required_error: "Please select a social cause to support.",
  }),
  burnable: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

const defaultValues: FormValues = {
  name: "",
  symbol: "",
  momentDateTime: new Date(),
  narrative: "",
  totalSupply: "",
  socialCauseId: "",
  burnable: false,
};

export function CreateCoinForm() {
  const { connected, publicKey } = useLazorkitWallet();
  const { balance, setupTftAccount } = useTFT();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCauses, setIsLoadingCauses] = useState(false);
  const [socialCauses, setSocialCauses] = useState<SocialCause[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  async function onSubmit(values: FormValues) {
    if (!connected || !publicKey) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setSuccess(false);

      // Ensure user has a TFT token account
      await setupTftAccount();

      // Create the moment coin series
      const result = await createMomentCoinSeries({
        ...values,
        momentDateTimeUTC: values.momentDateTime.toISOString(),
        creatorWallet: publicKey.toString(),
        totalSupply: BigInt(values.totalSupply),
      });

      if (!result.success) {
        throw new MomentCoinError(result.message);
      }

      setSuccess(true);
      toast.success("Moment Coin Series created successfully!");
      form.reset(defaultValues);
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      console.error("Error creating moment coin:", err);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    async function loadSocialCauses() {
      try {
        setIsLoadingCauses(true);
        setError(null);
        const result = await listSocialCauses();
        if (result.success && result.causes) {
          setSocialCauses(result.causes);
        } else {
          throw new MomentCoinError(result.message || "Failed to load social causes");
        }
      } catch (err) {
        const errorMessage = getErrorMessage(err);
        console.error("Error loading social causes:", err);
        setError(errorMessage);
      } finally {
        setIsLoadingCauses(false);
      }
    }
    loadSocialCauses();
  }, []);

  if (!connected) {
    return (
      <div className="text-center">
        <p className="mb-4">Please connect your wallet to create a moment coin.</p>
        <Button variant="outline" size="lg">Connect Wallet</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FeedbackBar
        isLoading={isLoading}
        loadingMessage="Creating your moment coin..."
        error={error}
        errorTitle="Creation Failed"
        success={success}
        successTitle="Moment Coin Created"
        successMessage="Your moment coin has been successfully created and minted."
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="My Birthday 2025" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="symbol"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Symbol</FormLabel>
                <FormControl>
                  <Input placeholder="BDAY25" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="momentDateTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date and Time</FormLabel>
                <FormControl>
                  <CalendarTime
                    date={field.value ?? null}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="narrative"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Narrative</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Tell the story behind this moment..."
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="totalSupply"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Supply</FormLabel>
                <FormControl>
                  <Input type="number" min="1" placeholder="1000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="socialCauseId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Social Cause</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={isLoadingCauses}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={
                        isLoadingCauses 
                          ? "Loading causes..." 
                          : "Select a cause to support"
                      } />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {isLoadingCauses ? (
                      <div className="flex items-center justify-center p-4">
                        <Spinner className="text-muted-foreground" />
                      </div>
                    ) : (
                      socialCauses.map((cause) => (
                        <SelectItem key={cause.id} value={cause.id}>
                          {cause.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="burnable"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>Burnable</FormLabel>
                  <div className="text-sm text-muted-foreground">
                    Allow tokens to be burned (permanently removed from circulation)
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            disabled={isLoading || isLoadingCauses} 
            className="w-full"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Spinner className="text-current" size="sm" />
                <span>Creating...</span>
              </div>
            ) : (
              "Create Moment Coin"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}