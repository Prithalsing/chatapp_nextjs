"use client"

import { useState } from 'react'
import { Sidebar } from '@/components/sidebar'
import FileUploadTest, { ChatArea } from '@/components/chat-area'
import { WelcomeScreen } from '@/components/welcome-screen'
import { useUser } from '@clerk/nextjs'

export default function Home() {
  const [selectedChat, setSelectedChat] = useState(null)
  const { isLoaded, isSignedIn, user } = useUser();

  return (
    <>
      <main className="h-screen flex">
        <Sidebar onChatSelect={setSelectedChat} selectedChat={selectedChat} isLoaded={isLoaded} isSignedIn={isSignedIn} user={user} />
        {selectedChat ? (
          <ChatArea chat={selectedChat} />
        ) : (
          <WelcomeScreen  isLoaded={isLoaded} isSignedIn={isSignedIn}/>
        )}
    </main>
    </>
    
  )
}