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
      <header className="header bg-gradient-to-r from-blue-400 to-indigo-500 p-4 rounded-b-md shadow-md">
        <div className="header-content text-center">
          <h1 className="header-title text-2xl font-semibold text-white">
            MyChat Web
          </h1>
          <p className="header-subtitle text-sm text-white opacity-80">
            Connecting people, simply.
          </p>
        </div>
      </header>

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