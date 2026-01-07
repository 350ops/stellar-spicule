"use client";

import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OverviewTab } from "./OverviewTab";
import { ItineraryTab } from "./ItineraryTab";
import { BudgetTab, CalendarTab, FilesTab, MapTab, NotesTab } from "./Placeholders";
import { SettingsTab } from "./SettingsTab";
import { useUIState } from "@/lib/store";

export function TripTabs() {
    const { activeTab, setActiveTab } = useUIState();

    return (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
            <div className="flex items-center justify-between">
                <TabsList className="h-10 p-1 bg-muted/50">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
                    <TabsTrigger value="map">Map</TabsTrigger>
                    <TabsTrigger value="calendar">Calendar</TabsTrigger>
                    <TabsTrigger value="notes">Notes</TabsTrigger>
                    <TabsTrigger value="budget">Budget</TabsTrigger>
                    <TabsTrigger value="files">Files</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>
            </div>

            <TabsContent value="overview" className="animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
                <OverviewTab />
            </TabsContent>

            <TabsContent value="itinerary" className="animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
                <ItineraryTab />
            </TabsContent>

            <TabsContent value="map" className="animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
                <MapTab />
            </TabsContent>

            <TabsContent value="calendar" className="animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
                <CalendarTab />
            </TabsContent>

            <TabsContent value="notes" className="animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
                <NotesTab />
            </TabsContent>

            <TabsContent value="budget" className="animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
                <BudgetTab />
            </TabsContent>

            <TabsContent value="files" className="animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
                <FilesTab />
            </TabsContent>

            <TabsContent value="settings" className="animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
                <SettingsTab />
            </TabsContent>
        </Tabs>
    );
}
