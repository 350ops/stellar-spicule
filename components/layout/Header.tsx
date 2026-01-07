"use client";

import * as React from "react";
import { Bell, ChevronDown, Moon, PanelRight, Search, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUIState, useWorkspace } from "@/lib/store";
import { cn } from "@/lib/utils";

export function Header() {
    const { setCommandPaletteOpen, isRightPanelOpen, setRightPanelOpen } = useUIState();
    const { currentWorkspace, workspaces, setCurrentWorkspace } = useWorkspace();

    return (
        <header className="flex h-14 items-center gap-4 border-b bg-background px-6">
            {/* Workspace Switcher */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="gap-2 px-0 hover:bg-transparent text-sm font-medium">
                        <span className="h-6 w-6 rounded bg-primary/20 flex items-center justify-center text-primary text-xs">
                            {currentWorkspace.icon}
                        </span>
                        {currentWorkspace.name}
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                    {workspaces.map((workspace) => (
                        <DropdownMenuItem
                            key={workspace.id}
                            onClick={() => setCurrentWorkspace(workspace)}
                            className={cn(
                                currentWorkspace.id === workspace.id && "bg-accent"
                            )}
                        >
                            <span className="h-5 w-5 rounded bg-primary/20 flex items-center justify-center text-primary text-[10px] mr-2">
                                {workspace.icon}
                            </span>
                            {workspace.name}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex-1" />

            {/* Global Search - Opens Command Palette */}
            <button
                onClick={() => setCommandPaletteOpen(true)}
                className="relative w-64 md:w-80 hidden sm:flex items-center bg-muted/40 rounded-md px-3 h-9 text-sm text-muted-foreground hover:bg-muted/60 transition-colors"
            >
                <Search className="h-4 w-4 mr-2" />
                <span>Search...</span>
                <div className="ml-auto flex items-center gap-1">
                    <kbd className="inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                        <span className="text-xs">⌘</span>K
                    </kbd>
                </div>
            </button>

            <div className="flex items-center gap-2">
                <ThemeToggle />

                {/* Right Panel Toggle - Shows when panel is closed */}
                {!isRightPanelOpen && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setRightPanelOpen(true)}
                        className="text-muted-foreground hidden lg:flex"
                        title="Open AI Assistant"
                    >
                        <PanelRight className="h-5 w-5" />
                    </Button>
                )}

                <Button variant="ghost" size="icon" className="text-muted-foreground">
                    <Bell className="h-5 w-5" />
                </Button>

                {/* Presence Avatars */}
                <div className="flex items-center -space-x-2 mr-2 ml-2">
                    <Avatar className="h-7 w-7 border-2 border-background">
                        <AvatarImage src="https://github.com/shadcn.png" />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <Avatar className="h-7 w-7 border-2 border-background">
                        <AvatarImage src="https://i.pravatar.cc/150?u=a042581f4e29026704d" />
                        <AvatarFallback>AL</AvatarFallback>
                    </Avatar>
                    <Avatar className="h-7 w-7 border-2 border-background">
                        <AvatarImage src="https://i.pravatar.cc/150?u=a042581f4e29026024d" />
                        <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                </div>

                {/* Profile Menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                                <AvatarFallback>SC</AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuItem>Profile</DropdownMenuItem>
                        <DropdownMenuItem>Settings</DropdownMenuItem>
                        <DropdownMenuItem>Log out</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

            </div>
        </header>
    );
}

function ThemeToggle() {
    const { setTheme, theme } = useTheme();

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            title="Toggle theme"
        >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
        </Button>
    );
}
