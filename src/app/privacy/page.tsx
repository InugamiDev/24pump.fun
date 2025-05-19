export const metadata = {
  title: "Privacy Policy - 24pump.fun",
  description: "Privacy policy and data handling practices for the 24pump.fun platform",
}

export default function PrivacyPage() {
  return (
    <div className="container py-10">
      <div className="mx-auto max-w-[800px] space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: May 19, 2025</p>
        </div>

        <div className="prose dark:prose-invert max-w-none space-y-8">
          <section>
            <h2>1. Introduction</h2>
            <p>
              24pump.fun (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your
              privacy. This Privacy Policy explains how we collect, use, and
              safeguard your information when you use our platform.
            </p>
          </section>

          <section>
            <h2>2. Information We Collect</h2>
            <h3>2.1 Blockchain Data</h3>
            <p>
              We collect and process public blockchain data, including:
            </p>
            <ul>
              <li>Wallet addresses</li>
              <li>Transaction history</li>
              <li>Smart contract interactions</li>
              <li>Token balances</li>
            </ul>

            <h3>2.2 Usage Data</h3>
            <p>
              We automatically collect certain information when you use the Platform:
            </p>
            <ul>
              <li>Device and browser information</li>
              <li>IP address</li>
              <li>Pages visited and features used</li>
              <li>Time and date of visits</li>
            </ul>
          </section>

          <section>
            <h2>3. How We Use Your Information</h2>
            <p>We use the collected information for:</p>
            <ul>
              <li>Providing and maintaining the Platform</li>
              <li>Processing transactions</li>
              <li>Improving user experience</li>
              <li>Security and fraud prevention</li>
              <li>Communications about your account</li>
              <li>Legal compliance</li>
            </ul>
          </section>

          <section>
            <h2>4. Information Sharing</h2>
            <p>
              We do not sell your personal information. We may share information:
            </p>
            <ul>
              <li>With service providers who assist in platform operations</li>
              <li>When required by law or regulation</li>
              <li>To protect our rights or property</li>
              <li>During a corporate transaction (merger, acquisition, etc.)</li>
            </ul>
          </section>

          <section>
            <h2>5. Blockchain Transparency</h2>
            <p>
              Please note that blockchain transactions are public by nature.
              Information stored on the blockchain, including wallet addresses and
              transaction details, is visible to anyone.
            </p>
          </section>

          <section>
            <h2>6. Data Security</h2>
            <p>
              We implement appropriate security measures to protect your
              information. However, no internet transmission is completely secure,
              and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2>7. Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data (where applicable)</li>
              <li>Object to processing</li>
              <li>Data portability</li>
            </ul>
          </section>

          <section>
            <h2>8. Cookies and Tracking</h2>
            <p>
              We use cookies and similar technologies to improve user experience
              and collect usage data. You can control cookie settings through your
              browser preferences.
            </p>
          </section>

          <section>
            <h2>9. Children&apos;s Privacy</h2>
            <p>
              Our Platform is not intended for children under 18. We do not
              knowingly collect information from children under 18 years of age.
            </p>
          </section>

          <section>
            <h2>10. International Transfers</h2>
            <p>
              Your information may be transferred and processed in countries other
              than your own. By using the Platform, you consent to such transfers.
            </p>
          </section>

          <section>
            <h2>11. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy periodically. We will notify you
              of significant changes through the Platform or via email.
            </p>
          </section>

          <section>
            <h2>12. Contact Us</h2>
            <p>
              For privacy-related questions, please contact us at{" "}
              <a
                href="mailto:privacy@24pump.fun"
                className="text-primary hover:underline"
              >
                privacy@24pump.fun
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}