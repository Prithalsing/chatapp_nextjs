import { getAuth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request) { 
    try {
        const { userId } = getAuth(request);

        if (!userId) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        console.log('userId:', userId);

        const messageData = await request.json(); 
        const { content, receiverId, conversationId } = messageData;
        if (!content || !receiverId || !conversationId) { 
            return new NextResponse('Invalid message data: Missing content, receiverId or conversationId', { status: 400 });
        }

        const newMessage = await prisma.message.create({
            data: {
                content,
                senderId: userId,
                receiverId,
                conversationId, 
            },
        });

        console.log('newMessage:', newMessage);

        return NextResponse.json({ message: 'Message sent successfully', newMessage });

    } catch (error) {
        console.error('Error in messages API:', error);
        console.error("Full Error Object:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2)); 
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

export const dynamic = 'force-dynamic';