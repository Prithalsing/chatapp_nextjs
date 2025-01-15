import { useState, useEffect, useRef } from 'react';
import { Send, Smile, Phone, Video, Upload, MoreVertical } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { io } from 'socket.io-client';
import { useUser } from '@clerk/nextjs';

let socket;

export const ChatArea = ({ chat }) => {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const { user, isLoaded } = useUser();
    const [conversationId, setConversationId] = useState(null);
    const scrollRef = useRef(null);
    const [isInitializing, setIsInitializing] = useState(false);
    const fileInputRef = useRef(null);
    const [isConnected, setIsConnected] = useState(false);

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
        const connectSocket = async () => {
            if (isLoaded && user && chat?.id && !socket) {
                console.log("Attempting to connect to Socket.IO...");
                socket = io(process.env.NEXT_PUBLIC_SOCKET_IO_URL);

                socket.on('connect', () => {
                    setIsConnected(true);
                    console.log("Socket connected:", socket.id);
                    socket.emit('join-chat', chat.id);
                });

                if (chat?.id) {
                    socket.emit('join-chat', chat.id, (response) => {
                        if (response && response.status === 'ok') {
                            console.log(`Successfully joined room: ${chat.id}`);
                        } else {
                            console.error(`Failed to join room: ${chat.id}`, response); // Log the response for debugging
                        }
                    });
                }
                socket.on('receive-message', (message) => {
                    setMessages((prevMessages) => [...prevMessages, message]);
                    scrollToBottom();
                });

                socket.emit('join-chat', chat.id, (response) => {
                    if (response && response.status === 'ok') {
                        console.log(`Successfully joined room: ${chat.id}`);
                    } else {
                        console.error(`Failed to join room: ${chat.id}`, response?.message);
                    }
                });

                socket.on('disconnect', () => {
                    setIsConnected(false);
                    console.log("Socket disconnected");
                    socket = null;
                });

                socket.on('connect_error', (err) => {
                    console.error('Socket connection error:', err);
                });
            }
        };

        connectSocket();

        return () => {
            if (socket) {
                socket.disconnect();
                console.log("Socket disconnected on cleanup");
                socket = null;
            }
        };
    }, [isLoaded, chat?.id, user?.id]);

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

        } catch (error) {
            console.error('Error during conversation initialization:', error);
        } finally {
            setIsInitializing(false);
        }
    };

    useEffect(() => {
        if (isLoaded && !isInitializing) {
            initializeConversation();
        }
    }, [isLoaded]);

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
                headers: { 'Content-Type': 'application/json' },
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
            if (!conversationId) return;
            
            try {
                const response = await fetch(`/api/messages/${conversationId}`);
                if (!response.ok) throw new Error(await response.text());
                
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

    const handleFileUpload = async (event) => {
        if (event.target.files && event.target.files.length > 0) {
            const file = event.target.files[0];
            const formData = new FormData();
            formData.append('file', file);

            try {
                const response = await fetch('/api/upload', { method: 'POST', body: formData });
                
                if (!response.ok) throw new Error(await response.text());

                const data = await response.json();
                sendMessage({ content: `[Attachment: ${file.name}]`, fileUrl: data.fileUrl });
                
            } catch (error) {
                console.error("File upload error:", error);
            }
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
                                    <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer">View Attachment</a>
                                )}
                                <span className="text-xs opacity-70 mt-1 block">{new Date(msg.createdAt).toLocaleTimeString()}</span>
                            </div>
                        </div>
                    ))}
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
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
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
