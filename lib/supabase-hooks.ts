"use client";

import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase, isSupabaseConfigured } from './supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface TripDay {
    id: string;
    trip_id: string;
    date: string;
    day_label: string;
    location: string | null;
    day_order: number;
    created_at: string;
}

interface ItineraryItemDB {
    id: string;
    trip_id: string;
    day_id: string;
    time: string;
    title: string;
    type: string;
    location: string;
    status: string;
    assignees: string[];
    duration: string | null;
    description: string | null;
    confirmation_number: string | null;
    carrier: string | null;
    flight_number: string | null;
    departure_time: string | null;
    arrival_time: string | null;
    departure_location: string | null;
    arrival_location: string | null;
    seat_class: string | null;
    price: string | null;
    booking_url: string | null;
    notes: string | null;
    item_order: number;
    created_at: string;
    updated_at: string;
}

interface Activity {
    id: string;
    trip_id: string;
    user_name: string;
    action: string;
    target: string;
    created_at: string;
}

interface MapPinDB {
    id: string;
    trip_id: string;
    name: string;
    location: string;
    lat: number;
    lng: number;
    type: string;
    day: string | null;
    notes: string | null;
    linked_item_id: string | null;
    created_at: string;
}

export interface DaySchedule {
    id: string;
    date: string;
    day: string;
    location: string;
    items: ItineraryItemWithMeta[];
    empty?: boolean;
}

export interface ItineraryItemWithMeta {
    id: string;
    time: string;
    title: string;
    type: string;
    location: string;
    status: string;
    assignees: string[];
    duration?: string | null;
    description?: string | null;
    confirmationNumber?: string;
    carrier?: string | null;
    flightNumber?: string;
    departureTime?: string;
    arrivalTime?: string;
    departureLocation?: string;
    arrivalLocation?: string;
    seatClass?: string;
    price?: string | null;
    bookingUrl?: string;
    notes?: string | null;
    day?: string;
    date?: string;
}

// Transform database item to app format
function transformItem(item: ItineraryItemDB, day?: TripDay): ItineraryItemWithMeta {
    return {
        id: item.id,
        time: item.time,
        title: item.title,
        type: item.type,
        location: item.location,
        status: item.status,
        assignees: item.assignees || [],
        duration: item.duration,
        description: item.description,
        confirmationNumber: item.confirmation_number || undefined,
        carrier: item.carrier,
        flightNumber: item.flight_number || undefined,
        departureTime: item.departure_time || undefined,
        arrivalTime: item.arrival_time || undefined,
        departureLocation: item.departure_location || undefined,
        arrivalLocation: item.arrival_location || undefined,
        seatClass: item.seat_class || undefined,
        price: item.price,
        bookingUrl: item.booking_url || undefined,
        notes: item.notes,
        day: day?.day_label,
        date: day?.date,
    };
}

// Transform app format to database format
function transformToDbItem(item: Partial<ItineraryItemWithMeta>): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    
    if (item.time !== undefined) result.time = item.time;
    if (item.title !== undefined) result.title = item.title;
    if (item.type !== undefined) result.type = item.type;
    if (item.location !== undefined) result.location = item.location;
    if (item.status !== undefined) result.status = item.status;
    if (item.assignees !== undefined) result.assignees = item.assignees;
    if (item.duration !== undefined) result.duration = item.duration;
    if (item.description !== undefined) result.description = item.description;
    if (item.confirmationNumber !== undefined) result.confirmation_number = item.confirmationNumber;
    if (item.carrier !== undefined) result.carrier = item.carrier;
    if (item.flightNumber !== undefined) result.flight_number = item.flightNumber;
    if (item.departureTime !== undefined) result.departure_time = item.departureTime;
    if (item.arrivalTime !== undefined) result.arrival_time = item.arrivalTime;
    if (item.departureLocation !== undefined) result.departure_location = item.departureLocation;
    if (item.arrivalLocation !== undefined) result.arrival_location = item.arrivalLocation;
    if (item.seatClass !== undefined) result.seat_class = item.seatClass;
    if (item.price !== undefined) result.price = item.price;
    if (item.bookingUrl !== undefined) result.booking_url = item.bookingUrl;
    if (item.notes !== undefined) result.notes = item.notes;
    
    return result;
}

export function useItineraryRealtime(tripId: string | null) {
    const [days, setDays] = useState<TripDay[]>([]);
    const [items, setItems] = useState<ItineraryItemDB[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const channelRef = useRef<RealtimeChannel | null>(null);

    // Fetch initial data
    useEffect(() => {
        if (!tripId || !supabase || !isSupabaseConfigured()) {
            setLoading(false);
            return;
        }

        async function fetchData() {
            if (!supabase) return;
            
            try {
                setLoading(true);

                // Fetch days
                const { data: daysData, error: daysError } = await supabase
                    .from('trip_days')
                    .select('*')
                    .eq('trip_id', tripId)
                    .order('day_order', { ascending: true });

                if (daysError) throw daysError;

                // Fetch items
                const { data: itemsData, error: itemsError } = await supabase
                    .from('itinerary_items')
                    .select('*')
                    .eq('trip_id', tripId)
                    .order('item_order', { ascending: true });

                if (itemsError) throw itemsError;

                setDays((daysData as TripDay[]) || []);
                setItems((itemsData as ItineraryItemDB[]) || []);
            } catch (e) {
                setError(e as Error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [tripId]);

    // Set up real-time subscription
    useEffect(() => {
        if (!tripId || !supabase || !isSupabaseConfigured()) return;

        // Clean up existing channel
        if (channelRef.current) {
            supabase.removeChannel(channelRef.current);
        }

        const channel = supabase
            .channel(`trip-${tripId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'itinerary_items',
                    filter: `trip_id=eq.${tripId}`,
                },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setItems((prev) => [...prev, payload.new as ItineraryItemDB]);
                    } else if (payload.eventType === 'UPDATE') {
                        setItems((prev) =>
                            prev.map((item) =>
                                item.id === (payload.new as ItineraryItemDB).id ? (payload.new as ItineraryItemDB) : item
                            )
                        );
                    } else if (payload.eventType === 'DELETE') {
                        setItems((prev) => prev.filter((item) => item.id !== (payload.old as { id: string }).id));
                    }
                }
            )
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'trip_days',
                    filter: `trip_id=eq.${tripId}`,
                },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setDays((prev) => [...prev, payload.new as TripDay].sort((a, b) => a.day_order - b.day_order));
                    } else if (payload.eventType === 'UPDATE') {
                        setDays((prev) =>
                            prev.map((day) =>
                                day.id === (payload.new as TripDay).id ? (payload.new as TripDay) : day
                            ).sort((a, b) => a.day_order - b.day_order)
                        );
                    } else if (payload.eventType === 'DELETE') {
                        setDays((prev) => prev.filter((day) => day.id !== (payload.old as { id: string }).id));
                    }
                }
            )
            .subscribe();

        channelRef.current = channel;

        return () => {
            if (channelRef.current && supabase) {
                supabase.removeChannel(channelRef.current);
            }
        };
    }, [tripId]);

    // Transform to app format
    const itinerary: DaySchedule[] = days.map((day) => {
        const dayItems = items
            .filter((item) => item.day_id === day.id)
            .sort((a, b) => a.item_order - b.item_order)
            .map((item) => transformItem(item, day));

        return {
            id: day.id,
            date: day.date,
            day: day.day_label,
            location: day.location || '',
            items: dayItems,
            empty: dayItems.length === 0,
        };
    });

    // CRUD operations
    const addItem = useCallback(async (dayId: string, item: Partial<ItineraryItemWithMeta>) => {
        if (!tripId || !supabase) return null;

        const maxOrder = items
            .filter((i) => i.day_id === dayId)
            .reduce((max, i) => Math.max(max, i.item_order), -1);

        const dbItem = {
            ...transformToDbItem(item),
            trip_id: tripId,
            day_id: dayId,
            item_order: maxOrder + 1,
        };

        const { data, error } = await supabase
            .from('itinerary_items')
            .insert(dbItem)
            .select()
            .single();

        if (error) {
            console.error('Error adding item:', error);
            throw error;
        }

        return data;
    }, [tripId, items]);

    const updateItem = useCallback(async (itemId: string, updates: Partial<ItineraryItemWithMeta>) => {
        if (!supabase) return null;
        
        const dbUpdates = transformToDbItem(updates);

        const { data, error } = await supabase
            .from('itinerary_items')
            .update(dbUpdates)
            .eq('id', itemId)
            .select()
            .single();

        if (error) {
            console.error('Error updating item:', error);
            throw error;
        }

        return data;
    }, []);

    const deleteItem = useCallback(async (itemId: string) => {
        if (!supabase) return;
        
        const { error } = await supabase
            .from('itinerary_items')
            .delete()
            .eq('id', itemId);

        if (error) {
            console.error('Error deleting item:', error);
            throw error;
        }
    }, []);

    const getDayByDate = useCallback((dateStr: string): TripDay | undefined => {
        return days.find((day) => {
            const dayDate = day.date.toLowerCase();
            const searchDate = dateStr.toLowerCase();
            return dayDate.includes(searchDate) || searchDate.includes(dayDate);
        });
    }, [days]);

    const getDayByLabel = useCallback((label: string): TripDay | undefined => {
        return days.find((day) => {
            const dayLabel = day.day_label.toLowerCase();
            const searchLabel = label.toLowerCase();
            return dayLabel.includes(searchLabel) || searchLabel.includes(dayLabel);
        });
    }, [days]);

    return {
        itinerary,
        days,
        items,
        loading,
        error,
        addItem,
        updateItem,
        deleteItem,
        getDayByDate,
        getDayByLabel,
    };
}

export function useActivitiesRealtime(tripId: string | null) {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const channelRef = useRef<RealtimeChannel | null>(null);

    useEffect(() => {
        if (!tripId || !supabase || !isSupabaseConfigured()) {
            setLoading(false);
            return;
        }

        async function fetchActivities() {
            if (!supabase) return;
            
            const { data, error } = await supabase
                .from('activities')
                .select('*')
                .eq('trip_id', tripId)
                .order('created_at', { ascending: false })
                .limit(50);

            if (!error && data) {
                setActivities(data as Activity[]);
            }
            setLoading(false);
        }

        fetchActivities();
    }, [tripId]);

    useEffect(() => {
        if (!tripId || !supabase || !isSupabaseConfigured()) return;

        if (channelRef.current) {
            supabase.removeChannel(channelRef.current);
        }

        const channel = supabase
            .channel(`activities-${tripId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'activities',
                    filter: `trip_id=eq.${tripId}`,
                },
                (payload) => {
                    setActivities((prev) => [payload.new as Activity, ...prev].slice(0, 50));
                }
            )
            .subscribe();

        channelRef.current = channel;

        return () => {
            if (channelRef.current && supabase) {
                supabase.removeChannel(channelRef.current);
            }
        };
    }, [tripId]);

    const addActivity = useCallback(async (activity: { user_name: string; action: string; target: string }) => {
        if (!tripId || !supabase) return;

        await supabase.from('activities').insert({
            trip_id: tripId,
            ...activity,
        });
    }, [tripId]);

    // Transform to app format
    const formattedActivities = activities.map((a) => ({
        id: a.id,
        user: a.user_name,
        action: a.action,
        target: a.target,
        time: formatTimeAgo(new Date(a.created_at)),
        timestamp: new Date(a.created_at),
    }));

    return { activities: formattedActivities, loading, addActivity };
}

function formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
}

export function useMapPinsRealtime(tripId: string | null) {
    const [pins, setPins] = useState<MapPinDB[]>([]);
    const [loading, setLoading] = useState(true);
    const channelRef = useRef<RealtimeChannel | null>(null);

    useEffect(() => {
        if (!tripId || !supabase || !isSupabaseConfigured()) {
            setLoading(false);
            return;
        }

        async function fetchPins() {
            if (!supabase) return;
            
            const { data, error } = await supabase
                .from('map_pins')
                .select('*')
                .eq('trip_id', tripId);

            if (!error && data) {
                setPins(data as MapPinDB[]);
            }
            setLoading(false);
        }

        fetchPins();
    }, [tripId]);

    useEffect(() => {
        if (!tripId || !supabase || !isSupabaseConfigured()) return;

        if (channelRef.current) {
            supabase.removeChannel(channelRef.current);
        }

        const channel = supabase
            .channel(`pins-${tripId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'map_pins',
                    filter: `trip_id=eq.${tripId}`,
                },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setPins((prev) => [...prev, payload.new as MapPinDB]);
                    } else if (payload.eventType === 'UPDATE') {
                        setPins((prev) =>
                            prev.map((pin) =>
                                pin.id === (payload.new as MapPinDB).id ? (payload.new as MapPinDB) : pin
                            )
                        );
                    } else if (payload.eventType === 'DELETE') {
                        setPins((prev) => prev.filter((pin) => pin.id !== (payload.old as { id: string }).id));
                    }
                }
            )
            .subscribe();

        channelRef.current = channel;

        return () => {
            if (channelRef.current && supabase) {
                supabase.removeChannel(channelRef.current);
            }
        };
    }, [tripId]);

    // Transform to app format
    const formattedPins = pins.map((p) => ({
        id: p.id,
        name: p.name,
        location: p.location,
        lat: p.lat,
        lng: p.lng,
        type: p.type,
        day: p.day || undefined,
        notes: p.notes || undefined,
        linkedItemId: p.linked_item_id || undefined,
    }));

    return { mapPins: formattedPins, loading };
}
