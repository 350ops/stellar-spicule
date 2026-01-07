"use client";

import * as React from "react";
import { Header } from "./Header";
import { RightPanel } from "./RightPanel";
import { Sidebar } from "./Sidebar";
import { CommandPalette } from "./CommandPalette";
import { useUIState } from "@/lib/store";

export function MainLayout({ children }: { children: React.ReactNode }) {
    const {
        isSidebarCollapsed,
        toggleSidebar,
        isRightPanelOpen,
        toggleRightPanel
    } = useUIState();

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
