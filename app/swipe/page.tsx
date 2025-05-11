'use client';

import { FireSimple, UserCircle, Briefcase, Users, Buildings, Sparkle, XCircle, CheckCircle } from '@phosphor-icons/react';
import { useState, useEffect, useTransition, useMemo, useCallback } from 'react'; // Added useCallback
import { motion, AnimatePresence, PanInfo, useMotionValue } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { connectWallet, applyToJob, getJobs, seedJobs } from '../actions';
import type { Job, User, JobType } from '@prisma/client';

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


interface ClientJob extends Omit<Job, 'createdAt' | 'reward'> {
  createdAt: string;
  reward: number;
}

interface ClientUser extends Omit<User, 'createdAt' | 'tokenBalance'> {
    createdAt: string;
    tokenBalance: number;
}

const swipeThreshold = 80; 
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
  const dragX = useMotionValue(0); 

  const [isPending, startTransition] = useTransition();

  const fetchAndSetJobs = useCallback(async (filter: JobFilterType) => {
    setIsLoadingJobs(true);
    try {
      const fetchedJobs = await getJobs(filter);
      setAllJobs(fetchedJobs.map(j => ({...j, createdAt: j.createdAt.toISOString() })) as ClientJob[]);
      setCurrentIndex(0);
      dragX.set(0);
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
      setFeedbackMessage("Error loading jobs.");
    } finally {
      setIsLoadingJobs(false);
    }
  }, [dragX]); // getJobs is stable from import, setIsLoadingJobs, setAllJobs, setCurrentIndex, setFeedbackMessage are stable setters

  useEffect(() => {
    const checkUserStatus = async () => {
      setIsLoadingUser(true);
      if (window.solana && window.solana.isPhantom) {
        try {
          const resp = await window.solana.connect({ onlyIfTrusted: true });
          const address = resp.publicKey.toString();
          setWalletAddress(address);
          startTransition(async () => {
            try {
              const userData = await connectWallet(address);
              setUser({...userData, createdAt: new Date(userData.createdAt).toISOString()});
            } catch (fetchUserError) {
              console.error("Failed to connect wallet on load:", fetchUserError);
              setFeedbackMessage("Failed to retrieve user data. Redirecting...");
              setTimeout(() => router.push('/'), 3000);
            } finally {
              setIsLoadingUser(false);
            }
          });
        } catch { // _err removed as it was unused
          console.log("User not connected or declined trust. Redirecting...");
          setIsLoadingUser(false);
          router.push('/');
        }
      } else {
        setIsLoadingUser(false);
        setFeedbackMessage("Phantom wallet not found. Please install and connect on the homepage.");
        setTimeout(() => router.push('/'), 3000);
      }
    };
    checkUserStatus();
  }, [router, fetchAndSetJobs]); // Added fetchAndSetJobs as it's used inside

  useEffect(() => {
    if (user) {
        fetchAndSetJobs(currentJobFilter);
    }
  }, [currentJobFilter, user, fetchAndSetJobs]); // Added fetchAndSetJobs


  const performSwipeAction = (action: 'apply' | 'reject') => {
    if (currentIndex >= displayedJobs.length || !user) return; 
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
        } catch (applyError) {
          console.error('Error applying to job:', applyError);
          setFeedbackMessage("An error occurred while applying.");
        }
      });
    } else {
      setFeedbackMessage(`Rejected ${currentJob.title}.`);
    }
    setCurrentIndex(prevIndex => prevIndex + 1);
    setSwipeDirection(0); 
    dragX.set(0); 
  };

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
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
        } catch (seedError) {
            console.error("Failed to seed jobs:", seedError);
            setFeedbackMessage("Error seeding jobs.");
        }
    });
  };

  const handleLogout = async () => {
    if (window.solana && window.solana.isPhantom && window.solana.disconnect) {
      try {
        await window.solana.disconnect();
      } catch (disconnectError) {
        console.error("Error during Phantom disconnect:", disconnectError);
      }
    }
    setWalletAddress(null);
    setUser(null);
    router.push('/'); 
  };

  const cardVariants = {
    initial: (direction: number) => ({
      opacity: 0,
      scale: 0.9,
      y: 50,
      x: direction === 0 ? 0 : direction < 0 ? -200 : 200,
      rotate: direction < 0 ? -10 : 10,
    }),
    center: (i: number) => ({ 
      x: 0,
      y: i * -10, 
      scale: 1 - i * 0.05, 
      opacity: 1 - i * 0.2, 
      zIndex: displayedJobs.length - i,
      rotate: 0,
      transition: { type: 'spring', stiffness: 120, damping: 20, duration: 0.3 },
    }),
    exit: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.8,
      rotate: direction > 0 ? 25 : -25,
      transition: { duration: 0.3, ease: "easeIn" },
    }),
  };

  const displayedJobs = useMemo(() => {
    if (currentJobFilter === 'ALL') return allJobs;
    return allJobs.filter(job => job.type === currentJobFilter);
  }, [allJobs, currentJobFilter]);

  const dragGlowColor = useMemo(() => {
    const x = dragX.get();
    if (x > swipeThreshold / 2) return 'shadow-green-500/50';
    if (x < -swipeThreshold / 2) return 'shadow-red-500/50';
    return 'shadow-cyan-500/20';
  }, [dragX]); // swipeThreshold is a constant, so not needed as a dependency


  if (isLoadingUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center animated-gradient-background text-[#f0f6fc]">
        <Sparkle size={60} className="text-cyan-400 animate-pulse mb-6" />
        <p className="text-2xl font-light">Verifying your access...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center animated-gradient-background text-[#f0f6fc] p-6">
        <Briefcase size={60} className="text-cyan-500 mb-6" />
        <p className="text-2xl font-semibold mb-3 text-center">Access Denied</p>
        <p className="text-lg text-gray-400 mb-8 text-center">Please connect your wallet on the homepage to access the job deck.</p>
        <button onClick={() => router.push('/')} className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-3 px-8 rounded-lg text-md transition-all shadow-lg hover:shadow-cyan-500/50">
          Go to Homepage
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col animated-gradient-background text-[#f0f6fc] overflow-hidden">
      <nav className="w-full p-4 flex justify-between items-center border-b border-gray-700 border-opacity-50 sticky top-0 z-[100] bg-[#0d1117] bg-opacity-70 backdrop-blur-md">
        <div className="text-2xl font-bold text-cyan-400 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => router.push('/')}>
          JobJob <FireSimple size={28} className="inline text-blue-500" />
        </div>
        <div className="flex items-center space-x-4">
            <div className="text-sm text-blue-300">
              Tokens: <Sparkle size={14} className="inline text-yellow-300 mr-0.5" weight="fill" />
              <span className={`font-semibold ${isPending && currentIndex < displayedJobs.length && displayedJobs[currentIndex]?.type === 'STABLE' ? 'animate-ping opacity-75' : ''}`}>{user.tokenBalance}</span>
            </div>
        </div>
        <div className="flex items-center space-x-3">
            <UserCircle size={24} className="text-cyan-400" />
            <span className="text-sm text-gray-300">{walletAddress?.substring(0, 6)}...{walletAddress?.substring(walletAddress.length - 4)}</span>
            <button
              onClick={handleLogout}
              className="bg-red-600 bg-opacity-80 hover:bg-red-500 text-white text-xs font-bold py-1.5 px-3 rounded-md flex items-center space-x-1 transition-colors shadow-md hover:shadow-lg"
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
          className="fixed top-20 left-1/2 -translate-x-1/2 bg-gray-800 border border-cyan-500 border-opacity-50 text-white p-3.5 rounded-lg shadow-xl z-[150] text-sm"
          onAnimationComplete={() => setTimeout(() => setFeedbackMessage(null), 3000)}
        >
          {feedbackMessage}
        </motion.div>
      )}

      <main className="flex-grow flex flex-col items-center p-4 md:p-8 pt-6 md:pt-10 relative">
            <div className="mb-6 md:mb-8 flex space-x-1 md:space-x-2 p-1 bg-gray-800 bg-opacity-60 backdrop-blur-sm rounded-xl shadow-lg">
              {(['ALL', 'STABLE', 'FREELANCE'] as JobFilterType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setCurrentJobFilter(type)}
                  className={`px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-medium rounded-lg transition-all duration-200 ease-out
                    ${currentJobFilter === type 
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md scale-105' 
                        : 'text-gray-300 hover:bg-gray-700 hover:bg-opacity-70 hover:text-white'}`}
                >
                  {type.charAt(0) + type.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mb-6 md:mb-8 -mt-4 text-center">
                Tip: STABLE jobs may require JobJob Tokens (JBT) to apply. Freelance is free!
            </p>

            {isLoadingJobs && (
                <div className="flex flex-col items-center justify-center h-[500px] w-full"> 
                    <Sparkle size={48} className="text-cyan-400 animate-pulse mb-5" /> 
                    <p className="text-xl text-gray-300 font-light">Summoning Opportunities...</p>
                </div>
            )}
            
            {!isLoadingJobs && displayedJobs.length === 0 && (
              <div className="text-center py-10 flex flex-col items-center justify-center h-[500px] w-full bg-gray-800 bg-opacity-30 backdrop-blur-sm rounded-2xl shadow-xl p-8">
                <Briefcase size={72} className="mx-auto text-cyan-600 mb-6 opacity-70" />
                <p className="text-3xl font-semibold mb-3 text-gray-200">No {currentJobFilter !== 'ALL' ? currentJobFilter.toLowerCase() : ''} jobs here!</p>
                <p className="text-gray-400 mb-8 text-lg">Looks like this realm is clear. Try another filter or seed new quests!</p>
                <button
                  onClick={handleSeedJobs}
                  disabled={isPending}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-8 rounded-lg text-md transition-all shadow-lg hover:shadow-green-500/50 transform hover:scale-105"
                >
                  {isPending ? 'Seeding...' : 'Seed Demo Jobs'}
                </button>
              </div>
            )}

            {!isLoadingJobs && displayedJobs.length > 0 && (
              <div id="job-swipe-stack-container" className="w-full max-w-sm h-[520px] relative flex items-center justify-center mt-0 md:mt-2">
                <AnimatePresence initial={true} custom={swipeDirection}>
                  {displayedJobs.slice(currentIndex, currentIndex + 3).reverse().map((job, indexInStack) => {
                     const isTopCard = indexInStack === (displayedJobs.slice(currentIndex, currentIndex + 3).length - 1);
                     // Ensure we don't try to render cards beyond the actual displayedJobs length
                     const actualJobIndex = currentIndex + (displayedJobs.slice(currentIndex, currentIndex + 3).length -1 - indexInStack);
                     if (actualJobIndex >= displayedJobs.length) return null; 

                    return (
                    <motion.div
                      key={job.id + currentJobFilter + actualJobIndex} 
                      custom={swipeDirection} 
                      variants={cardVariants}
                      initial="initial" 
                      animate={cardVariants.center(displayedJobs.slice(currentIndex, currentIndex + 3).length -1 - indexInStack)}
                      exit="exit"
                      drag={isTopCard ? "x" : false}
                      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }} 
                      dragElastic={0.3}
                      onDragEnd={isTopCard ? handleDragEnd : undefined}
                      style={{ 
                        x: isTopCard ? dragX : 0, 
                        position: 'absolute',
                        width: '320px', 
                        height: '460px', 
                        willChange: 'transform, opacity',
                        boxShadow: isTopCard ? `0 0 20px ${dragGlowColor}` : '0 4px 15px rgba(0,0,0,0.2)',
                      }}
                      className={`bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 p-6 rounded-2xl border border-cyan-500 border-opacity-20 flex flex-col justify-between overflow-hidden transition-shadow duration-200 ${isTopCard ? 'cursor-grab active:cursor-grabbing shadow-2xl' : 'shadow-lg'}`}
                    >
                        <div className="flex justify-between items-start">
                            <div className="w-12 h-12 bg-cyan-700 bg-opacity-50 rounded-lg flex items-center justify-center text-cyan-300 text-2xl font-bold shadow-inner">
                                {job.title.charAt(0).toUpperCase()}
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-semibold text-white flex items-center backdrop-blur-sm shadow-sm ${job.type === 'STABLE' ? 'bg-indigo-600 bg-opacity-70' : 'bg-green-600 bg-opacity-70'}`}>
                                {job.type === 'STABLE' ? <Buildings size={14} className="mr-1.5" /> : <Users size={14} className="mr-1.5" />}
                                {job.type}
                            </div>
                        </div>
                        
                        <div className="my-4 flex-grow">
                            <h3 className="text-xl font-semibold mb-2 text-cyan-300 leading-tight line-clamp-2">{job.title}</h3>
                            <p className="text-gray-400 mb-3 text-xs h-20 overflow-y-auto scrollbar-thin pr-1">{job.description}</p>
                            <div className="text-sm text-blue-300 flex items-center">
                                  <Sparkle size={15} className="mr-1.5 text-yellow-300" weight="fill"/>
                                  Reward: <span className="font-semibold ml-1">{job.reward} Tokens</span>
                            </div>
                        </div>

                        {isTopCard && (
                            <div className="flex justify-around items-center mt-auto pt-4 border-t border-gray-700 border-opacity-40">
                                <motion.button 
                                    whileTap={{scale:0.9}} 
                                    onClick={() => {setSwipeDirection(-1); performSwipeAction('reject');}} 
                                    className="p-3 rounded-full bg-red-500 bg-opacity-20 hover:bg-red-500 hover:bg-opacity-40 transition-colors"
                                    aria-label="Reject Job"
                                >
                                    <XCircle size={28} className="text-red"/>
                                </motion.button>
                                <motion.button 
                                    whileTap={{scale:0.9}} 
                                    onClick={() => {setSwipeDirection(1); performSwipeAction('apply');}} 
                                    className="p-3 rounded-full bg-green-500 bg-opacity-20 hover:bg-green-500 hover:bg-opacity-40 transition-colors"
                                    aria-label="Apply to Job"
                                >
                                    <CheckCircle size={28} className="text-green"/>
                                </motion.button>
                            </div>
                        )}
                    </motion.div>
                    );
                  })}
                </AnimatePresence>
                
                {isPending && currentIndex < displayedJobs.length && (
                    <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center rounded-2xl z-[200]">
                        <Sparkle size={36} className="text-cyan-400 animate-pulse mb-4" />
                        <p className="text-white text-lg font-light">Processing Your Choice...</p>
                    </div>
                )}

                 {currentIndex >= displayedJobs.length && !isLoadingJobs && displayedJobs.length > 0 && (
                    <div className="text-center py-10 flex flex-col items-center justify-center h-[500px] w-full bg-gray-800 bg-opacity-30 backdrop-blur-sm rounded-2xl shadow-xl p-8">
                        <Briefcase size={72} className="mx-auto text-cyan-600 mb-6 opacity-70" />
                        <p className="text-3xl font-semibold mb-3 text-gray-200">All Jobs Swiped!</p>
                        <p className="text-gray-400 mb-8 text-lg">You&apos;ve seen all available {currentJobFilter !== 'ALL' ? currentJobFilter.toLowerCase() : ''} jobs. Check back later or seed more!</p>
                        <div className="flex space-x-4">
                            <button
                            onClick={handleSeedJobs}
                            disabled={isPending}
                            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-lg text-md transition-all shadow-lg hover:shadow-green-500/50 transform hover:scale-105"
                            >
                            {isPending ? 'Seeding...' : 'Seed More Jobs'}
                            </button>
                            <button
                            onClick={() => fetchAndSetJobs(currentJobFilter)}
                            disabled={isLoadingJobs || isPending}
                            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-lg text-md transition-all shadow-lg hover:shadow-cyan-500/50 transform hover:scale-105"
                            >
                            {isLoadingJobs ? 'Refreshing...' : 'Refresh List'}
                            </button>
                        </div>
                    </div>
                )}
              </div>
            )}
      </main>
      <footer className="w-full p-4 text-center text-xs text-gray-500 border-t border-gray-700 border-opacity-30 mt-auto">
        <p>JobJob &copy; {new Date().getFullYear()} - Swipe Your Way to Opportunity.</p>
      </footer>
    </div>
  );
}