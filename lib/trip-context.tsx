"use client";

import * as React from "react";
import { useItineraryRealtime, useActivitiesRealtime, useMapPinsRealtime, type DaySchedule, type ItineraryItemWithMeta } from "./supabase-hooks";
import { isSupabaseConfigured } from "./supabase";

// Trip Context
interface TripContextType {
    tripId: string | null;
    setTripId: (id: string | null) => void;
    isSupabaseEnabled: boolean;
    
    // Itinerary
    itinerary: DaySchedule[];
    itineraryLoading: boolean;
    addItineraryItem: (dayId: string, item: Partial<ItineraryItemWithMeta>) => Promise<unknown>;
    updateItineraryItem: (itemId: string, updates: Partial<ItineraryItemWithMeta>) => Promise<unknown>;
    deleteItineraryItem: (itemId: string) => Promise<void>;
    getDayByDate: (dateStr: string) => unknown;
    getDayByLabel: (label: string) => unknown;
    
    // Activities
    activities: Array<{
        id: string;
        user: string;
        action: string;
        target: string;
        time: string;
        timestamp: Date;
    }>;
    activitiesLoading: boolean;
    addActivity: (activity: { user_name: string; action: string; target: string }) => Promise<void>;
    
    // Map Pins
    mapPins: Array<{
        id: string;
        name: string;
        location: string;
        lat: number;
        lng: number;
        type: string;
        day?: string;
        notes?: string;
        linkedItemId?: string;
    }>;
    mapPinsLoading: boolean;
    
    // Helper to get full itinerary data for AI
    getItineraryForAI: () => string;
}

const TripContext = React.createContext<TripContextType | null>(null);

export function TripProvider({ children }: { children: React.ReactNode }) {
    const [tripId, setTripId] = React.useState<string | null>(() => {
        if (typeof window !== 'undefined') {
            return process.env.NEXT_PUBLIC_DEFAULT_TRIP_ID || null;
        }
        return null;
    });
    
    const isSupabaseEnabled = isSupabaseConfigured();
    
    const {
        itinerary,
        loading: itineraryLoading,
        addItem,
        updateItem,
        deleteItem,
        getDayByDate,
        getDayByLabel,
    } = useItineraryRealtime(isSupabaseEnabled ? tripId : null);
    
    const {
        activities,
        loading: activitiesLoading,
        addActivity,
    } = useActivitiesRealtime(isSupabaseEnabled ? tripId : null);
    
    const {
        mapPins,
        loading: mapPinsLoading,
    } = useMapPinsRealtime(isSupabaseEnabled ? tripId : null);
    
    // Helper function to format itinerary for AI context
    const getItineraryForAI = React.useCallback(() => {
        if (!itinerary.length) return "No itinerary data available.";
        
        return itinerary.map(day => {
            const itemsList = day.items.length > 0
                ? day.items.map(item => 
                    `  - ${item.time}: ${item.title} (${item.type}) at ${item.location} [${item.status}]${item.description ? ` - ${item.description}` : ''}`
                ).join('\n')
                : '  No items scheduled';
            
            return `${day.day} (${day.date}) - ${day.location}:\n${itemsList}`;
        }).join('\n\n');
    }, [itinerary]);
    
    const value: TripContextType = React.useMemo(() => ({
        tripId,
        setTripId,
        isSupabaseEnabled,
        itinerary,
        itineraryLoading,
        addItineraryItem: addItem,
        updateItineraryItem: updateItem,
        deleteItineraryItem: deleteItem,
        getDayByDate,
        getDayByLabel,
        activities,
        activitiesLoading,
        addActivity,
        mapPins,
        mapPinsLoading,
        getItineraryForAI,
    }), [
        tripId,
        isSupabaseEnabled,
        itinerary,
        itineraryLoading,
        addItem,
        updateItem,
        deleteItem,
        getDayByDate,
        getDayByLabel,
        activities,
        activitiesLoading,
        addActivity,
        mapPins,
        mapPinsLoading,
        getItineraryForAI,
    ]);
    
    return (
        <TripContext.Provider value={value}>
            {children}
        </TripContext.Provider>
    );
}

export function useTripContext() {
    const context = React.useContext(TripContext);
    if (!context) {
        throw new Error("useTripContext must be used within TripProvider");
    }
    return context;
}
