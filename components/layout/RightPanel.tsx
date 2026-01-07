"use client";

import * as React from "react";
import {
    Bot,
    Calendar,
    Check,
    ChevronRight,
    Globe,
    Hotel,
    MapPin,
    Plane,
    Sparkles,
    X,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useProposals, useActivities, type Proposal } from "@/lib/store";

import { useChat } from "@ai-sdk/react";

interface RightPanelProps extends React.HTMLAttributes<HTMLDivElement> {
    isOpen: boolean;
    toggleOpen: () => void;
}

export function RightPanel({ isOpen, toggleOpen, className }: RightPanelProps) {
    const { messages, sendMessage } = useChat();
    const [input, setInput] = React.useState("");
    const { proposals, approveProposal, rejectProposal } = useProposals();
    const { activities } = useActivities();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;
        sendMessage({ text: input });
        setInput("");
    };

    // Filter pending proposals
    const pendingProposals = proposals.filter(p => p.status === "pending");
    const recentApproved = proposals.filter(p => p.status === "approved").slice(0, 2);

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
                        <TabsTrigger value="agent" className="relative">
                            Agent
                            {pendingProposals.length > 0 && (
                                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] text-primary-foreground flex items-center justify-center">
                                    {pendingProposals.length}
                                </span>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="activity">Activity</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="agent" className="flex-1 flex flex-col p-0 m-0 overflow-hidden">
                    <ScrollArea className="flex-1">
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
                                        Hi! I can help you plan your Japan trip. I&apos;ve analyzed your preferences and have some suggestions ready.
                                    </div>
                                </div>
                            </div>

                            {/* Chat Messages */}
                            {messages.map((m) => (
                                <div key={m.id} className={cn("flex gap-3", m.role === 'user' ? "flex-row-reverse" : "")}>
                                    <Avatar className={cn("h-8 w-8 border", m.role === 'user' ? "bg-background" : "bg-primary/10")}>
                                        <AvatarFallback>{m.role === 'user' ? <UserIcon /> : <Bot className="h-4 w-4" />}</AvatarFallback>
                                    </Avatar>
                                    <div className={cn("space-y-1 max-w-[85%]", m.role === 'user' ? "items-end flex flex-col" : "")}>
                                        <p className="text-xs font-semibold text-muted-foreground">{m.role === 'user' ? 'You' : 'Travel Agent'}</p>
                                        <div className={cn("p-3 rounded-lg text-sm", m.role === 'user' ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-muted/50 rounded-tl-none")}>
                                            {m.parts ? m.parts.map((part, i) => (
                                                part.type === 'text' ? <span key={i}>{part.text}</span> : null
                                            )) : null}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Pending Proposals */}
                            {pendingProposals.length > 0 && (
                                <div className="space-y-3 mt-4">
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                        <Sparkles className="h-3 w-3" />
                                        Suggested Actions ({pendingProposals.length})
                                    </p>
                                    {pendingProposals.map((proposal) => (
                                        <ProposalCard
                                            key={proposal.id}
                                            proposal={proposal}
                                            onApprove={() => approveProposal(proposal.id)}
                                            onReject={() => rejectProposal(proposal.id)}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Recently Applied */}
                            {recentApproved.length > 0 && (
                                <div className="space-y-2 mt-4">
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Recently Applied</p>
                                    {recentApproved.map((proposal) => (
                                        <div
                                            key={proposal.id}
                                            className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 flex items-center gap-2 text-sm text-green-700 dark:text-green-400"
                                        >
                                            <Check className="h-4 w-4" />
                                            <span className="truncate">{proposal.title}</span>
                                        </div>
                                    ))}
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
                                placeholder="Ask anything..."
                            />
                            <Button type="submit" size="icon" className="absolute right-1 top-1 h-7 w-7 rounded-full shadow-none" variant="ghost">
                                <ArrowUpIcon className="h-4 w-4" />
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
                        </div>
                    </ScrollArea>
                </TabsContent>
            </Tabs>
        </aside>
    );
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

function ProposalCard({
    proposal,
    onApprove,
    onReject
}: {
    proposal: Proposal;
    onApprove: () => void;
    onReject: () => void;
}) {
    const [isApproving, setIsApproving] = React.useState(false);

    const handleApprove = () => {
        setIsApproving(true);
        // Simulate a brief delay for the animation
        setTimeout(() => {
            onApprove();
        }, 300);
    };

    const typeIcon = {
        itinerary: Calendar,
        place: MapPin,
        booking: Hotel,
        flight: Plane,
    }[proposal.type] || Sparkles;

    const TypeIcon = typeIcon;

    return (
        <Card className={cn(
            "shadow-sm border-muted-foreground/20 transition-all duration-300",
            isApproving && "scale-95 opacity-50"
        )}>
            <CardHeader className="p-3 pb-2">
                <div className="flex justify-between items-start gap-2">
                    <div className="flex items-start gap-2">
                        <div className="h-6 w-6 rounded bg-primary/10 flex items-center justify-center mt-0.5">
                            <TypeIcon className="h-3 w-3 text-primary" />
                        </div>
                        <CardTitle className="text-sm font-medium leading-tight">{proposal.title}</CardTitle>
                    </div>
                    <Badge
                        variant="secondary"
                        className={cn(
                            "text-[10px] h-5 shrink-0",
                            proposal.confidence >= 90
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : proposal.confidence >= 80
                                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                    : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                        )}
                    >
                        {proposal.confidence}%
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="p-3 pt-0 pb-2">
                <p className="text-xs text-muted-foreground">{proposal.description}</p>
            </CardContent>
            <CardFooter className="p-3 pt-2 flex gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs flex-1"
                    onClick={onReject}
                    disabled={isApproving}
                >
                    <X className="h-3 w-3 mr-1" />
                    Reject
                </Button>
                <Button
                    size="sm"
                    className="h-7 text-xs flex-1"
                    onClick={handleApprove}
                    disabled={isApproving}
                >
                    <Check className="h-3 w-3 mr-1" />
                    Approve
                </Button>
            </CardFooter>
        </Card>
    );
}

function StatusPill({ icon: Icon, label, connected }: { icon: any; label: string; connected?: boolean }) {
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
    return (
        <div className="flex gap-3 text-sm">
            <Avatar className="h-8 w-8 mt-1">
                <AvatarFallback>{user[0]}</AvatarFallback>
            </Avatar>
            <div>
                <p>
                    <span className="font-semibold">{user}</span> {action} <span className="font-medium text-primary">{target}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{time}</p>
            </div>
        </div>
    )
}

function ArrowUpIcon(props: any) {
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
