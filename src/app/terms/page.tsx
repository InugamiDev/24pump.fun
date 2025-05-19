export const metadata = {
  title: "Terms of Service - 24pump.fun",
  description: "Terms of service and usage agreement for the 24pump.fun platform",
}

export default function TermsPage() {
  return (
    <div className="container py-10">
      <div className="mx-auto max-w-[800px] space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: May 19, 2025</p>
        </div>

        <div className="prose dark:prose-invert max-w-none space-y-8">
          <section>
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using 24pump.fun (&quot;the Platform&quot;), you agree to be bound
              by these Terms of Service. If you do not agree to these terms, please
              do not use the Platform.
            </p>
          </section>

          <section>
            <h2>2. Description of Service</h2>
            <p>
              24pump.fun is a platform that enables users to mint and own unique
              timestamped coins on the Solana blockchain. Each coin represents a
              specific calendar date and can only be minted once.
            </p>
          </section>

          <section>
            <h2>3. User Responsibilities</h2>
            <ul>
              <li>
                You must be at least 18 years old to use the Platform
              </li>
              <li>
                You are responsible for maintaining the security of your wallet and credentials
              </li>
              <li>
                You agree not to use the Platform for any illegal or unauthorized purposes
              </li>
              <li>
                You understand that all blockchain transactions are irreversible
              </li>
            </ul>
          </section>

          <section>
            <h2>4. Digital Assets</h2>
            <p>
              By minting a timestamped coin, you understand and agree that:
            </p>
            <ul>
              <li>
                You are purchasing a digital asset that represents ownership of a specific date
              </li>
              <li>
                The Platform does not guarantee any future value or tradability of the coins
              </li>
              <li>
                Ownership is managed through smart contracts on the Solana blockchain
              </li>
            </ul>
          </section>

          <section>
            <h2>5. $TFT Token</h2>
            <p>
              The $TFT token is a utility token used within the Platform. You acknowledge that:
            </p>
            <ul>
              <li>
                $TFT has no guaranteed value or redemption rights
              </li>
              <li>
                The token is required for minting coins and accessing certain features
              </li>
              <li>
                Token economics may be adjusted to maintain platform sustainability
              </li>
            </ul>
          </section>

          <section>
            <h2>6. Intellectual Property</h2>
            <p>
              All content and technology provided by the Platform, excluding
              user-generated content and blockchain assets, remain the property of
              24pump.fun.
            </p>
          </section>

          <section>
            <h2>7. Limitation of Liability</h2>
            <p>
              The Platform is provided &quot;as is&quot; without any warranties. We are not
              responsible for any losses incurred through the use of the Platform,
              including but not limited to:
            </p>
            <ul>
              <li>Market value fluctuations</li>
              <li>Technical blockchain issues</li>
              <li>Wallet compromises</li>
              <li>Network failures</li>
            </ul>
          </section>

          <section>
            <h2>8. Modifications</h2>
            <p>
              We reserve the right to modify these terms at any time. Users will be
              notified of significant changes, and continued use of the Platform
              constitutes acceptance of modified terms.
            </p>
          </section>

          <section>
            <h2>9. Governing Law</h2>
            <p>
              These terms are governed by and construed in accordance with
              applicable laws, without regard to conflict of law principles.
            </p>
          </section>

          <section>
            <h2>10. Contact</h2>
            <p>
              For questions about these terms, please contact us at{" "}
              <a
                href="mailto:contact@24pump.fun"
                className="text-primary hover:underline"
              >
                contact@24pump.fun
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}