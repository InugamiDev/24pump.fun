import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export const metadata = {
  title: "FAQ - 24pump.fun",
  description: "Frequently asked questions about timestamped coins and the 24pump.fun platform",
}

const faqs = [
  {
    question: "What is a timestamped coin?",
    answer:
      "A timestamped coin is a unique digital asset on the Solana blockchain that represents ownership of a specific calendar date (MM/DD). Each date can only be minted once, making these coins scarce and valuable digital artifacts.",
  },
  {
    question: "How do I mint a coin?",
    answer:
      "To mint a coin, you'll need to: 1) Connect your Solana wallet, 2) Select an available date, 3) Have sufficient $TFT tokens, and 4) Complete the minting transaction. The process is guided and user-friendly.",
  },
  {
    question: "What is $TFT?",
    answer:
      "$TFT (Time Fragment Token) is the utility token of 24pump.fun. It's required for minting coins and governs access to platform features. You can acquire $TFT by exchanging SOL through our platform.",
  },
  {
    question: "What happens if someone already claimed my date?",
    answer:
      "Each date can only be minted once. If your desired date is already taken, you can either choose another date or potentially negotiate with the current owner once our trading features are live.",
  },
  {
    question: "Can I trade or sell my coin?",
    answer:
      "Trading functionality will be available in Phase 2 of our platform. Once launched, you'll be able to transfer or sell your coins to other users, creating a dynamic marketplace for temporal ownership.",
  },
  {
    question: "Are the coins transferable?",
    answer:
      "Yes, coins are standard Solana tokens and can be transferred between wallets. However, the original mint date and creator will always be preserved on-chain.",
  },
  {
    question: "Why should I mint a date?",
    answer:
      "People mint dates for various reasons: to commemorate personal milestones, claim culturally significant dates, speculate on future value, or simply participate in a novel form of digital ownership.",
  },
  {
    question: "How is the value determined?",
    answer:
      "The value of a timestamped coin is determined by several factors: the significance of the date (holidays, events), the narrative attached to it, and market demand once trading is enabled.",
  },
  {
    question: "What blockchain is this built on?",
    answer:
      "24pump.fun is built on the Solana blockchain, chosen for its fast transactions, low fees, and robust NFT ecosystem.",
  },
  {
    question: "Is there a limit to how many coins I can mint?",
    answer:
      "There's no limit to how many different dates you can mint, as long as they're available and you have sufficient $TFT tokens. However, each specific date can only be minted once.",
  },
]

export default function FAQPage() {
  return (
    <div className="container py-10">
      <div className="mx-auto max-w-[800px] space-y-8">
        <div className="space-y-4 text-center">
          <h1 className="text-4xl font-bold">Frequently Asked Questions</h1>
          <p className="text-xl text-muted-foreground">
            Everything you need to know about 24pump.fun
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-8 rounded-lg border bg-card p-6">
          <p className="text-center text-muted-foreground">
            Still have questions?{" "}
            <a
              href="mailto:contact@24pump.fun"
              className="font-medium text-primary hover:underline"
            >
              Contact our support team
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}