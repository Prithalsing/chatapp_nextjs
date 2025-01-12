// /api/messages/[conversationId]/route.js
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(req, { params }) {
    try {
        const { conversationId } = params;

        if (!conversationId) {
            return NextResponse.json({ error: "Missing conversationId" }, { status: 400 });
        }

        const messages = await prisma.message.findMany({
            where: {
                conversationId: conversationId,
            },
            orderBy: {
                createdAt: 'asc',
            },
            include: {
                sender: true, // Include sender info
            },
        });

        return NextResponse.json(messages);
    } catch (error) {
        console.error("Error fetching messages:", error);
        return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}