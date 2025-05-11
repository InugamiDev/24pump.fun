'use server';

import { PrismaClient, JobType } from '@prisma/client';

const prisma = new PrismaClient();

export async function connectWallet(walletAddress: string) {
  try {
    let user = await prisma.user.findUnique({
      where: { walletAddress },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          walletAddress,
          tokenBalance: 1000,
        },
      });
    }
    return { id: user.id, walletAddress: user.walletAddress, tokenBalance: user.tokenBalance, createdAt: user.createdAt };
  } catch (error) {
    console.error('Error connecting wallet:', error);
    throw new Error('Failed to connect wallet.');
  }
}

export async function applyToJob(userId: string, jobId: string) {
  try {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new Error('Job not found.');
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found.');
    }

    const existingApplication = await prisma.application.findUnique({
      where: {
        userId_jobId: {
          userId,
          jobId,
        },
      },
    });

    if (existingApplication) {
      return { success: false, message: 'You have already applied to this job.', newBalance: user.tokenBalance };
    }

    if (job.type === JobType.STABLE) {
      if (user.tokenBalance >= 5) {
        try {
          const updatedUser = await prisma.$transaction(async (tx) => {
            await tx.application.create({
              data: {
                userId,
                jobId,
              },
            });
            return await tx.user.update({
              where: { id: userId },
              data: { tokenBalance: { decrement: 5 } },
            });
          });
          return { success: true, newBalance: updatedUser.tokenBalance };
        } catch (e: unknown) {
          console.error('Transaction error applying to STABLE job:', e);
          // Type guard for PrismaClientKnownRequestError or similar
          if (typeof e === 'object' && e !== null && 'code' in e && (e as { code: string }).code === 'P2002') {
             return { success: false, message: 'Application failed: Already applied (transaction).', newBalance: user.tokenBalance };
          }
          throw new Error('Failed to apply to STABLE job due to a transaction error.');
        }
      } else {
        return { success: false, message: 'Insufficient token balance.', newBalance: user.tokenBalance };
      }
    } else { 
      await prisma.application.create({
        data: {
          userId,
          jobId,
        },
      });
      return { success: true, newBalance: user.tokenBalance };
    }
  } catch (error: unknown) {
    console.error('Error in applyToJob function:', error);
    // Type guard for PrismaClientKnownRequestError or similar
     if (typeof error === 'object' && error !== null && 'code' in error && (error as { code: string }).code === 'P2002') {
        const currentUser = await prisma.user.findUnique({ where: { id: userId } });
        return { success: false, message: 'Application failed: Already applied (general catch).', newBalance: currentUser ? currentUser.tokenBalance : 0 };
    }
    throw new Error('Failed to apply to job.');
  }
}

export async function seedJobs() {
  const jobTypes = [JobType.STABLE, JobType.FREELANCE];
  const titles = [
    "Software Engineer", "Product Manager", "UX Designer", "Data Scientist", "DevOps Specialist",
    "Frontend Developer", "Backend Developer", "Fullstack Engineer", "Mobile App Developer", "QA Tester",
    "Technical Writer", "Scrum Master", "Solutions Architect", "Cloud Engineer", "Security Analyst"
  ];
  const descriptions = [
    "to work on exciting new projects.", "to join a dynamic team.", "to help build innovative solutions.",
    "with experience in agile methodologies.", "passionate about technology.", "skilled in modern frameworks.",
    "to contribute to a fast-paced environment.", "with a strong portfolio.", "to lead and mentor junior developers.",
    "focused on delivering high-quality code."
  ];

  const jobData = [];
  for (let i = 1; i <= 100; i++) {
    jobData.push({
      id: `job${i}`,
      title: `${titles[Math.floor(Math.random() * titles.length)]} #${i}`,
      description: `Seeking a ${titles[Math.floor(Math.random() * titles.length)]} ${descriptions[Math.floor(Math.random() * descriptions.length)]}`,
      type: jobTypes[Math.floor(Math.random() * jobTypes.length)],
      reward: Math.floor(Math.random() * 500 + 50) * 10,
    });
  }

  await prisma.application.deleteMany({});
  await prisma.job.deleteMany({});

  for (const job of jobData) {
    await prisma.job.create({
      data: job,
    });
  }
  console.log('100 Jobs seeded successfully.');
  return await prisma.job.findMany();
}

export async function getJobs(filterType?: JobType | 'ALL') {
  try {
    const whereClause = filterType && filterType !== 'ALL' ? { type: filterType } : {};
    return await prisma.job.findMany({
        where: whereClause,
        orderBy: {
            createdAt: 'desc'
        }
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    throw new Error('Failed to fetch jobs.');
  }
}

export async function getUser(userId: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) return null;
        return { id: user.id, walletAddress: user.walletAddress, tokenBalance: user.tokenBalance, createdAt: user.createdAt };
    } catch (error) {
        console.error('Error fetching user:', error);
        throw new Error('Failed to fetch user data.');
    }
}