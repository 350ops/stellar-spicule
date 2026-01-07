"use client";

import * as React from "react";
import {
    Calendar,
    FileText,
    Home,
    Map,
    MessageSquare,
    Plane,
    Plus,
    Search,
    Settings,
    Sparkles,
    Star,
    Sun,
    Moon,
    PanelRight,
    Users,
} from "lucide-react";
import { useTheme } from "next-themes";

import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from "@/components/ui/command";
import { useUIState, useWorkspace } from "@/lib/store";

export function CommandPalette() {
    const { isCommandPaletteOpen, setCommandPaletteOpen, setActiveTab, setRightPanelOpen, isRightPanelOpen } = useUIState();
    const { workspaces, setCurrentWorkspace } = useWorkspace();
    const { setTheme, theme } = useTheme();

    // Global keyboard shortcut
    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setCommandPaletteOpen(!isCommandPaletteOpen);
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, [isCommandPaletteOpen, setCommandPaletteOpen]);

    const runCommand = React.useCallback((command: () => void) => {
        setCommandPaletteOpen(false);
        command();
    }, [setCommandPaletteOpen]);

    return (
        <CommandDialog open={isCommandPaletteOpen} onOpenChange={setCommandPaletteOpen}>
            <CommandInput placeholder="Type a command or search..." />
            <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>

                <CommandGroup heading="Quick Actions">
                    <CommandItem onSelect={() => runCommand(() => {})}>
                        <Plus className="mr-2 h-4 w-4" />
                        <span>New Page</span>
                        <CommandShortcut>⌘N</CommandShortcut>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => {})}>
                        <Plus className="mr-2 h-4 w-4" />
                        <span>Add Place</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => {})}>
                        <Plus className="mr-2 h-4 w-4" />
                        <span>New Itinerary Item</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => setRightPanelOpen(true))}>
                        <Sparkles className="mr-2 h-4 w-4" />
                        <span>Ask AI Assistant</span>
                        <CommandShortcut>⌘J</CommandShortcut>
                    </CommandItem>
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup heading="Navigation">
                    <CommandItem onSelect={() => runCommand(() => setActiveTab("overview"))}>
                        <Home className="mr-2 h-4 w-4" />
                        <span>Overview</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => setActiveTab("itinerary"))}>
                        <Calendar className="mr-2 h-4 w-4" />
                        <span>Itinerary</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => setActiveTab("map"))}>
                        <Map className="mr-2 h-4 w-4" />
                        <span>Map</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => setActiveTab("calendar"))}>
                        <Calendar className="mr-2 h-4 w-4" />
                        <span>Calendar</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => setActiveTab("notes"))}>
                        <FileText className="mr-2 h-4 w-4" />
                        <span>Notes</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => setActiveTab("budget"))}>
                        <FileText className="mr-2 h-4 w-4" />
                        <span>Budget</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => setActiveTab("files"))}>
                        <FileText className="mr-2 h-4 w-4" />
                        <span>Files</span>
                    </CommandItem>
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup heading="Workspaces">
                    {workspaces.map((workspace) => (
                        <CommandItem
                            key={workspace.id}
                            onSelect={() => runCommand(() => setCurrentWorkspace(workspace))}
                        >
                            <Users className="mr-2 h-4 w-4" />
                            <span>{workspace.name}</span>
                        </CommandItem>
                    ))}
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup heading="Trips">
                    <CommandItem onSelect={() => runCommand(() => {})}>
                        <Plane className="mr-2 h-4 w-4" />
                        <span>Japan Trip</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => {})}>
                        <Star className="mr-2 h-4 w-4" />
                        <span>Niseko Resorts</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => {})}>
                        <Star className="mr-2 h-4 w-4" />
                        <span>Tokyo Food</span>
                    </CommandItem>
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup heading="Settings">
                    <CommandItem onSelect={() => runCommand(() => setTheme(theme === "dark" ? "light" : "dark"))}>
                        {theme === "dark" ? (
                            <Sun className="mr-2 h-4 w-4" />
                        ) : (
                            <Moon className="mr-2 h-4 w-4" />
                        )}
                        <span>Toggle {theme === "dark" ? "Light" : "Dark"} Mode</span>
                        <CommandShortcut>⌘D</CommandShortcut>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => setRightPanelOpen(!isRightPanelOpen))}>
                        <PanelRight className="mr-2 h-4 w-4" />
                        <span>{isRightPanelOpen ? "Hide" : "Show"} AI Panel</span>
                        <CommandShortcut>⌘B</CommandShortcut>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => {})}>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                        <CommandShortcut>⌘,</CommandShortcut>
                    </CommandItem>
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    );
}
