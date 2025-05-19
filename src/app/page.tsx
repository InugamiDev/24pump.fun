import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="container flex flex-col items-center justify-center gap-4 py-24 md:py-32">
        <div className="flex flex-col items-center gap-4 text-center">
          <h1 className="text-4xl font-bold sm:text-5xl md:text-6xl lg:text-7xl">
            Your Moment,{" "}
            <span className="bg-gradient-to-r from-purple-500 via-teal-500 to-yellow-500 bg-clip-text text-transparent">
              Tokenized
            </span>
          </h1>
          <p className="max-w-[42rem] text-muted-foreground sm:text-xl">
            Mint a coin tied to a specific calendar date—creating digital artifacts of time, milestones, and narrative ownership.
          </p>
          <div className="flex gap-4">
            <Button asChild size="lg">
              <Link href="/create">Create Coin</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/how-it-works">How It Works</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* What Is Section */}
      <section className="container py-16 md:py-24">
        <div className="grid gap-12 md:grid-cols-2 md:gap-16">
          <div>
            <h2 className="text-3xl font-bold">What Is 24pump.fun?</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              24pump.fun transforms moments into tradable assets. Users mint timestamped tokens (MM/DD), each uniquely representing a day in the year. These tokens, once minted, are permanently tied to your chosen date and exist on-chain.
            </p>
          </div>
          <div className="grid gap-4">
            <h3 className="text-xl font-bold">Why It&apos;s Different</h3>
            <ul className="grid gap-3 text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="text-foreground">•</span>
                Own meaningful dates permanently on the blockchain
              </li>
              <li className="flex items-start gap-3">
                <span className="text-foreground">•</span>
                Create value through narrative and cultural significance
              </li>
              <li className="flex items-start gap-3">
                <span className="text-foreground">•</span>
                Trade and share your timestamped memories
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="container py-16 md:py-24">
        <h2 className="mb-12 text-center text-3xl font-bold">Why Create a Timestamped Coin?</h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Personal Milestone",
              description: "Mint your birthday or anniversary as a permanent on-chain relic.",
            },
            {
              title: "Cultural Significance",
              description: "Own historically or culturally significant dates like holidays.",
            },
            {
              title: "Narrative Ownership",
              description: "Create value through story and meaning attached to specific dates.",
            },
            {
              title: "Digital Real Estate",
              description: "Secure unique dates before someone else claims them.",
            },
            {
              title: "Tradable Asset",
              description: "Exchange your timestamped coins with other collectors.",
            },
            {
              title: "Community",
              description: "Join a network of temporal collectors and storytellers.",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm"
            >
              <h3 className="mb-2 font-bold">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="container py-16 md:py-24">
        <h2 className="mb-12 text-center text-3xl font-bold">How It Works</h2>
        <div className="mx-auto grid max-w-4xl gap-8">
          {[
            {
              step: 1,
              title: "Connect Your Wallet",
              description: "Link your Solana wallet to get started.",
            },
            {
              step: 2,
              title: "Choose Your Date",
              description: "Select any available date from the calendar (MM/DD).",
            },
            {
              step: 3,
              title: "Pay with $TFT",
              description: "Use $TFT tokens to mint your timestamped coin.",
            },
            {
              step: 4,
              title: "Own Your Moment",
              description: "Receive your unique date token, stored permanently on-chain.",
            },
          ].map((step) => (
            <div
              key={step.step}
              className="flex items-start gap-4 rounded-lg border bg-card p-6 text-card-foreground"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                {step.step}
              </div>
              <div>
                <h3 className="font-bold">{step.title}</h3>
                <p className="mt-1 text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TFT Economy */}
      <section className="container py-16 md:py-24">
        <h2 className="mb-12 text-center text-3xl font-bold">TFT Economy</h2>
        <div className="mx-auto grid max-w-4xl gap-8 rounded-lg border bg-card p-8 text-card-foreground">
          <div className="grid gap-4">
            <h3 className="text-xl font-bold">What is $TFT?</h3>
            <p className="text-muted-foreground">
              $TFT is the utility token that powers the 24pump.fun ecosystem. It&apos;s used for minting timestamped coins and governs access to the platform.
            </p>
          </div>
          <div className="grid gap-4">
            <h3 className="text-xl font-bold">How to Get $TFT</h3>
            <div className="flex items-center justify-center gap-8">
              <div className="text-center">
                <p className="font-bold">SOL</p>
              </div>
              <div className="text-2xl">→</div>
              <div className="text-center">
                <p className="font-bold">$TFT</p>
              </div>
              <div className="text-2xl">→</div>
              <div className="text-center">
                <p className="font-bold">Coin</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose */}
      <section className="container py-16 md:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-6 text-3xl font-bold">Why Choose 24pump.fun?</h2>
          <p className="mb-12 text-lg text-muted-foreground">
            We&apos;re building more than just a platform—we&apos;re creating a new way to own and trade time itself. With unique features, a sustainable economy, and a focus on narrative value, 24pump.fun is pioneering the future of temporal ownership.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-16 md:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-6 text-3xl font-bold">Ready to mint your piece of time?</h2>
          <Button size="lg" asChild>
            <Link href="/create">Create Coin Now</Link>
          </Button>
        </div>
      </section>
    </>
  )
}
