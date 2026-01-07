"use client";

import * as React from "react";
import { Header } from "./Header";
import { RightPanel } from "./RightPanel";
import { Sidebar } from "./Sidebar";
import { CommandPalette } from "./CommandPalette";
import { useUIState } from "@/lib/supabase-store";
import { Loader2, Plane } from "lucide-react";

export function MainLayout({ children }: { children: React.ReactNode }) {
    const {
        isLoading,
        error,
        isSidebarCollapsed,
        toggleSidebar,
        isRightPanelOpen,
        toggleRightPanel
    } = useUIState();

    // Show loading state while fetching data from Supabase
    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                            <Plane className="h-8 w-8 text-primary animate-pulse" />
                        </div>
                        <Loader2 className="h-20 w-20 animate-spin text-primary/30 absolute -top-2 -left-2" />
                    </div>
                    <div className="text-center">
                        <h2 className="text-lg font-semibold">Loading your trip...</h2>
                        <p className="text-sm text-muted-foreground">Connecting to HyperSpace</p>
                    </div>
                </div>
            </div>
        );
    }

    // Show error state if Supabase connection fails
    if (error) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4 max-w-md text-center p-8">
                    <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
                        <span className="text-3xl">⚠️</span>
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-destructive">Connection Error</h2>
                        <p className="text-sm text-muted-foreground mt-2">{error}</p>
                        <p className="text-xs text-muted-foreground mt-4">
                            Make sure your Supabase credentials are configured in <code className="bg-muted px-1 py-0.5 rounded">.env.local</code>
                        </p>
                    </div>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen w-full bg-background overflow-hidden">
            <Sidebar
                isCollapsed={isSidebarCollapsed}
                toggleCollapse={toggleSidebar}
            />

            <div className="flex flex-1 flex-col overflow-hidden transition-all duration-300">
                <Header />
                <main className="flex-1 overflow-hidden flex relative">
                    <div className="flex-1 overflow-y-auto bg-muted/10 p-4 md:p-6 lg:p-8">
                        <div className="mx-auto max-w-6xl h-full flex flex-col">
                            {children}
                        </div>
                    </div>
                    <RightPanel
                        isOpen={isRightPanelOpen}
                        toggleOpen={toggleRightPanel}
                        className="border-l"
                    />
                </main>
            </div>

            <CommandPalette />
        </div>
    );
}
