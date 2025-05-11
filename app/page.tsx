'use client';

import { Wallet, FireSimple, UserCircle, Briefcase, Users, Buildings, Sparkle, ArrowRight as ArrowRightIcon } from '@phosphor-icons/react'; // Renamed ArrowRight to avoid conflict
import { useState, useEffect, useTransition } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { connectWallet, seedJobs } from './actions'; // Removed unused getUser
import type { User } from '@prisma/client';

// Define a type for the Solana object on window
interface SolanaPhantom {
  isPhantom: boolean;
  connect: (options?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: { toString: () => string } }>;
  disconnect: () => Promise<void>;
}

declare global {
  interface Window {
    solana?: SolanaPhantom;
  }
}

interface ClientUser extends Omit<User, 'createdAt' | 'tokenBalance'> {
    createdAt: string;
    tokenBalance: number;
}

export default function HomePage() {
  const router = useRouter(); // Initialize useRouter
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [user, setUser] = useState<ClientUser | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const connectOnLoad = async () => {
      if (window.solana && window.solana.isPhantom) {
        try {
          const resp = await window.solana.connect({ onlyIfTrusted: true });
          const address = resp.publicKey.toString();
          setWalletAddress(address);
          startTransition(async () => {
            try {
              const userData = await connectWallet(address);
              setUser({...userData, createdAt: new Date(userData.createdAt).toISOString()});
            } catch (error) {
              console.error("Failed to connect wallet on load:", error);
              // Do not set feedback message here, as user might not want to be immediately bothered
            }
          });
        } catch { // _err removed as it was unused
          console.log("Phantom auto-connect failed or user declined.");
        }
      }
    };
    connectOnLoad();
  }, []);

  const handleConnectWallet = async () => {
    if (window.solana && window.solana.isPhantom) {
      try {
        const resp = await window.solana.connect();
        const address = resp.publicKey.toString();
        setWalletAddress(address);
        setFeedbackMessage(null);
        startTransition(async () => {
          try {
            const userData = await connectWallet(address);
            setUser({...userData, createdAt: new Date(userData.createdAt).toISOString()});
            // No longer navigating or changing UI here, just setting user state
          } catch (error) {
            console.error('Failed to connect wallet:', error);
            setFeedbackMessage("Error connecting wallet. Please try again.");
          }
        });
      } catch (err) {
        console.error('User rejected wallet connection:', err);
        setFeedbackMessage("Wallet connection was rejected.");
      }
    } else {
      setFeedbackMessage('Phantom wallet not found. Please install Phantom extension.');
      alert('Phantom wallet not found. Please install Phantom.');
    }
  };

  const handleLogout = async () => {
    if (window.solana && window.solana.isPhantom && window.solana.disconnect) {
      try {
        await window.solana.disconnect();
      } catch (_err) { // err is intentionally unused
        console.error("Error during Phantom disconnect:", _err);
      }
    }
    setWalletAddress(null);
    setUser(null);
    setFeedbackMessage("You have been logged out.");
  };
  
  const handleSeedJobs = async () => {
    startTransition(async () => {
        try {
            await seedJobs();
            setFeedbackMessage("Demo jobs seeded successfully! You can now find them on the swipe page.");
        } catch (error) {
            console.error("Failed to seed jobs:", error);
            setFeedbackMessage("Error seeding jobs.");
        }
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0d1117] text-[#f0f6fc] overflow-x-hidden">
      <nav className="w-full p-4 flex justify-between items-center border-b border-gray-700 sticky top-0 z-50 bg-[#0d1117]/80 backdrop-blur-md">
        <div className="text-2xl font-bold text-[#00ffff]">
          JobJob <FireSimple size={28} className="inline text-[#3b82f6]" />
        </div>
        {user && (
          <div className="flex items-center space-x-4">
            <div className="text-sm text-blue-400">
              Token Balance: <Sparkle size={14} className="inline text-yellow-400 mr-1" weight="fill" />
              <span className={`font-semibold`}>{user.tokenBalance}</span>
            </div>
          </div>
        )}
        {walletAddress ? (
          <div className="flex items-center space-x-3">
            <UserCircle size={24} className="text-[#00ffff]" />
            <span className="text-sm">{walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}</span>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-1 px-2 rounded flex items-center space-x-1 transition-colors"
            >
              <span>Logout</span>
            </button>
          </div>
        ) : (
          <button
            onClick={handleConnectWallet}
            disabled={isPending}
            className="bg-[#3b82f6] hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center space-x-2 transition-colors"
          >
            <Wallet size={20} />
            <span>{isPending && !user ? 'Connecting...' : 'Connect Wallet'}</span>
          </button>
        )}
      </nav>

      {feedbackMessage && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-24 left-1/2 -translate-x-1/2 bg-gray-900 border border-blue-500 text-white p-3 rounded-md shadow-lg z-[100] text-sm"
          onAnimationComplete={() => setTimeout(() => setFeedbackMessage(null), 3000)}
        >
          {feedbackMessage}
        </motion.div>
      )}

      <main className="flex-grow flex flex-col items-center p-8 pt-10">
        {!user ? (
          <>
            <section id="hero" className="w-full max-w-4xl text-center py-16">
                <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-5xl md:text-6xl font-bold mb-6"
                >
                    Swipe Your Way to <span className="text-[#00ffff]">Opportunity</span>
                </motion.h1>
                <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-lg text-gray-400 mb-10 max-w-2xl mx-auto"
                >
                    JobJob revolutionizes how you find work and hire talent. Connect directly, powered by secure blockchain technology for STABLE and FREELANCE roles.
                </motion.p>
                <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    onClick={handleConnectWallet}
                    disabled={isPending && !user}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-all hover:shadow-[0_0_15px_#00ffff]"
                >
                    {isPending && !user ? 'Connecting Wallet...' : 'Unlock Your Future'}
                </motion.button>
            </section>

            {/* How It Works Section */}
            <motion.section 
                id="how-it-works" 
                className="w-full max-w-5xl text-center py-16 px-4"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: 0.2 }}
            >
                <h2 className="text-4xl font-bold mb-4 text-[#00ffff]">How It Works</h2>
                <p className="text-lg text-gray-400 mb-12 max-w-3xl mx-auto">
                    JobJob simplifies the job search and hiring process into three easy steps, leveraging the power of direct connections and blockchain transparency.
                </p>
                <div className="grid md:grid-cols-3 gap-8">
                    <motion.div 
                        className="bg-gray-800/70 backdrop-blur-sm p-8 rounded-xl shadow-xl border border-indigo-500/50 hover:border-indigo-400 transition-all"
                        initial={{ opacity: 0, y: 30, scale: 0.95 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        viewport={{ once: true, amount: 0.5 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        <div className="flex justify-center mb-6">
                            <Wallet size={52} className="text-[#3b82f6]" weight="light" />
                        </div>
                        <h3 className="text-2xl font-semibold mb-3 text-white">1. Connect Wallet</h3>
                        <p className="text-gray-400 text-sm">Securely connect your Solana Phantom wallet. This is your key to the JobJob ecosystem, creating your profile in seconds while you retain control.</p>
                    </motion.div>
                    <motion.div 
                        className="bg-gray-800/70 backdrop-blur-sm p-8 rounded-xl shadow-xl border border-indigo-500/50 hover:border-indigo-400 transition-all"
                        initial={{ opacity: 0, y: 30, scale: 0.95 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        viewport={{ once: true, amount: 0.5 }}
                        transition={{ duration: 0.5, delay: 0.25 }}
                    >
                        <div className="flex justify-center mb-6">
                            <Briefcase size={52} className="text-[#3b82f6]" weight="light" />
                        </div>
                        <h3 className="text-2xl font-semibold mb-3 text-white">2. Swipe & Discover</h3>
                        <p className="text-gray-400 text-sm">Effortlessly swipe through curated job listings or candidate profiles. Our intuitive interface makes finding the right match simple and engaging.</p>
                    </motion.div>
                    <motion.div 
                        className="bg-gray-800/70 backdrop-blur-sm p-8 rounded-xl shadow-xl border border-indigo-500/50 hover:border-indigo-400 transition-all"
                        initial={{ opacity: 0, y: 30, scale: 0.95 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        viewport={{ once: true, amount: 0.5 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                    >
                        <div className="flex justify-center mb-6">
                            <Sparkle size={52} className="text-[#3b82f6]" weight="fill" />
                        </div>
                        <h3 className="text-2xl font-semibold mb-3 text-white">3. Match & Connect</h3>
                        <p className="text-gray-400 text-sm">When both parties express interest, it’s a match! Connect directly, discuss terms, and utilize our JBT token system for STABLE job applications.</p>
                    </motion.div>
                </div>
            </motion.section>

            {/* Why Choose JobJob Section */}
            <motion.section 
                id="why-choose-jobjob" 
                className="w-full max-w-6xl py-20 px-4"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.7, delay: 0.3 }}
            >
                <h2 className="text-4xl font-bold mb-16 text-center text-[#00ffff]">
                    Why <span className="relative inline-block">
                        JobJob?
                        <motion.span 
                            className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-[#00ffff] to-[#3b82f6] rounded-full"
                            initial={{ scaleX: 0 }}
                            whileInView={{ scaleX: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.8, ease: "circOut" }}
                        />
                    </span>
                </h2>
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <motion.div 
                        className="space-y-8"
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                    >
                        {[
                            { icon: Users, title: "Direct Connections, Zero Hassle", text: "No more middlemen or lengthy application processes. Job seekers and employers connect directly, fostering transparent communication and faster placements." },
                            { icon: Sparkle, title: "Innovative Tokenized Ecosystem", text: "Our JobJob Tokens (JBT) facilitate STABLE job applications, adding a layer of commitment and value, while FREELANCE gigs remain free to apply." },
                            { icon: Buildings, title: "For Every Professional Need", text: "Whether you're seeking a permanent STABLE role, a flexible FREELANCE project, or the perfect candidate, JobJob caters to all corners of the modern workforce." },
                            { icon: FireSimple, title: "Secure & Transparent", text: "Leveraging Solana's blockchain for future on-chain escrow and identity verification, we're building a platform where trust and security are paramount." }
                        ].map((item, index) => (
                            <motion.div 
                                key={index} 
                                className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-800/50 transition-colors"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.6 + index * 0.15 }}
                            >
                                <div className="flex-shrink-0 bg-gradient-to-tr from-indigo-500 to-blue-500 p-3 rounded-full shadow-lg">
                                    <item.icon size={26} className="text-white" weight="light" />
                                </div>
                                <div>
                                    <h4 className="text-xl font-semibold text-white mb-1">{item.title}</h4>
                                    <p className="text-gray-400 text-sm leading-relaxed">{item.text}</p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                    <motion.div 
                        className="flex justify-center items-center p-4"
                        initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                        whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.7, type: "spring", stiffness: 80 }}
                    >
                        <div className="relative w-full max-w-md aspect-square">
                           <div className="absolute inset-0 bg-gradient-to-br from-[#00ffff]/30 via-[#3b82f6]/30 to-transparent rounded-full blur-2xl animate-pulse delay-500 duration-3000"></div>
                           <motion.img 
                                src="/globe.svg" 
                                alt="JobJob Network Globe" 
                                className="relative w-full h-full object-contain filter drop-shadow-[0_0_15px_rgba(0,255,255,0.5)]" 
                                initial={{ y: 20, opacity: 0}}
                                whileInView={{ y: 0, opacity: 1}}
                                viewport={{ once: true}}
                                transition={{ duration: 1, delay: 1 }}
                            />
                        </div>
                    </motion.div>
                </div>
            </motion.section>

            {/* Featured Roles Section */}
            <motion.section
                id="featured-roles"
                className="w-full max-w-6xl text-center py-20 px-4"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.7, delay: 0.2 }}
            >
                <h2 className="text-4xl font-bold mb-12 text-[#00ffff]">
                    Explore <span className="relative inline-block">
                        Opportunities
                        <motion.span 
                            className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-[#3b82f6] to-[#00ffff] rounded-full"
                            initial={{ scaleX: 0 }}
                            whileInView={{ scaleX: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.5, ease: "circOut" }}
                        />
                    </span>
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {[
                        { name: "Frontend", icon: <Sparkle size={32} weight="duotone" /> },
                        { name: "Backend", icon: <Buildings size={32} weight="duotone" /> },
                        { name: "Fullstack", icon: <Users size={32} weight="duotone" /> },
                        { name: "DevOps", icon: <FireSimple size={32} weight="duotone" /> },
                        { name: "UX/UI Design", icon: <Wallet size={32} weight="duotone" /> }, 
                        { name: "Data Science", icon: <Briefcase size={32} weight="duotone" /> },
                        { name: "Mobile Dev", icon: <Sparkle size={32} weight="duotone" /> },
                        { name: "QA Testing", icon: <Buildings size={32} weight="duotone" /> },
                        { name: "Product Mgt", icon: <Users size={32} weight="duotone" /> },
                        { name: "Marketing", icon: <FireSimple size={32} weight="duotone" /> },
                    ].map((role, index) => (
                        <motion.div
                            key={role.name}
                            className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg shadow-lg hover:shadow-cyan-500/30 border border-transparent hover:border-cyan-500/50 transition-all duration-300 flex flex-col items-center justify-center aspect-square"
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            whileInView={{ opacity: 1, y: 0, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}
                        >
                            <div className="text-cyan-400 mb-3">{role.icon}</div>
                            <h4 className="text-md font-semibold text-white text-center">{role.name}</h4>
                        </motion.div>
                    ))}
                </div>
            </motion.section>

            {/* Final CTA Section */}
            <motion.section
                id="final-cta"
                className="w-full py-24 px-4 bg-gradient-to-t from-[#0d1117] via-gray-900/80 to-gray-900/50"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 1, delay: 0.3 }}
            >
                <div className="max-w-3xl mx-auto text-center">
                    <motion.h2 
                        className="text-4xl md:text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600"
                        initial={{ opacity: 0, y:30 }}
                        whileInView={{ opacity: 1, y:0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                    >
                        Ready to Dive In?
                    </motion.h2>
                    <motion.p 
                        className="text-lg text-gray-400 mb-10 max-w-xl mx-auto"
                        initial={{ opacity: 0, y:20 }}
                        whileInView={{ opacity: 1, y:0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, delay: 0.4 }}
                    >
                        Your next big opportunity or star candidate is just a swipe away. Connect your wallet and join the JobJob revolution today!
                    </motion.p>
                    <motion.button
                        onClick={handleConnectWallet}
                        disabled={isPending && !user}
                        className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-4 px-10 rounded-lg text-xl transition-all shadow-lg hover:shadow-cyan-500/50 transform hover:scale-105"
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.6, type: "spring", stiffness:100 }}
                    >
                        {isPending && !user ? 'Connecting...' : 'Connect Wallet & Start Swiping'}
                    </motion.button>
                </div>
            </motion.section>
          </>
        ) : (
          // Logged-in user view
          <div className="flex flex-col items-center justify-center text-center py-20">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-gray-800 p-10 rounded-xl shadow-2xl border border-blue-500 border-opacity-50"
            >
                <UserCircle size={80} className="text-cyan-400 mx-auto mb-6" />
                <h2 className="text-3xl font-bold mb-3 text-white">Welcome back, {user.walletAddress.substring(0,6)}...{user.walletAddress.substring(user.walletAddress.length - 4)}!</h2>
                <p className="text-gray-400 mb-8 max-w-md mx-auto">You&apos;re all set to find your next opportunity or the perfect talent. Head over to the swipe deck to get started.</p>
                <motion.button
                    onClick={() => router.push('/swipe')}
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-all shadow-lg hover:shadow-cyan-500/50 transform hover:scale-105 flex items-center mx-auto"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    Start Swiping Jobs <ArrowRightIcon size={22} className="ml-2" />
                </motion.button>
                <div className="mt-10">
                    <button
                        onClick={handleSeedJobs}
                        disabled={isPending}
                        className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
                    >
                        {isPending ? 'Seeding demo jobs...' : '(Admin: Seed Demo Jobs)'}
                    </button>
                </div>
            </motion.div>
          </div>
        )}
      </main>

      {/* <footer className="w-full p-6 text-center text-sm text-gray-500 border-t border-gray-700 mt-auto">
        <p>© {new Date().getFullYear()} JobJob. All rights reserved. Built with Next.js, TailwindCSS, Prisma, and Framer Motion.</p>
        <p className="text-xs mt-2">
            Leveraging Solana for future on-chain escrow services to enhance trust and security in all transactions.
        </p>
      </footer> */}
    </div>
  );
}
