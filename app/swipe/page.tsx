'use client';

import { Wallet, FireSimple, UserCircle, ArrowLeft, ArrowRight, Briefcase, Users, Buildings, Sparkle } from '@phosphor-icons/react';
import { useState, useEffect, useTransition, useMemo } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { connectWallet, applyToJob, getJobs, seedJobs, getUser } from '../actions'; // Adjusted path
import type { Job, User, JobType } from '@prisma/client';

interface ClientJob extends Omit<Job, 'createdAt' | 'reward'> {
  createdAt: string;
  reward: number;
}

interface ClientUser extends Omit<User, 'createdAt' | 'tokenBalance'> {
    createdAt: string;
    tokenBalance: number;
}

const swipeThreshold = 100;
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};

type JobFilterType = JobType | 'ALL';

export default function SwipePage() {
  const router = useRouter();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [user, setUser] = useState<ClientUser | null>(null);
  const [allJobs, setAllJobs] = useState<ClientJob[]>([]);
  const [currentJobFilter, setCurrentJobFilter] = useState<JobFilterType>('ALL');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [swipeDirection, setSwipeDirection] = useState<number>(0);

  const [isPending, startTransition] = useTransition();

  const fetchAndSetJobs = async (filter: JobFilterType) => {
    setIsLoadingJobs(true);
    try {
      const fetchedJobs = await getJobs(filter);
      setAllJobs(fetchedJobs.map(j => ({...j, createdAt: j.createdAt.toISOString() })) as ClientJob[]);
      setCurrentIndex(0);
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
      setFeedbackMessage("Error loading jobs.");
    } finally {
      setIsLoadingJobs(false);
    }
  };

  // Initial check for connected wallet and user data
  useEffect(() => {
    const checkUserStatus = async () => {
      setIsLoadingUser(true);
      if ((window as any).solana && (window as any).solana.isPhantom) {
        try {
          const resp = await (window as any).solana.connect({ onlyIfTrusted: true });
          const address = resp.publicKey.toString();
          setWalletAddress(address);
          startTransition(async () => {
            try {
              const userData = await connectWallet(address);
              setUser({...userData, createdAt: new Date(userData.createdAt).toISOString()});
              fetchAndSetJobs(currentJobFilter); // Fetch jobs after user is confirmed
            } catch (error) {
              console.error("Failed to connect wallet on load:", error);
              setFeedbackMessage("Failed to retrieve user data. Redirecting...");
              setTimeout(() => router.push('/'), 3000);
            } finally {
              setIsLoadingUser(false);
            }
          });
        } catch (err) {
          // Not connected or trust declined
          console.log("User not connected or declined trust. Redirecting...");
          setIsLoadingUser(false);
          router.push('/'); // Redirect to landing if not connected
        }
      } else {
        // Phantom not found
        setIsLoadingUser(false);
        setFeedbackMessage("Phantom wallet not found. Please install and connect on the homepage.");
        setTimeout(() => router.push('/'), 3000);
      }
    };
    checkUserStatus();
  }, [router]); // router dependency for redirection

  useEffect(() => {
    if (user) { // Only fetch jobs if user is loaded and filter changes
        fetchAndSetJobs(currentJobFilter);
    }
  }, [currentJobFilter, user]);


  const performSwipeAction = (action: 'apply' | 'reject') => {
    if (currentIndex >= displayedJobs.length || !user) return; // Use displayedJobs here
    const currentJob = displayedJobs[currentIndex];
    setFeedbackMessage(null);

    if (action === 'apply') {
      startTransition(async () => {
        try {
          const result = await applyToJob(user.id, currentJob.id);
          if (result.success) {
            setUser(prevUser => prevUser ? { ...prevUser, tokenBalance: result.newBalance } : null);
            setFeedbackMessage(`Successfully applied to ${currentJob.title}!`);
          } else {
            setFeedbackMessage(result.message || "Failed to apply.");
             if (result.newBalance !== undefined && user.tokenBalance !== result.newBalance) {
                setUser(prevUser => prevUser ? { ...prevUser, tokenBalance: result.newBalance } : null);
            }
          }
        } catch (error) {
          console.error('Error applying to job:', error);
          setFeedbackMessage("An error occurred while applying.");
        }
      });
    } else {
      setFeedbackMessage(`Rejected ${currentJob.title}.`);
    }
    setCurrentIndex(prevIndex => prevIndex + 1);
    setSwipeDirection(0); 
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const { offset, velocity } = info;
    const power = swipePower(offset.x, velocity.x);

    if (power < -swipeThreshold) {
      setSwipeDirection(-1); 
      performSwipeAction('reject');
    } else if (power > swipeThreshold) {
      setSwipeDirection(1); 
      performSwipeAction('apply');
    }
  };
  
  const handleSeedJobs = async () => {
    startTransition(async () => {
        try {
            await seedJobs();
            setFeedbackMessage("Jobs seeded successfully! Refreshing list...");
            fetchAndSetJobs(currentJobFilter);
        } catch (error) {
            console.error("Failed to seed jobs:", error);
            setFeedbackMessage("Error seeding jobs.");
        }
    });
  };

  const handleLogout = async () => {
    if ((window as any).solana && (window as any).solana.isPhantom && (window as any).solana.disconnect) {
      try {
        await (window as any).solana.disconnect();
      } catch (err) {
        console.error("Error during Phantom disconnect:", err);
      }
    }
    setWalletAddress(null);
    setUser(null);
    router.push('/'); // Redirect to landing page after logout
  };

  const cardVariants = {
    initial: { 
      opacity: 0,
      scale: 0.8,
      x: 0, 
      rotate: 0,
    },
    animate: {
      x: 0,
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: { type: 'spring', stiffness: 120, damping: 20 },
    },
    exit: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.8,
      rotate: direction > 0 ? 15 : -15,
      transition: { duration: 0.2 },
    }),
  };

  const displayedJobs = useMemo(() => {
    // This logic might seem redundant if fetchAndSetJobs already filters,
    // but it's good for ensuring the displayed list is always in sync with the filter state
    // if allJobs were ever to hold unfiltered data temporarily.
    if (currentJobFilter === 'ALL') return allJobs;
    return allJobs.filter(job => job.type === currentJobFilter);
  }, [allJobs, currentJobFilter]);

  if (isLoadingUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0d1117] text-[#f0f6fc]">
        <Sparkle size={48} className="text-blue-500 animate-spin mb-4" />
        <p className="text-xl">Loading user data...</p>
      </div>
    );
  }

  if (!user) {
     // This case should ideally be handled by the redirect in useEffect, but as a fallback:
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0d1117] text-[#f0f6fc]">
        <p className="text-xl mb-4">Please connect your wallet on the homepage to access this page.</p>
        <button onClick={() => router.push('/')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Go to Homepage
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0d1117] text-[#f0f6fc] overflow-x-hidden">
      <nav className="w-full p-4 flex justify-between items-center border-b border-gray-700 sticky top-0 z-50 bg-[#0d1117]/80 backdrop-blur-md">
        <div className="text-2xl font-bold text-[#00ffff] cursor-pointer" onClick={() => router.push('/')}>
          JobJob <FireSimple size={28} className="inline text-[#3b82f6]" />
        </div>
        <div className="flex items-center space-x-4">
            <div className="text-sm text-blue-400 transition-all duration-300">
              Token Balance: <Sparkle size={14} className="inline text-yellow-400 mr-1" weight="fill" />
              <span className={`font-semibold ${isPending && currentIndex < displayedJobs.length && displayedJobs[currentIndex]?.type === 'STABLE' ? 'animate-ping opacity-75' : ''}`}>{user.tokenBalance}</span>
            </div>
        </div>
        <div className="flex items-center space-x-3">
            <UserCircle size={24} className="text-[#00ffff]" />
            <span className="text-sm">{walletAddress?.substring(0, 6)}...{walletAddress?.substring(walletAddress.length - 4)}</span>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-1 px-2 rounded flex items-center space-x-1 transition-colors"
            >
              <span>Logout</span>
            </button>
        </div>
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
            <div className="mb-8 flex space-x-2 p-1 bg-gray-800 rounded-lg shadow-md">
              {(['ALL', 'STABLE', 'FREELANCE'] as JobFilterType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setCurrentJobFilter(type)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors
                    ${currentJobFilter === type ? 'bg-blue-600 text-white shadow-inner' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}
                >
                  {type.charAt(0) + type.slice(1).toLowerCase()}
                </button>
              ))}
            </div>

            {isLoadingJobs && <div className="flex flex-col items-center justify-center h-96"> <Sparkle size={32} className="text-blue-500 animate-spin mb-3" /> <p className="text-xl text-gray-400">Loading jobs...</p></div>}
            
            {!isLoadingJobs && displayedJobs.length === 0 && (
              <div className="text-center py-10 flex flex-col items-center justify-center h-96">
                <Briefcase size={60} className="mx-auto text-gray-600 mb-6" />
                <p className="text-2xl mb-3 text-gray-300">No {currentJobFilter !== 'ALL' ? currentJobFilter.toLowerCase() : ''} jobs found.</p>
                <p className="text-gray-500 mb-6">Try a different filter or seed some new opportunities!</p>
                <button
                  onClick={handleSeedJobs}
                  disabled={isPending}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg text-md transition-all hover:shadow-lg"
                >
                  {isPending ? 'Seeding...' : 'Seed Demo Jobs'}
                </button>
              </div>
            )}

            {!isLoadingJobs && displayedJobs.length > 0 && (
              <section id="job-swipe" className="w-full max-w-md h-[500px] relative flex items-center justify-center mt-2">
                <AnimatePresence initial={false} custom={swipeDirection}>
                  {currentIndex < displayedJobs.length && displayedJobs.slice(currentIndex, currentIndex + 1).map((job) => (
                    <motion.div
                      key={job.id + currentJobFilter} 
                      custom={swipeDirection}
                      variants={cardVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      drag="x"
                      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                      onDragEnd={handleDragEnd}
                      className="absolute w-[340px] h-[480px] bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl border border-blue-500/30 shadow-[0_10px_30px_rgba(0,255,255,0.1)] cursor-grab active:cursor-grabbing flex flex-col justify-between overflow-hidden"
                    >
                        <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold text-white flex items-center
                                  ${job.type === 'STABLE' ? 'bg-indigo-600/80' : 'bg-green-600/80'} backdrop-blur-sm">
                                  {job.type === 'STABLE' ? <Buildings size={14} className="mr-1.5" /> : <Users size={14} className="mr-1.5" />}
                                  {job.type}
                        </div>
                        <div className="pt-4">
                            <h3 className="text-2xl font-bold mb-3 text-cyan-400 leading-tight">{job.title}</h3>
                            <p className="text-gray-300 mb-4 text-sm h-28 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800/50 pr-2">{job.description}</p>
                            <div className="flex justify-start items-center text-sm text-blue-400">
                                  <Sparkle size={16} className="mr-1.5 text-yellow-400" weight="fill"/>
                                  Reward: <span className="font-semibold ml-1">{job.reward} Tokens</span>
                            </div>
                        </div>
                        <div className="flex justify-around items-center mt-auto text-sm text-gray-400 border-t border-gray-700/50 pt-5 pb-1">
                            <motion.button whileTap={{scale:0.9}} onClick={() => {setSwipeDirection(-1); performSwipeAction('reject');}} className="flex items-center text-red-400 hover:text-red-300 transition-colors">
                                <ArrowLeft size={20} className="inline mr-1.5"/> Reject
                            </motion.button>
                            <motion.button whileTap={{scale:0.9}} onClick={() => {setSwipeDirection(1); performSwipeAction('apply');}} className="flex items-center text-green-400 hover:text-green-300 transition-colors">
                                Apply <ArrowRight size={20} className="inline ml-1.5"/>
                            </motion.button>
                        </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {/* {isPending && currentIndex < displayedJobs.length && (
                    <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center rounded-xl z-50">
                        <Sparkle size={28} className="text-blue-400 animate-spin mr-3" />
                        <p className="text-white text-lg">Processing...</p>
                    </div>
                )} */}
                 {currentIndex >= displayedJobs.length && !isLoadingJobs && displayedJobs.length > 0 && (
                    <div className="text-center py-10 flex flex-col items-center justify-center h-96">
                        <Briefcase size={60} className="mx-auto text-gray-600 mb-6" />
                        <p className="text-2xl mb-3 text-gray-300">No more {currentJobFilter !== 'ALL' ? currentJobFilter.toLowerCase() : ''} jobs to swipe!</p>
                        <p className="text-gray-500 mb-6">Check back later or seed some fresh opportunities.</p>
                        <div className="flex space-x-4">
                            <button
                            onClick={handleSeedJobs}
                            disabled={isPending}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg text-md transition-all hover:shadow-lg"
                            >
                            {isPending ? 'Seeding...' : 'Seed More Jobs'}
                            </button>
                            <button
                            onClick={() => fetchAndSetJobs(currentJobFilter)}
                            disabled={isLoadingJobs || isPending}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg text-md transition-all hover:shadow-lg"
                            >
                            {isLoadingJobs ? 'Refreshing...' : 'Refresh Jobs'}
                            </button>
                        </div>
                    </div>
                )}
              </section>
            )}
      </main>

      {/* <footer className="w-full p-6 text-center text-xs text-gray-600 border-t border-gray-700/50 mt-auto">
        <p>© {new Date().getFullYear()} JobJob. All rights reserved. Your decentralized job marketplace.</p>
      </footer> */}
    </div>
  );
}