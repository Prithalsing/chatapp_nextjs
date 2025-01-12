"use client"

import { useState, useEffect } from 'react'
import { Search, Settings, MessageSquare, MoreVertical, Users } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { UserButton, SignInButton, useUser } from "@clerk/nextjs"

export function Sidebar({ onChatSelect, selectedChat }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [users, setUsers] = useState([])
  const [error, setError] = useState(null)
  const { isLoaded, isSignedIn, user } = useUser()
  
  useEffect(() => {
    const fetchUsers = async () => {
      if (isSignedIn && user) {
        try {
          const response = await fetch('/api/users')
          const data = await response.json()
          
          if (data.error) {
            setError(data.error)
            return
          }
          
          setUsers(data.users || [])
        } catch (error) {
          console.error('Error fetching users:', error)
          setError('Failed to load users')
        }
      }
    }
    
    fetchUsers()
  }, [isSignedIn, user])

  // Filter users based on search query
  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="w-[400px] border-r flex flex-col bg-background">
      <div className="p-4 border-b flex items-center justify-between">
        {isLoaded && (
          <>
            {isSignedIn ? (
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "h-10 w-10"
                  }
                }}
              />
            ) : (
              <SignInButton mode="modal">
                <Button variant="default">
                  Sign in
                </Button>
              </SignInButton>
            )}
          </>
        )}
        <div className="flex gap-2">
          <Button variant="ghost" size="icon">
            <Users className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <MessageSquare className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {isSignedIn && (
        <>
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users"
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <ScrollArea className="flex-1">
            {error ? (
              <div className="p-4 text-red-500">{error}</div>
            ) : (
              filteredUsers.map((chatUser) => (
                <div
                  key={chatUser.id}
                  className={`p-4 flex items-center gap-3 hover:bg-muted cursor-pointer ${
                    selectedChat?.id === chatUser.id ? 'bg-muted' : ''
                  }`}
                  onClick={() => onChatSelect(chatUser)}
                >
                  <Avatar className="h-12 w-12">
                    <img 
                      src={chatUser.imageUrl || '/default-avatar.png'} 
                      alt={chatUser.name || chatUser.email} 
                      className="h-full w-full object-cover"
                    />
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">
                        {chatUser.name || chatUser.email.split('@')[0]}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-muted-foreground truncate">
                        {chatUser.email}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </ScrollArea>
        </>
      )}
    </div>
  )
}