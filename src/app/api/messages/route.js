import { getAuth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request) { // Correct: request, not req
    try {
        const { userId } = getAuth(request);

        if (!userId) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        console.log('userId:', userId);

        // Correct: Use request.json()
        const messageData = await request.json(); // Use the correct request object
        const { content, receiverId, conversationId } = messageData; // Include conversationId

        if (!content || !receiverId || !conversationId) { // Check for conversationId
            return new NextResponse('Invalid message data: Missing content, receiverId or conversationId', { status: 400 });
        }

        const newMessage = await prisma.message.create({
            data: {
                content,
                senderId: userId,
                receiverId,
                conversationId, // Use the provided conversationId
            },
        });

        console.log('newMessage:', newMessage);

        return NextResponse.json({ message: 'Message sent successfully', newMessage });

    } catch (error) {
        console.error('Error in messages API:', error);
        console.error("Full Error Object:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2)); // Improved error logging
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

export const dynamic = 'force-dynamic';