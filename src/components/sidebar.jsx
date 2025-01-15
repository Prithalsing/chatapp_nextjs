import { useState, useEffect, useCallback } from "react";
import { Search, Settings, MessageSquare, MoreVertical, Users, Home, Bell, Settings2, SettingsIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";



export function Sidebar({ onChatSelect, selectedChat, isLoaded, isSignedIn, user }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  

  const fetchUsers = useCallback(async () => {
    if (isSignedIn && user) {
      setLoading(true);
      try {
        const response = await fetch("/api/users");
        const data = await response.json();

        if (data.error) {
          setError(data.error);
        } else {
          setUsers(data.users || []);
        }
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Failed to load users");
      } finally {
        setLoading(false);
      }
    }
  }, [isSignedIn, user]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isLoaded) {
    return <div className="w-[400px] border-r p-4">Loading...</div>;
  }

  if (!isSignedIn) {
    return (
      <>
      <div className="relative w-[500px] max-w-[500px] min-h-screen flex flex-col items-center justify-center">
        <div>
        </div>
          <h2 className="text-2xl font-semibold mb-6">Hello master</h2>
          <p className="text-muted-foreground mb-8">Sign in to start chatting</p>
          <Link href="/signin">
            <Button 
              size="lg"
              onClick={() => router.push('/sign-in')}
              className="w-full"
            >
              Sign In
            </Button>
          </Link>
      </div>
      </> 
    );
  }

  return (
    <>
    <div className="w-[500px] border-r flex flex-col bg-background">
      <div className="p-4 border-b flex items-center justify-between">
        <UserButton
          afterSignOutUrl="/signin"
          appearance={{ elements: { avatarBox: "h-10 w-10" } }}
        />
        {user && (
          <span className="font-medium">{user.firstName || user.username}</span>
        )}
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" aria-label="Users">
            <Users className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Messages">
            <MessageSquare className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="More options">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users"
            className="pl-9"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        {loading ? (
          <div className="p-4 text-center">Loading...</div>
        ) : error ? (
          <div className="p-4 text-red-500">{error}</div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-4 text-muted-foreground">No users found</div>
        ) : (
          filteredUsers.map((chatUser) => (
            <div
              key={chatUser.id}
              className={`p-4 flex items-center gap-3 hover:bg-muted cursor-pointer ${
                selectedChat?.id === chatUser.id ? "bg-muted" : ""
              }`}
              onClick={() => onChatSelect(chatUser)}
            >
              <Avatar className="h-12 w-12">
                <img
                  src={chatUser.imageUrl || "/default-avatar.png"}
                  alt={chatUser.name || chatUser.email}
                  className="h-full w-full object-cover"
                />
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <span className="font-medium">
                    {chatUser.name || chatUser.email.split("@")[0]}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {chatUser.email}
                </p>
              </div>
            </div>
          ))
        )}

      </ScrollArea>
      <div className="p-4 border-t flex justify-around items-center bg-background">
          <Button variant="ghost" size="icon" aria-label="Home">
            <Home className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Notifications">
            <Bell className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Settings">
            <SettingsIcon className="h-5 w-5" />
          </Button>
        </div>
       
    </div>
    </>
    
  );
}

export default Sidebar;