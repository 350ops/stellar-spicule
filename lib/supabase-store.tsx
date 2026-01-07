"use client";

import * as React from "react";
import {
    supabase,
    getFullTripData,
    createItineraryItem as dbCreateItem,
    updateItineraryItem as dbUpdateItem,
    deleteItineraryItem as dbDeleteItem,
    createActivity as dbCreateActivity,
    createMapPin as dbCreateMapPin,
    updateMapPin as dbUpdateMapPin,
    deleteMapPin as dbDeleteMapPin,
    getDayByLabel,
    getDayByDate,
    type DbItineraryItem,
    type DbActivity,
    type DbMapPin,
    type DbDay,
    type FullTripData,
} from "./supabase";

// Default trip ID - in production, this would come from URL params or user selection
export const DEFAULT_TRIP_ID = "550e8400-e29b-41d4-a716-446655440000";

// ============================================
// Types (matching the original store)
// ============================================
export const ITEM_TYPES = [
    { value: "Flight", label: "Flight", icon: "Plane" },
    { value: "Train", label: "Train", icon: "Train" },
    { value: "Bus", label: "Bus", icon: "Bus" },
    { value: "Ferry", label: "Ferry", icon: "Ship" },
    { value: "RentalCar", label: "Rental Car", icon: "Car" },
    { value: "Taxi", label: "Taxi/Rideshare", icon: "Car" },
    { value: "Hotel", label: "Hotel", icon: "Hotel" },
    { value: "Airbnb", label: "Airbnb/Rental", icon: "Home" },
    { value: "Food", label: "Restaurant/Food", icon: "Utensils" },
    { value: "Activity", label: "Activity", icon: "Ticket" },
    { value: "Sightseeing", label: "Sightseeing", icon: "Camera" },
    { value: "Arrival", label: "Arrival", icon: "PlaneLanding" },
    { value: "Departure", label: "Departure", icon: "PlaneTakeoff" },
    { value: "Transfer", label: "Transfer", icon: "ArrowLeftRight" },
    { value: "Meeting", label: "Meeting Point", icon: "Users" },
    { value: "Other", label: "Other", icon: "MapPin" },
] as const;

export const ITEM_STATUSES = [
    { value: "confirmed", label: "Confirmed", color: "green" },
    { value: "booked", label: "Booked", color: "blue" },
    { value: "pending", label: "Pending", color: "yellow" },
    { value: "idea", label: "Idea", color: "orange" },
    { value: "info", label: "Info", color: "gray" },
] as const;

export type ItemType = typeof ITEM_TYPES[number]["value"];
export type ItemStatus = typeof ITEM_STATUSES[number]["value"];

export interface ItineraryItem {
    id: string;
    dayId: string;
    time: string;
    title: string;
    type: ItemType | string;
    location: string;
    status: ItemStatus;
    assignees: string[];
    duration?: string;
    description?: string;
    day?: string;
    date?: string;
    confirmationNumber?: string;
    carrier?: string;
    flightNumber?: string;
    departureTime?: string;
    arrivalTime?: string;
    departureLocation?: string;
    arrivalLocation?: string;
    seatClass?: string;
    price?: string;
    bookingUrl?: string;
    notes?: string;
}

export interface DaySchedule {
    id: string;
    date: string;
    day: string;
    location: string;
    items: ItineraryItem[];
    empty?: boolean;
}

export interface Place {
    id: string;
    name: string;
    location: string;
    image: string;
    tag: string;
    notes?: string;
}

export interface ActivityItem {
    id: string;
    user: string;
    action: string;
    target: string;
    time: string;
    timestamp: Date;
}

export interface MapPin {
    id: string;
    name: string;
    location: string;
    lat: number;
    lng: number;
    type: string;
    day?: string;
    notes?: string;
    linkedItemId?: string;
}

export interface Workspace {
    id: string;
    name: string;
    icon: string;
}

export interface EditModalState {
    isOpen: boolean;
    mode: "create" | "edit";
    item: Partial<ItineraryItem> | null;
    dayIndex: number | null;
}

// ============================================
// Helper functions to convert DB types to UI types
// ============================================
function dbItemToUiItem(dbItem: DbItineraryItem, day?: DbDay): ItineraryItem {
    return {
        id: dbItem.id,
        dayId: dbItem.day_id,
        time: dbItem.time,
        title: dbItem.title,
        type: dbItem.type as ItemType,
        location: dbItem.location || "",
        status: dbItem.status as ItemStatus,
        assignees: dbItem.assignees || [],
        duration: dbItem.duration || undefined,
        description: dbItem.description || undefined,
        day: day?.day_label,
        date: day?.date ? formatDate(day.date) : undefined,
        confirmationNumber: dbItem.confirmation_number || undefined,
        carrier: dbItem.carrier || undefined,
        flightNumber: dbItem.flight_number || undefined,
        departureTime: dbItem.departure_time || undefined,
        arrivalTime: dbItem.arrival_time || undefined,
        departureLocation: dbItem.departure_location || undefined,
        arrivalLocation: dbItem.arrival_location || undefined,
        seatClass: dbItem.seat_class || undefined,
        price: dbItem.price || undefined,
        bookingUrl: dbItem.booking_url || undefined,
        notes: dbItem.notes || undefined,
    };
}

function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
}

function dbActivityToUiActivity(dbActivity: DbActivity): ActivityItem {
    const timestamp = new Date(dbActivity.created_at);
    return {
        id: dbActivity.id,
        user: dbActivity.user_name,
        action: dbActivity.action,
        target: dbActivity.target,
        time: formatRelativeTime(timestamp),
        timestamp,
    };
}

// ============================================
// State types
// ============================================
interface AppState {
    // Loading & Error
    isLoading: boolean;
    error: string | null;
    tripId: string;

    // UI State
    isSidebarCollapsed: boolean;
    isRightPanelOpen: boolean;
    isCommandPaletteOpen: boolean;
    activeTab: string;
    selectedItineraryItem: ItineraryItem | null;
    editModal: EditModalState;

    // Workspace
    currentWorkspace: Workspace;
    workspaces: Workspace[];

    // Trip Data (from Supabase)
    itinerary: DaySchedule[];
    places: Place[];
    mapPins: MapPin[];
    activities: ActivityItem[];

    // Days lookup for quick access
    daysMap: Map<string, DbDay>;
}

interface AppActions {
    // Data Loading
    loadTripData: (tripId?: string) => Promise<void>;

    // UI Actions
    toggleSidebar: () => void;
    setSidebarCollapsed: (collapsed: boolean) => void;
    toggleRightPanel: () => void;
    setRightPanelOpen: (open: boolean) => void;
    setCommandPaletteOpen: (open: boolean) => void;
    setActiveTab: (tab: string) => void;
    setSelectedItineraryItem: (item: ItineraryItem | null) => void;

    // Edit Modal Actions
    openEditModal: (mode: "create" | "edit", dayIndex: number, item?: ItineraryItem) => void;
    closeEditModal: () => void;

    // Workspace Actions
    setCurrentWorkspace: (workspace: Workspace) => void;

    // Activity Actions
    addActivity: (activity: Omit<ActivityItem, "id" | "timestamp">) => Promise<void>;

    // Itinerary Actions (now async, hitting Supabase)
    addItineraryItem: (dayIndex: number, item: Omit<ItineraryItem, "id" | "dayId">) => Promise<void>;
    updateItineraryItem: (itemId: string, updates: Partial<ItineraryItem>) => Promise<void>;
    deleteItineraryItem: (itemId: string) => Promise<void>;

    // Map Pin Actions
    addMapPin: (pin: Omit<MapPin, "id">) => Promise<void>;
    updateMapPin: (id: string, updates: Partial<MapPin>) => Promise<void>;
    deleteMapPin: (id: string) => Promise<void>;

    // Real-time handlers
    handleItemInsert: (dbItem: DbItineraryItem) => void;
    handleItemUpdate: (dbItem: DbItineraryItem) => void;
    handleItemDelete: (itemId: string) => void;
    handleActivityInsert: (dbActivity: DbActivity) => void;
}

type AppStore = AppState & AppActions;

// Initial Data
const initialWorkspaces: Workspace[] = [
    { id: "personal", name: "Personal", icon: "P" },
    { id: "family", name: "Family", icon: "F" },
    { id: "work", name: "Work", icon: "W" },
];

// Context
const AppContext = React.createContext<AppStore | null>(null);

// Provider
export function SupabaseAppProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = React.useState<AppState>({
        isLoading: true,
        error: null,
        tripId: DEFAULT_TRIP_ID,
        isSidebarCollapsed: false,
        isRightPanelOpen: true,
        isCommandPaletteOpen: false,
        activeTab: "overview",
        selectedItineraryItem: null,
        editModal: {
            isOpen: false,
            mode: "create",
            item: null,
            dayIndex: null,
        },
        currentWorkspace: initialWorkspaces[0],
        workspaces: initialWorkspaces,
        itinerary: [],
        places: [],
        mapPins: [],
        activities: [],
        daysMap: new Map(),
    });

    // Load trip data from Supabase
    const loadTripData = React.useCallback(async (tripId?: string) => {
        const id = tripId || state.tripId;
        setState(s => ({ ...s, isLoading: true, error: null }));

        try {
            const data: FullTripData = await getFullTripData(id);

            // Build days map
            const daysMap = new Map<string, DbDay>();
            data.days.forEach(day => daysMap.set(day.id, day));

            // Convert to UI format
            const itinerary: DaySchedule[] = data.days.map(day => ({
                id: day.id,
                date: formatDate(day.date),
                day: day.day_label,
                location: day.location || "",
                items: day.items.map(item => dbItemToUiItem(item, day)),
                empty: day.items.length === 0,
            }));

            const places: Place[] = data.places.map(p => ({
                id: p.id,
                name: p.name,
                location: p.location || "",
                image: p.image || "",
                tag: p.tag || "",
                notes: p.notes || undefined,
            }));

            const mapPins: MapPin[] = data.mapPins.map(p => ({
                id: p.id,
                name: p.name,
                location: p.location || "",
                lat: p.lat,
                lng: p.lng,
                type: p.type || "",
                day: p.day_label || undefined,
                notes: p.notes || undefined,
                linkedItemId: p.linked_item_id || undefined,
            }));

            const activities: ActivityItem[] = data.activities.map(dbActivityToUiActivity);

            setState(s => ({
                ...s,
                isLoading: false,
                tripId: id,
                itinerary,
                places,
                mapPins,
                activities,
                daysMap,
            }));
        } catch (err) {
            console.error("Failed to load trip data:", err);
            setState(s => ({
                ...s,
                isLoading: false,
                error: err instanceof Error ? err.message : "Failed to load trip data",
            }));
        }
    }, [state.tripId]);

    // Set up real-time subscriptions
    React.useEffect(() => {
        if (!state.tripId || state.isLoading) return;

        // Subscribe to itinerary changes
        const itineraryChannel = supabase
            .channel(`itinerary-${state.tripId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'itinerary_items',
                    filter: `trip_id=eq.${state.tripId}`,
                },
                (payload) => {
                    const dbItem = payload.new as DbItineraryItem;
                    setState(s => {
                        const day = s.daysMap.get(dbItem.day_id);
                        const uiItem = dbItemToUiItem(dbItem, day);

                        const newItinerary = s.itinerary.map(d => {
                            if (d.id === dbItem.day_id) {
                                // Check if item already exists (avoid duplicates)
                                if (d.items.some(i => i.id === uiItem.id)) {
                                    return d;
                                }
                                return {
                                    ...d,
                                    items: [...d.items, uiItem].sort((a, b) => {
                                        // Sort by time
                                        return a.time.localeCompare(b.time);
                                    }),
                                    empty: false,
                                };
                            }
                            return d;
                        });

                        return { ...s, itinerary: newItinerary };
                    });
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'itinerary_items',
                    filter: `trip_id=eq.${state.tripId}`,
                },
                (payload) => {
                    const dbItem = payload.new as DbItineraryItem;
                    setState(s => {
                        const day = s.daysMap.get(dbItem.day_id);
                        const uiItem = dbItemToUiItem(dbItem, day);

                        const newItinerary = s.itinerary.map(d => ({
                            ...d,
                            items: d.items.map(i => i.id === uiItem.id ? uiItem : i),
                        }));

                        // Update selected item if it's the same
                        const newSelectedItem = s.selectedItineraryItem?.id === uiItem.id
                            ? uiItem
                            : s.selectedItineraryItem;

                        return { ...s, itinerary: newItinerary, selectedItineraryItem: newSelectedItem };
                    });
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'DELETE',
                    schema: 'public',
                    table: 'itinerary_items',
                    filter: `trip_id=eq.${state.tripId}`,
                },
                (payload) => {
                    const itemId = payload.old.id as string;
                    setState(s => {
                        const newItinerary = s.itinerary.map(d => {
                            const filteredItems = d.items.filter(i => i.id !== itemId);
                            return {
                                ...d,
                                items: filteredItems,
                                empty: filteredItems.length === 0,
                            };
                        });

                        return {
                            ...s,
                            itinerary: newItinerary,
                            selectedItineraryItem: s.selectedItineraryItem?.id === itemId ? null : s.selectedItineraryItem,
                        };
                    });
                }
            )
            .subscribe();

        // Subscribe to activity changes
        const activityChannel = supabase
            .channel(`activities-${state.tripId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'activities',
                    filter: `trip_id=eq.${state.tripId}`,
                },
                (payload) => {
                    const dbActivity = payload.new as DbActivity;
                    setState(s => {
                        const uiActivity = dbActivityToUiActivity(dbActivity);
                        // Avoid duplicates
                        if (s.activities.some(a => a.id === uiActivity.id)) {
                            return s;
                        }
                        return {
                            ...s,
                            activities: [uiActivity, ...s.activities].slice(0, 50),
                        };
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(itineraryChannel);
            supabase.removeChannel(activityChannel);
        };
    }, [state.tripId, state.isLoading]);

    // Load data on mount
    React.useEffect(() => {
        loadTripData();
    }, []);

    const actions: AppActions = React.useMemo(() => ({
        loadTripData,

        toggleSidebar: () => setState(s => ({ ...s, isSidebarCollapsed: !s.isSidebarCollapsed })),
        setSidebarCollapsed: (collapsed) => setState(s => ({ ...s, isSidebarCollapsed: collapsed })),
        toggleRightPanel: () => setState(s => ({ ...s, isRightPanelOpen: !s.isRightPanelOpen })),
        setRightPanelOpen: (open) => setState(s => ({ ...s, isRightPanelOpen: open })),
        setCommandPaletteOpen: (open) => setState(s => ({ ...s, isCommandPaletteOpen: open })),
        setActiveTab: (tab) => setState(s => ({ ...s, activeTab: tab })),
        setSelectedItineraryItem: (item) => setState(s => ({ ...s, selectedItineraryItem: item })),

        openEditModal: (mode, dayIndex, item) => setState(s => ({
            ...s,
            editModal: {
                isOpen: true,
                mode,
                item: item || null,
                dayIndex,
            },
        })),
        closeEditModal: () => setState(s => ({
            ...s,
            editModal: {
                isOpen: false,
                mode: "create",
                item: null,
                dayIndex: null,
            },
        })),

        setCurrentWorkspace: (workspace) => setState(s => ({ ...s, currentWorkspace: workspace })),

        addActivity: async (activity) => {
            try {
                await dbCreateActivity({
                    trip_id: state.tripId,
                    user_name: activity.user,
                    action: activity.action,
                    target: activity.target,
                });
            } catch (err) {
                console.error("Failed to add activity:", err);
            }
        },

        addItineraryItem: async (dayIndex, item) => {
            try {
                const day = state.itinerary[dayIndex];
                if (!day) throw new Error("Day not found");

                // Get the max sort order for this day
                const maxSortOrder = day.items.length > 0
                    ? Math.max(...day.items.map((_, i) => i)) + 1
                    : 0;

                await dbCreateItem({
                    day_id: day.id,
                    trip_id: state.tripId,
                    time: item.time,
                    title: item.title,
                    type: item.type,
                    location: item.location || null,
                    status: item.status || "idea",
                    duration: item.duration || null,
                    description: item.description || null,
                    assignees: item.assignees || [],
                    confirmation_number: item.confirmationNumber || null,
                    carrier: item.carrier || null,
                    flight_number: item.flightNumber || null,
                    departure_time: item.departureTime || null,
                    arrival_time: item.arrivalTime || null,
                    departure_location: item.departureLocation || null,
                    arrival_location: item.arrivalLocation || null,
                    seat_class: item.seatClass || null,
                    price: item.price || null,
                    booking_url: item.bookingUrl || null,
                    notes: item.notes || null,
                    sort_order: maxSortOrder,
                });

                // Activity will be added via real-time subscription
                await dbCreateActivity({
                    trip_id: state.tripId,
                    user_name: "You",
                    action: "added",
                    target: item.title,
                });
            } catch (err) {
                console.error("Failed to add itinerary item:", err);
                throw err;
            }
        },

        updateItineraryItem: async (itemId, updates) => {
            try {
                const dbUpdates: Partial<DbItineraryItem> = {};
                if (updates.time !== undefined) dbUpdates.time = updates.time;
                if (updates.title !== undefined) dbUpdates.title = updates.title;
                if (updates.type !== undefined) dbUpdates.type = updates.type;
                if (updates.location !== undefined) dbUpdates.location = updates.location;
                if (updates.status !== undefined) dbUpdates.status = updates.status;
                if (updates.duration !== undefined) dbUpdates.duration = updates.duration;
                if (updates.description !== undefined) dbUpdates.description = updates.description;
                if (updates.assignees !== undefined) dbUpdates.assignees = updates.assignees;
                if (updates.confirmationNumber !== undefined) dbUpdates.confirmation_number = updates.confirmationNumber;
                if (updates.carrier !== undefined) dbUpdates.carrier = updates.carrier;
                if (updates.flightNumber !== undefined) dbUpdates.flight_number = updates.flightNumber;
                if (updates.departureTime !== undefined) dbUpdates.departure_time = updates.departureTime;
                if (updates.arrivalTime !== undefined) dbUpdates.arrival_time = updates.arrivalTime;
                if (updates.departureLocation !== undefined) dbUpdates.departure_location = updates.departureLocation;
                if (updates.arrivalLocation !== undefined) dbUpdates.arrival_location = updates.arrivalLocation;
                if (updates.seatClass !== undefined) dbUpdates.seat_class = updates.seatClass;
                if (updates.price !== undefined) dbUpdates.price = updates.price;
                if (updates.bookingUrl !== undefined) dbUpdates.booking_url = updates.bookingUrl;
                if (updates.notes !== undefined) dbUpdates.notes = updates.notes;

                await dbUpdateItem(itemId, dbUpdates);

                // Find the item title for the activity
                let itemTitle = updates.title || "";
                if (!itemTitle) {
                    for (const day of state.itinerary) {
                        const found = day.items.find(i => i.id === itemId);
                        if (found) {
                            itemTitle = found.title;
                            break;
                        }
                    }
                }

                await dbCreateActivity({
                    trip_id: state.tripId,
                    user_name: "You",
                    action: "updated",
                    target: itemTitle,
                });
            } catch (err) {
                console.error("Failed to update itinerary item:", err);
                throw err;
            }
        },

        deleteItineraryItem: async (itemId) => {
            try {
                // Find the item title for the activity
                let itemTitle = "";
                for (const day of state.itinerary) {
                    const found = day.items.find(i => i.id === itemId);
                    if (found) {
                        itemTitle = found.title;
                        break;
                    }
                }

                await dbDeleteItem(itemId);

                await dbCreateActivity({
                    trip_id: state.tripId,
                    user_name: "You",
                    action: "deleted",
                    target: itemTitle,
                });
            } catch (err) {
                console.error("Failed to delete itinerary item:", err);
                throw err;
            }
        },

        addMapPin: async (pin) => {
            try {
                await dbCreateMapPin({
                    trip_id: state.tripId,
                    name: pin.name,
                    location: pin.location || null,
                    lat: pin.lat,
                    lng: pin.lng,
                    type: pin.type || null,
                    day_label: pin.day || null,
                    notes: pin.notes || null,
                    linked_item_id: pin.linkedItemId || null,
                });
            } catch (err) {
                console.error("Failed to add map pin:", err);
                throw err;
            }
        },

        updateMapPin: async (id, updates) => {
            try {
                const dbUpdates: Partial<DbMapPin> = {};
                if (updates.name !== undefined) dbUpdates.name = updates.name;
                if (updates.location !== undefined) dbUpdates.location = updates.location;
                if (updates.lat !== undefined) dbUpdates.lat = updates.lat;
                if (updates.lng !== undefined) dbUpdates.lng = updates.lng;
                if (updates.type !== undefined) dbUpdates.type = updates.type;
                if (updates.day !== undefined) dbUpdates.day_label = updates.day;
                if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
                if (updates.linkedItemId !== undefined) dbUpdates.linked_item_id = updates.linkedItemId;

                await dbUpdateMapPin(id, dbUpdates);
            } catch (err) {
                console.error("Failed to update map pin:", err);
                throw err;
            }
        },

        deleteMapPin: async (id) => {
            try {
                await dbDeleteMapPin(id);
            } catch (err) {
                console.error("Failed to delete map pin:", err);
                throw err;
            }
        },

        // Real-time handlers (called by subscriptions)
        handleItemInsert: (dbItem) => {
            setState(s => {
                const day = s.daysMap.get(dbItem.day_id);
                const uiItem = dbItemToUiItem(dbItem, day);

                const newItinerary = s.itinerary.map(d => {
                    if (d.id === dbItem.day_id) {
                        if (d.items.some(i => i.id === uiItem.id)) return d;
                        return {
                            ...d,
                            items: [...d.items, uiItem],
                            empty: false,
                        };
                    }
                    return d;
                });

                return { ...s, itinerary: newItinerary };
            });
        },

        handleItemUpdate: (dbItem) => {
            setState(s => {
                const day = s.daysMap.get(dbItem.day_id);
                const uiItem = dbItemToUiItem(dbItem, day);

                const newItinerary = s.itinerary.map(d => ({
                    ...d,
                    items: d.items.map(i => i.id === uiItem.id ? uiItem : i),
                }));

                const newSelectedItem = s.selectedItineraryItem?.id === uiItem.id
                    ? uiItem
                    : s.selectedItineraryItem;

                return { ...s, itinerary: newItinerary, selectedItineraryItem: newSelectedItem };
            });
        },

        handleItemDelete: (itemId) => {
            setState(s => {
                const newItinerary = s.itinerary.map(d => {
                    const filteredItems = d.items.filter(i => i.id !== itemId);
                    return {
                        ...d,
                        items: filteredItems,
                        empty: filteredItems.length === 0,
                    };
                });

                return {
                    ...s,
                    itinerary: newItinerary,
                    selectedItineraryItem: s.selectedItineraryItem?.id === itemId ? null : s.selectedItineraryItem,
                };
            });
        },

        handleActivityInsert: (dbActivity) => {
            setState(s => {
                const uiActivity = dbActivityToUiActivity(dbActivity);
                if (s.activities.some(a => a.id === uiActivity.id)) return s;
                return {
                    ...s,
                    activities: [uiActivity, ...s.activities].slice(0, 50),
                };
            });
        },
    }), [state.tripId, state.itinerary, loadTripData]);

    const store = React.useMemo(() => ({ ...state, ...actions }), [state, actions]);

    return <AppContext.Provider value={store}>{children}</AppContext.Provider>;
}

// Hook
export function useSupabaseStore() {
    const context = React.useContext(AppContext);
    if (!context) {
        throw new Error("useSupabaseStore must be used within SupabaseAppProvider");
    }
    return context;
}

// Selector hooks for performance
export function useUIState() {
    const store = useSupabaseStore();
    return {
        isLoading: store.isLoading,
        error: store.error,
        isSidebarCollapsed: store.isSidebarCollapsed,
        isRightPanelOpen: store.isRightPanelOpen,
        isCommandPaletteOpen: store.isCommandPaletteOpen,
        activeTab: store.activeTab,
        selectedItineraryItem: store.selectedItineraryItem,
        toggleSidebar: store.toggleSidebar,
        setSidebarCollapsed: store.setSidebarCollapsed,
        toggleRightPanel: store.toggleRightPanel,
        setRightPanelOpen: store.setRightPanelOpen,
        setCommandPaletteOpen: store.setCommandPaletteOpen,
        setActiveTab: store.setActiveTab,
        setSelectedItineraryItem: store.setSelectedItineraryItem,
    };
}

export function useWorkspace() {
    const store = useSupabaseStore();
    return {
        currentWorkspace: store.currentWorkspace,
        workspaces: store.workspaces,
        setCurrentWorkspace: store.setCurrentWorkspace,
    };
}

export function useActivities() {
    const store = useSupabaseStore();
    return {
        activities: store.activities,
        addActivity: store.addActivity,
    };
}

export function useItinerary() {
    const store = useSupabaseStore();
    return {
        itinerary: store.itinerary,
        tripId: store.tripId,
        addItineraryItem: store.addItineraryItem,
        updateItineraryItem: store.updateItineraryItem,
        deleteItineraryItem: store.deleteItineraryItem,
    };
}

export function useEditModal() {
    const store = useSupabaseStore();
    return {
        editModal: store.editModal,
        openEditModal: store.openEditModal,
        closeEditModal: store.closeEditModal,
    };
}

export function useMapPins() {
    const store = useSupabaseStore();
    return {
        mapPins: store.mapPins,
        addMapPin: store.addMapPin,
        updateMapPin: store.updateMapPin,
        deleteMapPin: store.deleteMapPin,
    };
}

export function usePlaces() {
    const store = useSupabaseStore();
    return {
        places: store.places,
    };
}

