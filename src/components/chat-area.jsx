import { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Smile, MoreVertical, Phone, Video, Upload } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUser } from "@clerk/nextjs";
import { io } from 'socket.io-client';


let socket; 

export const ChatArea = ({ chat }) => {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const { user, isLoaded } = useUser();
    const [conversationId, setConversationId] = useState(null);
    const scrollRef = useRef(null);
    const [isInitializing, setIsInitializing] = useState(false);
    const fileInputRef = useRef(null); // Ref for the file input
    const [selectedFile, setSelectedFile] = useState(null);

    useEffect(() => {
        if (fileInputRef.current) {
            fileInputRef.current.addEventListener('change', handleFileUpload);
        }
        return () => {
            if (fileInputRef.current) {
                fileInputRef.current.removeEventListener('change', handleFileUpload);
            }
        };
    }, []);

    useEffect(() => {
        const initializeConversation = async () => {
            setIsInitializing(true);
            if (!chat?.id || !user?.id) {
                setIsInitializing(false);
                return;
            }

            try {
                const response = await fetch('/api/conversations', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ participantIds: [user.id, chat.id] }),
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error("Conversation API Error:", errorText);
                    throw new Error(`Failed to initialize conversation: ${errorText}`);
                }

                const data = await response.json();
                setConversationId(data.id);

                
                if (isLoaded && user && data.id && !socket) {
                    console.log("Connecting socket to:", process.env.NEXT_PUBLIC_SOCKET_IO_URL);
                    socket = io(process.env.NEXT_PUBLIC_SOCKET_IO_URL, {path: "/api/socket/io"});

                    socket.on("connect", () => {
                        console.log("Socket connected");
                        socket.emit('join-chat', data.id); 
                    });

                    socket.on("receive-message", (message) => {
                        console.log("CLIENT RECEIVED MESSAGE:", message);
                        setMessages((prevMessages) => [...prevMessages, message]);
                        scrollToBottom();
                    });

                    socket.on("disconnect", () => {
                        console.log("Socket disconnected");
                        socket = null;
                    });
                }
            } catch (error) {
                console.error('Error during conversation initialization:', error);
            } finally {
                setIsInitializing(false);
            }
        };

        if (isLoaded && !isInitializing) {
            initializeConversation();
        }

        return () => {
            if (socket?.connected) {
                socket.disconnect();
                console.log("Socket manually disconnected");
            }
            socket = null;
        };
    }, [chat?.id, user?.id, isLoaded]); 

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };
    
    const scrollToBottom = () => {
        if (scrollRef.current) {
          scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      };


    const sendMessage = async () => {
        if (!message.trim() || !isLoaded || !user?.id || !conversationId || !socket) return;

        const messageData = {
            content: message.trim(),
            senderId: user.id,
            receiverId: chat.id,
            conversationId: conversationId,
            createdAt: new Date().toISOString()
        };

        try {
            const response = await fetch('/api/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(messageData),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API error response:', errorText);
                throw new Error(`Failed to send message: ${errorText}`);
            }

            const newMessage = await response.json();  
            socket.emit('send-message', newMessage);
            setMessages((prev) => [...prev, newMessage.newMessage]);
            setMessage('');
            scrollToBottom();
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    useEffect(() => {
        const fetchMessages = async () => {
            if (!conversationId) {
                setMessages([]); 
                return;
            }
            try {
                const response = await fetch(`/api/messages/${conversationId}`);
                if (!response.ok) {
                    console.error("Error fetching messages:", await response.text());
                    setMessages([]); 
                    return;
                }
    
                const fetchedMessages = await response.json();
                setMessages(fetchedMessages);
                scrollToBottom();
            } catch (error) {
                console.error("Error fetching messages:", error);
                setMessages([]); 
            }
        };
    
        fetchMessages();
    }, [conversationId]);

    const handleFileUpload = (event) => {
        console.log("handleFileUpload CALLED!", event);
        if (event.target.files && event.target.files.length > 0) {
            setSelectedFile(event.target.files[0]);
            console.log("Selected file:", event.target.files[0]);

            const file = event.target.files[0];
            const formData = new FormData();
            formData.append('file', file);

            fetch('/api/upload', {
                method: 'POST',
                body: formData,
            })
                .then(response => {
                    if (!response.ok) {
                        return response.text().then(text => { throw new Error(text) });
                    }
                    return response.json();
                })
                .then(data => {
                    console.log("File URL from server:", data.fileUrl);
                    sendMessage({ content: `[Attachment: ${file.name}]`, fileUrl: data.fileUrl });
                })
                .catch(error => {
                    console.error("File upload error:", error);
                });


        } else {
            console.log("No file selected");
        }
    };


    return (
        <div className="flex-1 flex flex-col bg-background">
            <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                        {chat?.imageUrl ? (
                            <img
                                src={chat.imageUrl}
                                alt={`${chat.name || 'User'}'s avatar`}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="h-full w-full flex items-center justify-center bg-primary text-primary-foreground">
                                {chat?.name?.[0] || chat?.email?.[0]?.toUpperCase() || '?'}
                            </div>
                        )}
                    </Avatar>
                    <div>
                        <h2 className="font-medium">{chat.name || chat.email}</h2>
                        <p className="text-sm text-muted-foreground">online</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="ghost" size="icon">
                        <Video className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon">
                        <Phone className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon">
                        <MoreVertical className="h-5 w-5" />
                    </Button>
                </div>
            </div>
            <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                    {messages.map((msg) => (
                        <div key={msg?.id} className={`flex ${msg?.senderId === user?.id ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] rounded-lg p-3 ${msg?.senderId === user?.id ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                <p>{msg?.content}</p>
                                {msg.fileUrl && ( 
                                    <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer">
                                        View Attachment
                                    </a>
                                )}
                                <span className="text-xs opacity-70 mt-1 block">{new Date(msg.createdAt).toLocaleTimeString()}</span>
                                
                            </div>
                        </div>
                    ))};
                    <div ref={scrollRef} />
                </div>
            </ScrollArea>


            <div className="p-4 border-t flex items-center gap-2">
                <Button variant="ghost" size="icon">
                    <Smile className="h-5 w-5" />
                </Button>
                <Input
                    placeholder="Type a message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1"
                />
                <Button size="icon" onClick={sendMessage}>
                    <Send className="h-5 w-5" />
                </Button>
                <input
                    type="file"
                    id="file-upload"
                    style={{ display: 'none' }}
                    ref={fileInputRef} 
                    accept="image/*, .pdf, .doc, .docx"
                />
                <label htmlFor="file-upload">
                    <Button variant="ghost" size="icon">
                        <Upload className="h-5 w-5" />
                    </Button>
                </label>                         
            </div>
        </div>
    );
};



