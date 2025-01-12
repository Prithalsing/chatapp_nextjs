import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkConversations() {
    try {
        const conversations = await prisma.conversation.findMany({
            include: {
                participants: true,
                messages: {
                    orderBy: { createdAt: 'asc' },
                    include: { sender: true },
                },
            },
        });

        if (conversations.length === 0) {
            console.log("No conversations found in the database.");
            return;
        }

        console.log(`Found ${conversations.length} conversations:\n`);

        conversations.forEach((conversation, index) => {
            console.log(`Conversation ${index + 1}:`);
            console.log(`  ID: ${conversation.id}`);
            console.log("  Participants:");
            conversation.participants.forEach((participant) => {
                console.log(`    - ID: ${participant.id}, Email: ${participant.email}`); // Display relevant participant info
            });

            if (conversation.messages.length === 0) {
                console.log("  No messages in this conversation.");
            } else {
                console.log("  Messages:");
                conversation.messages.forEach((message) => {
                    console.log(`    - ID: ${message.id}`);
                    console.log(`      Content: ${message.content}`);
                    console.log(`      Sender: ${message.sender?.email || 'Unknown'}`); // Access sender email safely
                    console.log(`      Created At: ${message.createdAt}`);
                    console.log("--------------------");
                });
            }
            console.log("\n"); // Add spacing between conversations
        });
    } catch (error) {
        console.error("Error checking conversations:", error);
    } finally {
        await prisma.$disconnect();
    }
}

checkConversations();