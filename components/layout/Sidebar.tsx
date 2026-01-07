"use client";

import * as React from "react";
import {
    ChevronsLeft,
    FileText,
    Home,
    Menu,
    Plus,
    Settings,
    Star,
    Plane,
    Users,
    Train,
    Car,
    Hotel,
    Utensils,
    Ticket,
    MapPin,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useEditModal, useUIState } from "@/lib/supabase-store";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
    isCollapsed: boolean;
    toggleCollapse: () => void;
}

export function Sidebar({ className, isCollapsed, toggleCollapse }: SidebarProps) {
    return (
        <>
            {/* Mobile Drawer */}
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden fixed top-3 left-4 z-40">
                        <Menu className="h-5 w-5" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] p-0">
                    <SidebarContent />
                </SheetContent>
            </Sheet>

            {/* Desktop Sidebar */}
            <aside
                className={cn(
                    "hidden md:flex flex-col border-r bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out",
                    isCollapsed ? "w-[80px]" : "w-[280px]",
                    className
                )}
            >
                <SidebarContent isCollapsed={isCollapsed} toggleCollapse={toggleCollapse} />
            </aside>
        </>
    );
}

function SidebarContent({
    isCollapsed,
    toggleCollapse,
}: {
    isCollapsed?: boolean;
    toggleCollapse?: () => void;
}) {
    const { openEditModal } = useEditModal();
    const { setActiveTab } = useUIState();

    const handleAddItem = (type: string) => {
        // Open edit modal with the specified type pre-selected
        // Default to day 0 (Day 1), but user can change it
        setActiveTab("itinerary"); // Navigate to itinerary tab
        setTimeout(() => {
            openEditModal("create", 0);
        }, 100);
    };

    return (
        <div className="flex h-full flex-col">
            {/* Sidebar Header */}
            <div className={cn("flex h-14 items-center border-b px-4", isCollapsed ? "justify-center" : "justify-between")}>
                {!isCollapsed && <span className="text-lg font-semibold tracking-tight">HyperSpace</span>}
                {toggleCollapse && (
                    <Button variant="ghost" size="icon" onClick={toggleCollapse} className="h-8 w-8 ml-auto">
                        <ChevronsLeft className={cn("h-4 w-4 transition-transform", isCollapsed && "rotate-180")} />
                    </Button>
                )}
            </div>

            <ScrollArea className="flex-1 py-4">
                <div className="space-y-4">
                    <div className="px-3 py-2">
                        {!isCollapsed && <h2 className="mb-2 px-4 text-xs font-semibold tracking-tight text-sidebar-foreground/70">Spaces</h2>}
                        <div className="space-y-1">
                            <NavItem icon={Home} label="Home" isCollapsed={isCollapsed} />
                            <NavItem icon={Plane} label="Japan Trip" isActive isCollapsed={isCollapsed} />
                            <NavItem icon={Users} label="Family" isCollapsed={isCollapsed} />
                        </div>
                    </div>

                    <div className="px-3 py-2">
                        {!isCollapsed && <h2 className="mb-2 px-4 text-xs font-semibold tracking-tight text-sidebar-foreground/70">Favorites</h2>}
                        <div className="space-y-1">
                            <NavItem icon={Star} label="Niseko Resorts" isCollapsed={isCollapsed} />
                            <NavItem icon={Star} label="Tokyo Food" isCollapsed={isCollapsed} />
                        </div>
                    </div>

                    <div className="px-3 py-2">
                        {!isCollapsed && <h2 className="mb-2 px-4 text-xs font-semibold tracking-tight text-sidebar-foreground/70">Pages</h2>}
                        <div className="space-y-1">
                            <NavItem icon={FileText} label="Ideas" isCollapsed={isCollapsed} />
                            <NavItem icon={FileText} label="Receipts" isCollapsed={isCollapsed} />
                        </div>
                    </div>
                </div>
            </ScrollArea>

            {/* New Item Button */}
            <div className="p-4 border-t">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button className={cn("w-full justify-start gap-2", isCollapsed && "justify-center px-0")}>
                            <Plus className="h-4 w-4" />
                            {!isCollapsed && <span>New Item</span>}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-[200px]">
                        <DropdownMenuItem onClick={() => handleAddItem("Flight")}>
                            <Plane className="h-4 w-4 mr-2" />
                            Flight
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAddItem("Train")}>
                            <Train className="h-4 w-4 mr-2" />
                            Train
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAddItem("RentalCar")}>
                            <Car className="h-4 w-4 mr-2" />
                            Rental Car
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleAddItem("Hotel")}>
                            <Hotel className="h-4 w-4 mr-2" />
                            Hotel / Lodging
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAddItem("Food")}>
                            <Utensils className="h-4 w-4 mr-2" />
                            Restaurant
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAddItem("Activity")}>
                            <Ticket className="h-4 w-4 mr-2" />
                            Activity
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleAddItem("Other")}>
                            <MapPin className="h-4 w-4 mr-2" />
                            Other
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* User Profile / Settings */}
            <div className="p-2 border-t">
                <Button variant="ghost" className={cn("w-full justify-start gap-2", isCollapsed && "justify-center px-0")}>
                    <Settings className="h-4 w-4" />
                    {!isCollapsed && <span>Settings</span>}
                </Button>
            </div>
        </div>
    );
}

function NavItem({ icon: Icon, label, isActive, isCollapsed }: { icon: any; label: string; isActive?: boolean; isCollapsed?: boolean }) {
    return (
        <Button
            variant={isActive ? "secondary" : "ghost"}
            className={cn("w-full justify-start gap-3", isActive && "font-medium", isCollapsed && "justify-center px-0")}
            title={isCollapsed ? label : undefined}
        >
            <Icon className="h-4 w-4" />
            {!isCollapsed && <span className="truncate">{label}</span>}
        </Button>
    );
}
