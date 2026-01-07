"use client";

import * as React from "react";

// Transportation & Item Types
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

// Types
export interface ItineraryItem {
    id: number;
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
    // Transport-specific fields
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
    date: string;
    day: string;
    location: string;
    items: ItineraryItem[];
    empty?: boolean;
}

export interface Place {
    id: number;
    name: string;
    location: string;
    image: string;
    tag: string;
    notes?: string;
}

export interface Proposal {
    id: number;
    title: string;
    description: string;
    confidence: number;
    status: "pending" | "approved" | "rejected";
    type: "itinerary" | "place" | "booking" | "flight";
    data?: any;
}

export interface ActivityItem {
    id: number;
    user: string;
    action: string;
    target: string;
    time: string;
    timestamp: Date;
}

export interface MapPin {
    id: number;
    name: string;
    location: string;
    lat: number;
    lng: number;
    type: string;
    day?: string;
    notes?: string;
    linkedItemId?: number; // Link to itinerary item if auto-generated
}

export interface Workspace {
    id: string;
    name: string;
    icon: string;
}

// Edit Modal State
export interface EditModalState {
    isOpen: boolean;
    mode: "create" | "edit";
    item: Partial<ItineraryItem> | null;
    dayIndex: number | null;
}

// State types
interface AppState {
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

    // Trip Data
    itinerary: DaySchedule[];
    places: Place[];
    mapPins: MapPin[];

    // AI Proposals
    proposals: Proposal[];

    // Activity Feed
    activities: ActivityItem[];
}

interface AppActions {
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

    // Proposal Actions
    approveProposal: (id: number) => void;
    rejectProposal: (id: number) => void;
    addProposal: (proposal: Omit<Proposal, "id" | "status">) => void;

    // Activity Actions
    addActivity: (activity: Omit<ActivityItem, "id" | "timestamp">) => void;

    // Itinerary Actions
    addItineraryItem: (dayIndex: number, item: Omit<ItineraryItem, "id">) => void;
    updateItineraryItem: (itemId: number, updates: Partial<ItineraryItem>) => void;
    deleteItineraryItem: (itemId: number) => void;
    moveItineraryItem: (itemId: number, toDayIndex: number) => void;

    // Map Pin Actions
    addMapPin: (pin: Omit<MapPin, "id">) => void;
    updateMapPin: (id: number, updates: Partial<MapPin>) => void;
    deleteMapPin: (id: number) => void;
}

type AppStore = AppState & AppActions;

// Initial Data
const initialWorkspaces: Workspace[] = [
    { id: "personal", name: "Personal", icon: "P" },
    { id: "family", name: "Family", icon: "F" },
    { id: "work", name: "Work", icon: "W" },
];

const initialItinerary: DaySchedule[] = [
    {
        date: "Jan 12",
        day: "Day 1",
        location: "New York → Tokyo",
        items: [
            { id: 1, time: "11:45 AM", title: "Flight JL 005", type: "Flight", duration: "14h 20m", location: "JFK T8", status: "confirmed", assignees: ["C", "M"], day: "Day 1", date: "Jan 12", description: "Japan Airlines direct flight from JFK to Narita. Business class seats confirmed. Meal preference: Japanese cuisine." },
            { id: 2, time: "3:30 PM", title: "Arrive Narita", type: "Arrival", location: "NRT T2", status: "info", assignees: [], day: "Day 1", date: "Jan 12", description: "Arrival at Narita International Airport Terminal 2. Immigration and customs typically take 45-60 mins." },
        ],
    },
    {
        date: "Jan 13",
        day: "Day 2",
        location: "Tokyo (Shinjuku)",
        items: [
            { id: 3, time: "05:00 PM", title: "Check-in: Hyatt Regency", type: "Hotel", location: "Shinjuku", status: "booked", assignees: ["M"], day: "Day 2", date: "Jan 13", description: "Hyatt Regency Tokyo. Deluxe Twin Room with Mount Fuji view. Confirmation #HR2026JAN13." },
            { id: 4, time: "07:30 PM", title: "Dinner at Omoide Yokocho", type: "Food", location: "Shinjuku", status: "idea", assignees: ["C", "M"], day: "Day 2", date: "Jan 13", description: "Memory Lane yakitori alley. No reservations needed, just walk in. Budget: ¥3,000 per person." },
        ],
    },
    {
        date: "Jan 14",
        day: "Day 3",
        location: "Tokyo (Shibuya)",
        items: [],
        empty: true
    },
    {
        date: "Jan 15",
        day: "Day 4",
        location: "Tokyo → Niseko",
        items: [],
        empty: true
    },
    {
        date: "Jan 16",
        day: "Day 5",
        location: "Niseko",
        items: [],
        empty: true
    },
];

const initialPlaces: Place[] = [
    { id: 1, name: "Niseko Village", location: "Hokkaido", image: "https://images.unsplash.com/photo-1551817958-e1f0ed286379?q=80&w=2070&auto=format&fit=crop", tag: "Skiing" },
    { id: 2, name: "Fushimi Inari", location: "Kyoto", image: "https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?q=80&w=2070&auto=format&fit=crop", tag: "Sightseeing" },
    { id: 3, name: "Omoide Yokocho", location: "Tokyo", image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=2094&auto=format&fit=crop", tag: "Food" },
    { id: 4, name: "Hakone Onsen", location: "Kanagawa", image: "https://images.unsplash.com/photo-1515542622106-78bda8ba30c8?q=80&w=2048&auto=format&fit=crop", tag: "Relax" },
];

const initialProposals: Proposal[] = [
    {
        id: 1,
        title: "Create 3-day snowboarding block in Niseko",
        description: "Based on your interests, I suggest adding ski passes and lodge booking for Jan 15-17 in Niseko Village.",
        confidence: 92,
        status: "pending",
        type: "itinerary",
        data: {
            days: ["Jan 15", "Jan 16", "Jan 17"],
            items: [
                { title: "Ski Pass - Niseko United", type: "Activity", location: "Niseko" },
                { title: "Ski Rental - Burton Boards", type: "Rental", location: "Niseko Village" },
            ]
        }
    },
    {
        id: 2,
        title: "Add 5 places from shortlist to itinerary",
        description: "I can automatically add your saved places to optimal days based on location and opening hours.",
        confidence: 85,
        status: "pending",
        type: "place",
    },
    {
        id: 3,
        title: "Draft booking shortlist for Kyoto hotels",
        description: "Found 3 highly-rated hotels near Fushimi Inari with availability for Jan 18-20. Prices from ¥25,000/night.",
        confidence: 88,
        status: "pending",
        type: "booking",
    },
];

const initialActivities: ActivityItem[] = [
    { id: 1, user: "Camille", action: "added a note to", target: "Packing List", time: "2m ago", timestamp: new Date(Date.now() - 2 * 60 * 1000) },
    { id: 2, user: "Miguel", action: "commented on", target: "Niseko Hotel", time: "15m ago", timestamp: new Date(Date.now() - 15 * 60 * 1000) },
    { id: 3, user: "Camille", action: "booked", target: "JAL Flight JL 005", time: "1h ago", timestamp: new Date(Date.now() - 60 * 60 * 1000) },
    { id: 4, user: "Miguel", action: "added place", target: "Hakone Onsen", time: "2h ago", timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) },
];

const initialMapPins: MapPin[] = [
    { id: 1, name: "JFK Airport", location: "New York, USA", lat: 40.6413, lng: -73.7781, type: "Flight", day: "Day 1", notes: "Departure point" },
    { id: 2, name: "Narita Airport", location: "Chiba, Japan", lat: 35.7720, lng: 140.3929, type: "Flight", day: "Day 1", notes: "Arrival - Terminal 2" },
    { id: 3, name: "Hyatt Regency Tokyo", location: "Shinjuku, Tokyo", lat: 35.6938, lng: 139.6912, type: "Hotel", day: "Day 2", notes: "Deluxe Twin Room with Mount Fuji view" },
    { id: 4, name: "Omoide Yokocho", location: "Shinjuku, Tokyo", lat: 35.6938, lng: 139.6997, type: "Food", day: "Day 2", notes: "Memory Lane - Yakitori alley" },
    { id: 5, name: "Shibuya Crossing", location: "Shibuya, Tokyo", lat: 35.6595, lng: 139.7004, type: "Sightseeing", day: "Day 3", notes: "Famous intersection" },
    { id: 6, name: "Senso-ji Temple", location: "Asakusa, Tokyo", lat: 35.7148, lng: 139.7967, type: "Sightseeing", notes: "Oldest temple in Tokyo" },
    { id: 7, name: "Niseko Village", location: "Hokkaido, Japan", lat: 42.8614, lng: 140.6869, type: "Activity", day: "Day 4-5", notes: "Skiing destination" },
    { id: 8, name: "Fushimi Inari Shrine", location: "Kyoto, Japan", lat: 34.9671, lng: 135.7727, type: "Sightseeing", notes: "Thousand torii gates" },
    { id: 9, name: "Hakone Onsen", location: "Kanagawa, Japan", lat: 35.2326, lng: 139.1070, type: "Activity", notes: "Hot springs resort area" },
];

// Context
const AppContext = React.createContext<AppStore | null>(null);

// Provider
export function AppProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = React.useState<AppState>({
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
        itinerary: initialItinerary,
        places: initialPlaces,
        mapPins: initialMapPins,
        proposals: initialProposals,
        activities: initialActivities,
    });

    const actions: AppActions = React.useMemo(() => ({
        toggleSidebar: () => setState(s => ({ ...s, isSidebarCollapsed: !s.isSidebarCollapsed })),
        setSidebarCollapsed: (collapsed) => setState(s => ({ ...s, isSidebarCollapsed: collapsed })),
        toggleRightPanel: () => setState(s => ({ ...s, isRightPanelOpen: !s.isRightPanelOpen })),
        setRightPanelOpen: (open) => setState(s => ({ ...s, isRightPanelOpen: open })),
        setCommandPaletteOpen: (open) => setState(s => ({ ...s, isCommandPaletteOpen: open })),
        setActiveTab: (tab) => setState(s => ({ ...s, activeTab: tab })),
        setSelectedItineraryItem: (item) => setState(s => ({ ...s, selectedItineraryItem: item })),

        // Edit Modal Actions
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

        approveProposal: (id) => {
            setState(s => {
                const proposal = s.proposals.find(p => p.id === id);
                if (!proposal) return s;

                const newActivity: ActivityItem = {
                    id: Date.now(),
                    user: "AI Agent",
                    action: "applied",
                    target: proposal.title,
                    time: "Just now",
                    timestamp: new Date(),
                };

                return {
                    ...s,
                    proposals: s.proposals.map(p =>
                        p.id === id ? { ...p, status: "approved" as const } : p
                    ),
                    activities: [newActivity, ...s.activities],
                };
            });
        },

        rejectProposal: (id) => {
            setState(s => ({
                ...s,
                proposals: s.proposals.map(p =>
                    p.id === id ? { ...p, status: "rejected" as const } : p
                ),
            }));
        },

        addProposal: (proposal) => {
            setState(s => ({
                ...s,
                proposals: [...s.proposals, { ...proposal, id: Date.now(), status: "pending" }],
            }));
        },

        addActivity: (activity) => {
            setState(s => ({
                ...s,
                activities: [
                    { ...activity, id: Date.now(), timestamp: new Date() },
                    ...s.activities,
                ],
            }));
        },

        addItineraryItem: (dayIndex, item) => {
            setState(s => {
                const newItinerary = [...s.itinerary];
                const day = newItinerary[dayIndex];
                const newItem = { ...item, id: Date.now(), day: day.day, date: day.date };
                newItinerary[dayIndex] = {
                    ...newItinerary[dayIndex],
                    items: [...newItinerary[dayIndex].items, newItem],
                    empty: false,
                };

                const newActivity: ActivityItem = {
                    id: Date.now(),
                    user: "You",
                    action: "added",
                    target: newItem.title,
                    time: "Just now",
                    timestamp: new Date(),
                };

                return { ...s, itinerary: newItinerary, activities: [newActivity, ...s.activities] };
            });
        },

        updateItineraryItem: (itemId, updates) => {
            setState(s => {
                const newItinerary = s.itinerary.map(day => ({
                    ...day,
                    items: day.items.map(item =>
                        item.id === itemId ? { ...item, ...updates } : item
                    ),
                }));

                // Find the updated item for the activity
                let updatedItemTitle = "";
                for (const day of newItinerary) {
                    const found = day.items.find(i => i.id === itemId);
                    if (found) {
                        updatedItemTitle = found.title;
                        break;
                    }
                }

                const newActivity: ActivityItem = {
                    id: Date.now(),
                    user: "You",
                    action: "updated",
                    target: updatedItemTitle,
                    time: "Just now",
                    timestamp: new Date(),
                };

                // Also update selectedItineraryItem if it's the same item
                const newSelectedItem = s.selectedItineraryItem?.id === itemId
                    ? { ...s.selectedItineraryItem, ...updates }
                    : s.selectedItineraryItem;

                return {
                    ...s,
                    itinerary: newItinerary,
                    selectedItineraryItem: newSelectedItem,
                    activities: [newActivity, ...s.activities],
                };
            });
        },

        deleteItineraryItem: (itemId) => {
            setState(s => {
                // Find the item first for the activity log
                let deletedItemTitle = "";
                for (const day of s.itinerary) {
                    const found = day.items.find(i => i.id === itemId);
                    if (found) {
                        deletedItemTitle = found.title;
                        break;
                    }
                }

                const newItinerary = s.itinerary.map(day => {
                    const filteredItems = day.items.filter(item => item.id !== itemId);
                    return {
                        ...day,
                        items: filteredItems,
                        empty: filteredItems.length === 0,
                    };
                });

                const newActivity: ActivityItem = {
                    id: Date.now(),
                    user: "You",
                    action: "deleted",
                    target: deletedItemTitle,
                    time: "Just now",
                    timestamp: new Date(),
                };

                return {
                    ...s,
                    itinerary: newItinerary,
                    selectedItineraryItem: s.selectedItineraryItem?.id === itemId ? null : s.selectedItineraryItem,
                    activities: [newActivity, ...s.activities],
                };
            });
        },

        moveItineraryItem: (itemId, toDayIndex) => {
            setState(s => {
                // Find and remove the item from its current day
                let movedItem: ItineraryItem | null = null;
                const newItinerary = s.itinerary.map((day, idx) => {
                    const item = day.items.find(i => i.id === itemId);
                    if (item) {
                        movedItem = { ...item, day: s.itinerary[toDayIndex].day, date: s.itinerary[toDayIndex].date };
                    }
                    const filteredItems = day.items.filter(i => i.id !== itemId);
                    return {
                        ...day,
                        items: filteredItems,
                        empty: filteredItems.length === 0,
                    };
                });

                // Add to the target day
                if (movedItem) {
                    newItinerary[toDayIndex] = {
                        ...newItinerary[toDayIndex],
                        items: [...newItinerary[toDayIndex].items, movedItem],
                        empty: false,
                    };
                }

                return { ...s, itinerary: newItinerary };
            });
        },

        // Map Pin Actions
        addMapPin: (pin) => {
            setState(s => {
                const newPin = { ...pin, id: Date.now() };
                const newActivity: ActivityItem = {
                    id: Date.now() + 1,
                    user: "You",
                    action: "added pin",
                    target: newPin.name,
                    time: "Just now",
                    timestamp: new Date(),
                };
                return {
                    ...s,
                    mapPins: [...s.mapPins, newPin],
                    activities: [newActivity, ...s.activities],
                };
            });
        },

        updateMapPin: (id, updates) => {
            setState(s => ({
                ...s,
                mapPins: s.mapPins.map(pin =>
                    pin.id === id ? { ...pin, ...updates } : pin
                ),
            }));
        },

        deleteMapPin: (id) => {
            setState(s => {
                const deletedPin = s.mapPins.find(p => p.id === id);
                const newActivity: ActivityItem = {
                    id: Date.now(),
                    user: "You",
                    action: "removed pin",
                    target: deletedPin?.name || "Unknown",
                    time: "Just now",
                    timestamp: new Date(),
                };
                return {
                    ...s,
                    mapPins: s.mapPins.filter(pin => pin.id !== id),
                    activities: [newActivity, ...s.activities],
                };
            });
        },
    }), []);

    const store = React.useMemo(() => ({ ...state, ...actions }), [state, actions]);

    return <AppContext.Provider value={store}>{children}</AppContext.Provider>;
}

// Hook
export function useAppStore() {
    const context = React.useContext(AppContext);
    if (!context) {
        throw new Error("useAppStore must be used within AppProvider");
    }
    return context;
}

// Selector hooks for performance
export function useUIState() {
    const store = useAppStore();
    return {
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
    const store = useAppStore();
    return {
        currentWorkspace: store.currentWorkspace,
        workspaces: store.workspaces,
        setCurrentWorkspace: store.setCurrentWorkspace,
    };
}

export function useProposals() {
    const store = useAppStore();
    return {
        proposals: store.proposals,
        approveProposal: store.approveProposal,
        rejectProposal: store.rejectProposal,
        addProposal: store.addProposal,
    };
}

export function useActivities() {
    const store = useAppStore();
    return {
        activities: store.activities,
        addActivity: store.addActivity,
    };
}

export function useItinerary() {
    const store = useAppStore();
    return {
        itinerary: store.itinerary,
        addItineraryItem: store.addItineraryItem,
        updateItineraryItem: store.updateItineraryItem,
        deleteItineraryItem: store.deleteItineraryItem,
        moveItineraryItem: store.moveItineraryItem,
    };
}

export function useEditModal() {
    const store = useAppStore();
    return {
        editModal: store.editModal,
        openEditModal: store.openEditModal,
        closeEditModal: store.closeEditModal,
    };
}

export function useMapPins() {
    const store = useAppStore();
    return {
        mapPins: store.mapPins,
        addMapPin: store.addMapPin,
        updateMapPin: store.updateMapPin,
        deleteMapPin: store.deleteMapPin,
    };
}
