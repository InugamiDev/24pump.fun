import { Button } from "@/components/ui/button"
import Link from "next/link"

export const metadata = {
  title: "About - 24pump.fun",
  description: "Learn about our vision for tokenized time and digital ownership",
}

export default function AboutPage() {
  return (
    <div className="container py-10">
      <div className="mx-auto max-w-[800px] space-y-12">
        {/* Hero */}
        <div className="space-y-4 text-center">
          <h1 className="text-4xl font-bold">About 24pump.fun</h1>
          <p className="text-xl text-muted-foreground">
            Transforming moments into tradable assets
          </p>
        </div>

        {/* Vision */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Our Vision</h2>
          <div className="space-y-4 text-muted-foreground">
            <p>
              In a digital world, time becomes a finite commodity. 24pump.fun lets users
              crystallize time into tradable memory—fueling identity, storytelling,
              and ownership. We turn dates into digital real estate.
            </p>
            <p>
              Each token is uniquely tied to a specific calendar date, creating
              permanent digital artifacts that represent moments in time. Whether
              it&apos;s a personal milestone, a cultural event, or a speculative
              opportunity, these tokens become vessels for narrative and value.
            </p>
          </div>
        </div>

        {/* How It Started */}
        <div className="rounded-lg border bg-card p-8">
          <h2 className="text-2xl font-bold">From Concept to Reality</h2>
          <div className="mt-4 space-y-4 text-muted-foreground">
            <p>
              24pump.fun emerged from a simple observation: while the blockchain
              has enabled ownership of digital art, collectibles, and virtual land,
              no one had yet tokenized time itself.
            </p>
            <p>
              We built 24pump.fun to create a new way of preserving and trading
              moments that matter. By combining blockchain technology with temporal
              scarcity, we&apos;ve created a unique platform for memory, meaning, and
              market dynamics.
            </p>
          </div>
        </div>

        {/* Key Features */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Unique Ownership</h3>
            <p className="text-muted-foreground">
              Each date can only be minted once, ensuring true scarcity and
              exclusive ownership of temporal tokens.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Narrative Value</h3>
            <p className="text-muted-foreground">
              Build stories and meaning around your dates, creating cultural and
              personal significance.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Immutable Records</h3>
            <p className="text-muted-foreground">
              All coins are permanently recorded on the Solana blockchain,
              ensuring perpetual proof of ownership.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Community Focus</h3>
            <p className="text-muted-foreground">
              Join a network of collectors and storytellers who value the
              intersection of time and blockchain technology.
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="flex flex-col items-center gap-6 rounded-lg border bg-card p-8 text-center">
          <h2 className="text-2xl font-bold">Ready to Own Your Moment?</h2>
          <p className="text-muted-foreground">
            Join us in building the future of temporal ownership
          </p>
          <Button size="lg" asChild>
            <Link href="/create">Create Your First Coin</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}