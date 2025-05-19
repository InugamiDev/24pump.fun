"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { MobileNav } from "@/components/mobile-nav"
import { ModeToggle } from "@/components/mode-toggle"
import { WalletButton } from "@/components/wallet-button"

const routes = [
  {
    href: "/create",
    label: "Create Coin",
  },
  {
    href: "/discover",
    label: "Discover",
  },
  {
    href: "/how-it-works",
    label: "How It Works",
  },
  {
    href: "/explore",
    label: "Explore",
  },
  {
    href: "/about",
    label: "About",
  },
]

export function Navbar() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center md:h-16">
        <div className="flex w-full items-center justify-between md:hidden">
          <MobileNav />
          <Link href="/" className="flex items-center">
            <span className="font-heading text-lg font-bold">24pump.fun</span>
          </Link>
        </div>

        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-heading text-xl font-bold">24pump.fun</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={`transition-colors hover:text-foreground/80 ${
                  pathname === route.href
                    ? "text-foreground"
                    : "text-foreground/60"
                }`}
              >
                {route.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-2">
          <nav className="flex items-center space-x-1">
            <ModeToggle />
            <WalletButton />
          </nav>
        </div>
      </div>
    </header>
  )
}