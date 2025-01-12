"use client"

import { useState } from 'react'
import { Sidebar } from '@/components/sidebar'
import { ChatArea } from '@/components/chat-area'
import { WelcomeScreen } from '@/components/welcome-screen'

export default function Home() {
  const [selectedChat, setSelectedChat] = useState(null)

  return (
    <>
      <main className="h-screen flex">
        <Sidebar onChatSelect={setSelectedChat} selectedChat={selectedChat} />
        {selectedChat ? (
          <ChatArea chat={selectedChat} />
        ) : (
          <WelcomeScreen />
        )}
    </main>
    </>
    
  )
}