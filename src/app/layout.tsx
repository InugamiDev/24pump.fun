import type { Metadata } from "next"
import { Space_Grotesk, Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ClientLazorkitProvider } from "@/components/providers/client-lazorkit-provider"
import { WalletDialogProvider } from "@/contexts/wallet-dialog-context"
import "./globals.css"

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
})

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "24pump.fun – Tokenize Moments for Social Good on Solana",
  description: "Create unique, date-stamped crypto coins on Solana with 24pump.fun. Turn your moments into tradable assets that fuel positive social impact and build a trustworthy crypto ecosystem.",
  keywords: ["Social Impact Crypto", "Solana Projects", "Meme Coin with Purpose", "Tokenize Moments", "Anti Rug Pull Crypto", "Crypto Philanthropy", "Date Token", "Blockchain for Good", "Limited Supply Token", "Charitable Crypto"],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${spaceGrotesk.variable} ${inter.variable} font-sans antialiased min-h-screen flex flex-col`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <WalletDialogProvider>
            <ClientLazorkitProvider>
            <div className="flex min-h-screen flex-col">
              <Navbar />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
            </ClientLazorkitProvider>
          </WalletDialogProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
