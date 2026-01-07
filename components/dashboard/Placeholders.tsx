"use client";

import dynamic from "next/dynamic";
import { useMapPins, usePlaces } from "@/lib/store";
import { Loader2 } from "lucide-react";

// Dynamically import TripMap to avoid SSR issues with Leaflet
const TripMap = dynamic(() => import("./TripMap").then(mod => ({ default: mod.TripMap })), {
    ssr: false,
    loading: () => (
        <div className="h-[600px] w-full bg-muted/20 rounded-xl flex items-center justify-center border">
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="text-sm">Loading map...</p>
            </div>
        </div>
    ),
});

export function MapTab() {
    const { mapPins, addMapPin, updateMapPin, deleteMapPin } = useMapPins();

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold">Trip Map</h2>
                    <p className="text-sm text-muted-foreground">
                        View and manage all locations for your trip. Click "Add Pin" then click on the map to add a new location.
                    </p>
                </div>
            </div>
            <TripMap
                pins={mapPins}
                onAddPin={addMapPin}
                onUpdatePin={updateMapPin}
                onDeletePin={deleteMapPin}
                editable={true}
            />
        </div>
    );
}

// Export the new CalendarTab from its own file
export { CalendarTab } from "./CalendarTab";

// Export the new NotesTab from its own file
// Note: This is a wrapper that uses default data - full implementation in NotesTab.tsx
export { NotesTab } from "./NotesTab";

// Export the new BudgetTab from its own file
export { BudgetTab } from "./BudgetTab";

// Export the new FilesTab from its own file
export { FilesTab } from "./FilesTab";
