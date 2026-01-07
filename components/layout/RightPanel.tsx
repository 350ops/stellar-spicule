"use client";

import * as React from "react";
import {
    Bot,
    Calendar,
    Check,
    ChevronRight,
    Globe,
    Hotel,
    Loader2,
    MapPin,
    Plane,
    Sparkles,
    X,
    CheckCircle2,
    XCircle,
    AlertCircle,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useActivities, useItinerary, type ItineraryItem } from "@/lib/supabase-store";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";

interface RightPanelProps extends React.HTMLAttributes<HTMLDivElement> {
    isOpen: boolean;
    toggleOpen: () => void;
}

// Type for tool invocation from message parts
interface ToolPart {
    type: string;
    toolCallId: string;
    state: 'input-streaming' | 'input-available' | 'output-available' | 'error';
    input?: Record<string, unknown>;
    output?: {
        success: boolean;
        message?: string;
        error?: string;
        item?: Record<string, unknown>;
        day?: Record<string, unknown>;
        itinerary?: Array<Record<string, unknown>>;
    };
    errorText?: string;
}

// Helper to extract tool parts from message parts
function getToolParts(parts: Array<{ type: string } & Record<string, unknown>>): ToolPart[] {
    return parts.filter(part => 
        part.type === 'dynamic-tool' || part.type.startsWith('tool-')
    ) as unknown as ToolPart[];
}

// Helper to get text content from message parts
function getTextContent(parts: Array<{ type: string } & Record<string, unknown>>): string {
    return parts
        .filter(part => part.type === 'text')
        .map(part => (part as { type: 'text'; text: string }).text)
        .join('');
}

export function RightPanel({ isOpen, toggleOpen, className }: RightPanelProps) {
    const { tripId } = useItinerary();
    
    const transport = React.useMemo(() => new DefaultChatTransport({
        api: '/api/chat',
        body: { tripId },
    }), [tripId]);
    
    const { messages, sendMessage, status } = useChat({
        transport,
    });
    const { activities } = useActivities();
    const scrollRef = React.useRef<HTMLDivElement>(null);
    const [input, setInput] = React.useState('');
    const isLoading = status === 'streaming' || status === 'submitted';

    // Auto-scroll to bottom when new messages arrive
    React.useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;
        const text = input;
        setInput('');
        await sendMessage({ text });
    };

    return (
        <aside
            className={cn(
                "hidden lg:flex flex-col border-l bg-background transition-all duration-300 ease-in-out",
                isOpen ? "w-[380px]" : "w-0 overflow-hidden border-none",
                className
            )}
        >
            <div className="flex items-center justify-between border-b px-4 h-14 bg-muted/20">
                <h2 className="text-sm font-semibold flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    AI Assistant
                </h2>
                <Button variant="ghost" size="icon" onClick={toggleOpen} className="h-8 w-8">
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>

            <Tabs defaultValue="agent" className="flex-1 flex flex-col overflow-hidden">
                <div className="px-4 py-2 border-b">
                    <TabsList className="w-full grid grid-cols-2">
                        <TabsTrigger value="agent">
                            Agent
                        </TabsTrigger>
                        <TabsTrigger value="activity">Activity</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="agent" className="flex-1 flex flex-col p-0 m-0 overflow-hidden">
                    <ScrollArea className="flex-1" ref={scrollRef}>
                        <div className="p-4 space-y-4">
                            {/* Welcome Message */}
                            <div className="flex gap-3">
                                <Avatar className="h-8 w-8 border bg-primary/10">
                                    <AvatarImage src="/bot-avatar.png" />
                                    <AvatarFallback><Bot className="h-4 w-4" /></AvatarFallback>
                                </Avatar>
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold text-muted-foreground">Travel Agent</p>
                                    <div className="bg-muted/50 p-3 rounded-lg text-sm rounded-tl-none">
                                        Hi! I can help you plan your Japan trip. Try saying things like:
                                        <ul className="mt-2 space-y-1 text-muted-foreground">
                                            <li>• &quot;Add breakfast at Yuyu Cafe tomorrow morning&quot;</li>
                                            <li>• &quot;What&apos;s the plan for Thursday?&quot;</li>
                                            <li>• &quot;Change the Shibuya Sky time to 5 PM&quot;</li>
                                            <li>• &quot;Remove the Spa World activity&quot;</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Chat Messages */}
                            {messages.map((m) => {
                                const toolParts = getToolParts(m.parts as Array<{ type: string } & Record<string, unknown>>);
                                const textContent = getTextContent(m.parts as Array<{ type: string } & Record<string, unknown>>);
                                
                                return (
                                    <div key={m.id} className={cn("flex gap-3", m.role === 'user' ? "flex-row-reverse" : "")}>
                                        <Avatar className={cn("h-8 w-8 border shrink-0", m.role === 'user' ? "bg-background" : "bg-primary/10")}>
                                            <AvatarFallback>{m.role === 'user' ? <UserIcon /> : <Bot className="h-4 w-4" />}</AvatarFallback>
                                        </Avatar>
                                        <div className={cn("space-y-2 max-w-[85%]", m.role === 'user' ? "items-end flex flex-col" : "")}>
                                            <p className="text-xs font-semibold text-muted-foreground">{m.role === 'user' ? 'You' : 'Travel Agent'}</p>
                                            
                                            {/* Tool Invocations */}
                                            {toolParts.length > 0 && (
                                                <div className="space-y-2">
                                                    {toolParts.map((tool) => (
                                                        <ToolInvocationCard key={tool.toolCallId} tool={tool} />
                                                    ))}
                                                </div>
                                            )}
                                            
                                            {/* Text Content */}
                                            {textContent && (
                                                <div className={cn(
                                                    "p-3 rounded-lg text-sm", 
                                                    m.role === 'user' 
                                                        ? "bg-primary text-primary-foreground rounded-tr-none" 
                                                        : "bg-muted/50 rounded-tl-none"
                                                )}>
                                                    {textContent}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Loading indicator */}
                            {isLoading && (
                                <div className="flex gap-3">
                                    <Avatar className="h-8 w-8 border bg-primary/10">
                                        <AvatarFallback><Bot className="h-4 w-4" /></AvatarFallback>
                                    </Avatar>
                                    <div className="space-y-1">
                                        <p className="text-xs font-semibold text-muted-foreground">Travel Agent</p>
                                        <div className="bg-muted/50 p-3 rounded-lg text-sm rounded-tl-none flex items-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            <span className="text-muted-foreground">Thinking...</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </ScrollArea>

                    {/* Input Area */}
                    <div className="p-4 border-t bg-background">
                        <form onSubmit={handleSubmit} className="relative">
                            <input
                                value={input}
                                onChange={handleInputChange}
                                className="w-full bg-muted/30 border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary pr-10"
                                placeholder="Ask anything or give a command..."
                                disabled={isLoading}
                            />
                            <Button 
                                type="submit" 
                                size="icon" 
                                className="absolute right-1 top-1 h-7 w-7 rounded-full shadow-none" 
                                variant="ghost"
                                disabled={isLoading || !input.trim()}
                            >
                                {isLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <ArrowUpIcon className="h-4 w-4" />
                                )}
                            </Button>
                        </form>
                        <div className="flex gap-2 mt-2 justify-center">
                            <StatusPill icon={Globe} label="Web" connected />
                            <StatusPill icon={Plane} label="Flights" connected />
                            <StatusPill icon={Hotel} label="Hotels" connected />
                            <StatusPill icon={Calendar} label="Calendar" />
                            <StatusPill icon={MapPin} label="Maps" />
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="activity" className="flex-1 p-0 m-0">
                    <ScrollArea className="h-full">
                        <div className="p-4 space-y-4">
                            {activities.map((activity) => (
                                <ActivityItem
                                    key={activity.id}
                                    user={activity.user}
                                    action={activity.action}
                                    target={activity.target}
                                    time={activity.time}
                                />
                            ))}
                            {activities.length === 0 && (
                                <div className="text-center text-muted-foreground text-sm py-8">
                                    No activity yet
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </TabsContent>
            </Tabs>
        </aside>
    );
}

function ToolInvocationCard({ tool }: { tool: ToolPart }) {
    // Extract tool name from the type (e.g., 'tool-addItineraryItem' -> 'addItineraryItem')
    const toolName = tool.type.startsWith('tool-') 
        ? tool.type.replace('tool-', '') 
        : (tool as { toolName?: string }).toolName || 'unknown';

    const getToolLabel = () => {
        switch (toolName) {
            case 'addItineraryItem':
                return 'Adding to itinerary';
            case 'updateItineraryItem':
                return 'Updating item';
            case 'deleteItineraryItem':
                return 'Removing item';
            case 'getItineraryItems':
                return 'Checking itinerary';
            default:
                return toolName;
        }
    };

    // Show loading state for streaming or available input (before output)
    if (tool.state === 'input-streaming' || tool.state === 'input-available') {
        return (
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg text-sm">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600 dark:text-blue-400" />
                <span className="text-blue-700 dark:text-blue-300">{getToolLabel()}...</span>
            </div>
        );
    }

    // Show error state
    if (tool.state === 'error') {
        return (
            <div className="flex items-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg text-sm">
                <XCircle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0" />
                <span className="text-red-700 dark:text-red-300">
                    {tool.errorText || 'Something went wrong'}
                </span>
            </div>
        );
    }

    // Show result state
    if (tool.state === 'output-available' && tool.output) {
        if (tool.output.success) {
            return (
                <div className="flex items-start gap-2 px-3 py-2 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                    <div className="flex-1">
                        <span className="text-green-700 dark:text-green-300 font-medium">
                            {tool.output.message || 'Done!'}
                        </span>
                        {tool.output.item && (
                            <div className="mt-1 text-xs text-green-600 dark:text-green-400">
                                {(tool.output.item as { title?: string }).title && (
                                    <span>• {(tool.output.item as { title: string }).title}</span>
                                )}
                            </div>
                        )}
                        {tool.output.day && (
                            <div className="mt-1 text-xs text-green-600 dark:text-green-400 space-y-0.5">
                                <div className="font-medium">
                                    {(tool.output.day as { label?: string }).label} - {(tool.output.day as { location?: string }).location}
                                </div>
                                {(tool.output.day as { items?: Array<{ time: string; title: string; status: string }> }).items?.slice(0, 5).map((item, i) => (
                                    <div key={i} className="flex items-center gap-1">
                                        <span className="font-mono">{item.time}</span>
                                        <span>{item.title}</span>
                                        <Badge variant="outline" className="text-[8px] h-4 px-1">
                                            {item.status}
                                        </Badge>
                                    </div>
                                ))}
                                {((tool.output.day as { items?: Array<unknown> }).items?.length || 0) > 5 && (
                                    <div className="text-muted-foreground">
                                        +{((tool.output.day as { items?: Array<unknown> }).items?.length || 0) - 5} more items
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            );
        } else {
            return (
                <div className="flex items-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg text-sm">
                    <XCircle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0" />
                    <span className="text-red-700 dark:text-red-300">
                        {tool.output.error || 'Something went wrong'}
                    </span>
                </div>
            );
        }
    }

    return null;
}

function UserIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
        >
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    )
}

function StatusPill({ icon: Icon, label, connected }: { icon: React.ComponentType<{ className?: string }>; label: string; connected?: boolean }) {
    return (
        <div
            className={cn(
                "h-6 px-2 rounded-full flex items-center justify-center gap-1 transition-colors text-[10px] font-medium",
                connected
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-muted text-muted-foreground"
            )}
            title={`${label}: ${connected ? 'Connected' : 'Disconnected'}`}
        >
            <Icon className="h-3 w-3" />
            <span className="hidden sm:inline">{label}</span>
        </div>
    );
}

function ActivityItem({ user, action, target, time }: { user: string; action: string; target: string; time: string }) {
    const isAI = user === 'AI Agent';
    return (
        <div className="flex gap-3 text-sm">
            <Avatar className={cn("h-8 w-8 mt-1", isAI && "bg-primary/10")}>
                <AvatarFallback>
                    {isAI ? <Bot className="h-4 w-4" /> : user[0]}
                </AvatarFallback>
            </Avatar>
            <div>
                <p>
                    <span className={cn("font-semibold", isAI && "text-primary")}>{user}</span>{' '}
                    {action}{' '}
                    <span className="font-medium text-primary">{target}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{time}</p>
            </div>
        </div>
    )
}

function ArrowUpIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m5 12 7-7 7 7" />
            <path d="M12 19V5" />
        </svg>
    )
}
