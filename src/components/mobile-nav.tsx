"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

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

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative mr-2 h-8 w-8 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent 
        side="left" 
        className="w-[280px] pr-0"
      >
        <SheetHeader className="border-b pb-4">
          <SheetTitle asChild>
            <Link
              href="/"
              className="flex items-center"
              onClick={() => setOpen(false)}
            >
              <span className="font-heading text-xl font-bold">24pump.fun</span>
            </Link>
          </SheetTitle>
        </SheetHeader>
        <nav className="mt-6 flex flex-col space-y-3 pl-8">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              onClick={() => setOpen(false)}
              className={`group flex w-full items-center py-2 text-sm font-medium transition-colors hover:text-foreground/80 ${
                pathname === route.href
                  ? "text-foreground"
                  : "text-foreground/60"
              }`}
            >
              <span className="relative">
                {route.label}
                {pathname === route.href && (
                  <span
                    className="absolute -left-2 top-1/2 h-1 w-1 -translate-y-1/2 rounded-full bg-foreground"
                    aria-hidden="true"
                  />
                )}
              </span>
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  )
}