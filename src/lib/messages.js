import { prisma } from './db'
import { auth } from '@clerk/nextjs'

export async function createMessage(receiverId, content) {
  const { userId } = auth()
  
  if (!userId) {
    throw new Error('Unauthorized')
  }

  return prisma.message.create({
    data: {
      content,
      sender: {
        connect: { id: userId }
      },
      receiver: {
        connect: { id: receiverId }
      },
      conversation: {
        connectOrCreate: {
          where: {
            id: `${userId}-${receiverId}`,
          },
          create: {
            id: `${userId}-${receiverId}`,
            participants: {
              connect: [
                { id: userId },
                { id: receiverId }
              ]
            }
          }
        }
      }
    },
    include: {
      sender: true,
      receiver: true,
    }
  })
}

export async function getConversations() {
  const { userId } = auth()
  
  if (!userId) {
    throw new Error('Unauthorized')
  }

  return prisma.conversation.findMany({
    where: {
      participants: {
        some: {
          id: userId
        }
      }
    },
    include: {
      participants: true,
      messages: {
        orderBy: {
          createdAt: 'desc'
        },
        take: 1
      }
    },
    orderBy: {
      lastMessageAt: 'desc'
    }
  })
}

export async function getMessages(conversationId) {
  const { userId } = auth()
  
  if (!userId) {
    throw new Error('Unauthorized')
  }

  return prisma.message.findMany({
    where: {
      conversationId,
      conversation: {
        participants: {
          some: {
            id: userId
          }
        }
      }
    },
    include: {
      sender: true,
      receiver: true,
    },
    orderBy: {
      createdAt: 'asc'
    }
  })
}