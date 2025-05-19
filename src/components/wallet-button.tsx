import { useWallet } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { Button } from "@/components/ui/button"
import { shortenAddress } from "@/lib/utils"

export function WalletButton() {
  const { connected, publicKey } = useWallet()

  return (
    <div className="relative ml-2">
      {connected ? (
        <div className="hidden sm:block">
          <WalletMultiButton className="!bg-secondary hover:!bg-secondary/90" />
        </div>
      ) : (
        <Button 
          variant="secondary" 
          className="hidden sm:inline-flex"
        >
          Connect Wallet
        </Button>
      )}

      {/* Mobile Version */}
      <div className="sm:hidden">
        {connected ? (
          <Button variant="secondary" size="sm">
            {shortenAddress(publicKey?.toString() || "")}
          </Button>
        ) : (
          <Button variant="secondary" size="sm">
            Connect
          </Button>
        )}
      </div>
    </div>
  )
}