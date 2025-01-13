import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getAuth } from "@clerk/nextjs/server"

const prisma = new PrismaClient();

export async function POST(request) {
    try {
        const { userId } = getAuth(request);

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { participantIds } = body;

        if (!participantIds || !Array.isArray(participantIds) || participantIds.length !== 2) {
            return NextResponse.json({ error: 'Invalid participant IDs' }, { status: 400 });
        }
       
        
        const existingConversation = await prisma.conversation.findFirst({
            where: {
                participants: {
                    every: { 
                        userId: { in: participantIds },
                    },
                },
            },
            include: { 
                participants: {
                    select: {
                        user: {
                            select: { id: true, name: true, email: true, imageUrl: true }
                        }
                    }
                }
            }
        });

        if (existingConversation) {
            return NextResponse.json(existingConversation);
        }

        
        const newConversation = await prisma.conversation.create({
            data: {
                participants: {
                    create: participantIds.map(participantId => ({
                        user: { connect: { id: participantId } },
                    })),
                },
            },
            include: { 
                participants: {
                    select: {
                        user: {
                            select: { id: true, name: true, email: true, imageUrl: true }
                        }
                    }
                }
            }
        });
        

        return NextResponse.json(newConversation);

    } catch (error) {
        console.error('Conversation creation error:', error);

        
        console.error("Full Error Object:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));

        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}