"use client";

import * as React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Clock, Edit, GripVertical, MapPin, MoreHorizontal, FileText, MessageSquare, Link2, Plus, Trash2 } from "lucide-react";
import { useItinerary, useUIState, useEditModal, type ItineraryItem } from "@/lib/supabase-store";
import { Separator } from "@/components/ui/separator";
import { EditItemModal } from "./EditItemModal";

export function ItineraryTab() {
    const { itinerary, deleteItineraryItem } = useItinerary();
    const { selectedItineraryItem, setSelectedItineraryItem } = useUIState();
    const { openEditModal } = useEditModal();

    return (
        <div className="flex gap-6 pb-10 relative">
            <div className="flex-1 space-y-8">
                {itinerary.map((day) => (
                    <div key={day.day} className="relative pl-8 border-l-2 border-muted">
                        {/* Day Marker */}
                        <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-primary ring-4 ring-background" />

                        <div className="mb-4">
                            <h3 className="text-lg font-bold">{day.day} <span className="text-muted-foreground font-normal text-base ml-2">{day.date}</span></h3>
                            <p className="text-sm text-muted-foreground">{day.location}</p>
                        </div>

                        <div className="space-y-3">
                            {day.items.map((item) => {
                                const dayIndex = itinerary.findIndex(d => d.day === day.day);
                                return (
                                    <div
                                        key={item.id}
                                        onClick={() => setSelectedItineraryItem({ ...item, day: day.day, date: day.date })}
                                        className="group relative flex gap-4 bg-card rounded-lg border p-3 shadow-sm hover:shadow-md hover:border-primary/50 cursor-pointer transition-all"
                                    >
                                        <div className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-muted-foreground cursor-grab active:cursor-grabbing">
                                            <GripVertical className="h-4 w-4" />
                                        </div>

                                        <div className="pl-6 flex-1">
                                            <div className="flex justify-between items-start mb-1">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="font-mono text-xs">{item.time}</Badge>
                                                    <h4 className="font-semibold text-sm">{item.title}</h4>
                                                </div>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2" onClick={(e) => e.stopPropagation()}>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                                        <DropdownMenuItem onClick={() => openEditModal("edit", dayIndex, { ...item, day: day.day, date: day.date })}>
                                                            <Edit className="h-4 w-4 mr-2" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className="text-destructive focus:text-destructive"
                                                            onClick={() => {
                                                                if (confirm(`Delete "${item.title}"?`)) {
                                                                    deleteItineraryItem(item.id);
                                                                }
                                                            }}
                                                        >
                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>

                                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                <div className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {item.location}</div>
                                                {item.duration && <div className="flex items-center gap-1"><Clock className="h-3 w-3" /> {item.duration}</div>}
                                            </div>
                                        </div>

                                        <div className="flex flex-col justify-between items-end">
                                            <StatusChip status={item.status} />
                                            <div className="flex -space-x-2">
                                                {item.assignees.map((a: string, i: number) => (
                                                    <Avatar key={i} className="h-5 w-5 border-2 border-background">
                                                        <AvatarFallback className="text-[9px] bg-primary/10 text-primary">{a}</AvatarFallback>
                                                    </Avatar>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            {day.empty && (
                                <div
                                    onClick={() => {
                                        const dayIndex = itinerary.findIndex(d => d.day === day.day);
                                        openEditModal("create", dayIndex);
                                    }}
                                    className="h-24 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-muted-foreground text-sm hover:bg-muted/50 hover:border-primary/50 transition cursor-pointer"
                                >
                                    <Plus className="h-5 w-5 mb-1" />
                                    <span>Add first item</span>
                                </div>
                            )}
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full text-muted-foreground text-xs opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity h-8"
                                onClick={() => {
                                    const dayIndex = itinerary.findIndex(d => d.day === day.day);
                                    openEditModal("create", dayIndex);
                                }}
                            >
                                <Plus className="h-3 w-3 mr-1" />
                                Add item
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Edit Modal */}
            <EditItemModal />

            {/* Details Drawer */}
            <Sheet open={!!selectedItineraryItem} onOpenChange={(open) => !open && setSelectedItineraryItem(null)}>
                <SheetContent className="w-[400px] sm:w-[540px]">
                    {selectedItineraryItem && (
                        <div className="space-y-6">
                            <SheetHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <SheetTitle>{selectedItineraryItem.title}</SheetTitle>
                                        <SheetDescription>
                                            {selectedItineraryItem.day} ({selectedItineraryItem.date}) • {selectedItineraryItem.time}
                                        </SheetDescription>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                const dayIndex = itinerary.findIndex(d => d.day === selectedItineraryItem.day);
                                                openEditModal("edit", dayIndex, selectedItineraryItem);
                                            }}
                                        >
                                            <Edit className="h-4 w-4 mr-1" />
                                            Edit
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-destructive hover:text-destructive"
                                            onClick={() => {
                                                if (confirm(`Delete "${selectedItineraryItem.title}"?`)) {
                                                    deleteItineraryItem(selectedItineraryItem.id);
                                                    setSelectedItineraryItem(null);
                                                }
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </SheetHeader>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-muted/50 rounded-lg">
                                    <span className="text-xs text-muted-foreground uppercase font-semibold">Location</span>
                                    <p className="text-sm font-medium flex items-center gap-2 mt-1">
                                        <MapPin className="h-4 w-4" /> {selectedItineraryItem.location}
                                    </p>
                                </div>
                                <div className="p-3 bg-muted/50 rounded-lg">
                                    <span className="text-xs text-muted-foreground uppercase font-semibold">Status</span>
                                    <div className="mt-1"><StatusChip status={selectedItineraryItem.status} /></div>
                                </div>
                            </div>

                            {selectedItineraryItem.duration && (
                                <div className="p-3 bg-muted/50 rounded-lg">
                                    <span className="text-xs text-muted-foreground uppercase font-semibold">Duration</span>
                                    <p className="text-sm font-medium flex items-center gap-2 mt-1">
                                        <Clock className="h-4 w-4" /> {selectedItineraryItem.duration}
                                    </p>
                                </div>
                            )}

                            <div className="space-y-2">
                                <h4 className="text-sm font-semibold">Description</h4>
                                <p className="text-sm text-muted-foreground">
                                    {selectedItineraryItem.description || "No description added yet."}
                                </p>
                            </div>

                            {selectedItineraryItem.assignees.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="text-sm font-semibold">Assignees</h4>
                                    <div className="flex gap-2">
                                        {selectedItineraryItem.assignees.map((a, i) => (
                                            <div key={i} className="flex items-center gap-2 bg-muted/50 rounded-full px-3 py-1">
                                                <Avatar className="h-5 w-5">
                                                    <AvatarFallback className="text-[9px] bg-primary/10 text-primary">{a}</AvatarFallback>
                                                </Avatar>
                                                <span className="text-sm">{a === "C" ? "Camille" : a === "M" ? "Miguel" : a}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <Separator />

                            <div className="space-y-2">
                                <h4 className="text-sm font-semibold flex items-center gap-2">
                                    <FileText className="h-4 w-4" /> Files & Links
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    <Badge variant="secondary" className="cursor-pointer hover:bg-muted">
                                        <FileText className="h-3 w-3 mr-1" />
                                        flight_confirm.pdf
                                    </Badge>
                                    <Badge variant="secondary" className="cursor-pointer hover:bg-muted">
                                        <FileText className="h-3 w-3 mr-1" />
                                        boarding_pass.pkpass
                                    </Badge>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h4 className="text-sm font-semibold flex items-center gap-2">
                                    <Link2 className="h-4 w-4" /> Related Items
                                </h4>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg hover:bg-muted/50 cursor-pointer transition">
                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">Narita Airport</span>
                                        <Badge variant="outline" className="ml-auto text-[10px]">Place</Badge>
                                    </div>
                                    <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg hover:bg-muted/50 cursor-pointer transition">
                                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">Travel Notes</span>
                                        <Badge variant="outline" className="ml-auto text-[10px]">Note</Badge>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}

function StatusChip({ status }: { status: string }) {
    const styles: Record<string, string> = {
        confirmed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
        booked: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
        pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
        idea: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
        info: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
    }
    return (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${styles[status] || styles.info}`}>
            {status}
        </span>
    )
}
