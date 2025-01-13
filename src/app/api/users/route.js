import { getAuth } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { userId } =  getAuth(request);

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    
    const clerkUser = await (await clerkClient()).users.getUser(userId);  


    
    await prisma.user.upsert({
      where: { id: userId },
      update: {}, 
      create: {
        id: userId,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
        imageUrl: clerkUser.imageUrl || '',
      },
    });

    
    const users = await prisma.user.findMany({
      where: {
        NOT: {
          id: userId
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ users });

  } catch (error) {
    console.error('Error in users API:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
