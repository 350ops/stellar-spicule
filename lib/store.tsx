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
            { id: 1, time: "11:45 AM", title: "Japan Airlines JL 005", type: "Flight", duration: "14h 20m", location: "JFK Terminal 1", status: "confirmed", assignees: ["C", "M"], day: "Day 1", date: "Jan 12", description: "Direct flight NYC to Tokyo Narita. Premium Economy seats 21A & 21B. Confirmation: JALNYC2026CM. Baggage: 2x 23kg checked + carry-on.", flightNumber: "JL 005", carrier: "Japan Airlines", departureTime: "11:45 AM", arrivalTime: "4:05 PM +1", departureLocation: "JFK", arrivalLocation: "NRT", seatClass: "Premium Economy", price: "$2,847 × 2", confirmationNumber: "JALNYC2026CM" },
        ],
    },
    {
        date: "Jan 13",
        day: "Day 2",
        location: "Arrive Tokyo",
        items: [
            { id: 2, time: "4:05 PM", title: "Arrive Narita Airport", type: "Arrival", location: "NRT Terminal 2", status: "info", assignees: [], day: "Day 2", date: "Jan 13", description: "Immigration & customs ~45 mins. Pick up Pocket WiFi at JAL ABC counter. Get Suica cards from JR counter." },
            { id: 3, time: "5:30 PM", title: "Narita Express to Shinjuku", type: "Train", duration: "1h 20m", location: "NRT → Shinjuku", status: "confirmed", assignees: ["C", "M"], day: "Day 2", date: "Jan 13", description: "Reserved seats on N'EX. Track 1, Car 5. JR Pass activated.", confirmationNumber: "NEX-26012", price: "Included in JR Pass" },
            { id: 4, time: "7:00 PM", title: "Check-in: Park Hyatt Tokyo", type: "Hotel", location: "Shinjuku, Tokyo", status: "confirmed", assignees: ["C", "M"], day: "Day 2", date: "Jan 13", description: "Park Hyatt Tokyo (Lost in Translation hotel). Park Suite, 52nd floor, Mount Fuji view. 3 nights. Globalist benefits: free breakfast, 4PM checkout.", confirmationNumber: "PHT-2026-8834", price: "¥89,000/night", bookingUrl: "https://hyatt.com" },
            { id: 5, time: "8:30 PM", title: "Dinner at Omoide Yokocho", type: "Food", location: "Shinjuku, Tokyo", status: "booked", assignees: ["C", "M"], day: "Day 2", date: "Jan 13", description: "Memory Lane yakitori alley near Shinjuku Station west exit. Try Asadachi for grilled chicken skewers. Budget: ¥4,000 per person. Cash only!" },
        ],
    },
    {
        date: "Jan 14",
        day: "Day 3",
        location: "Tokyo (Shibuya & Harajuku)",
        items: [
            { id: 6, time: "8:00 AM", title: "Breakfast at New York Grill", type: "Food", location: "Park Hyatt, 52F", status: "confirmed", assignees: ["C", "M"], day: "Day 3", date: "Jan 14", description: "Included with Globalist status. Amazing city views. Dress code: Smart casual." },
            { id: 7, time: "10:00 AM", title: "Meiji Shrine", type: "Sightseeing", duration: "1h 30m", location: "Harajuku", status: "confirmed", assignees: ["C", "M"], day: "Day 3", date: "Jan 14", description: "Tokyo's most famous Shinto shrine. Walk through the torii gates in the forest. Write wishes on ema wooden plaques." },
            { id: 8, time: "12:00 PM", title: "Takeshita Street", type: "Sightseeing", duration: "1h", location: "Harajuku", status: "idea", assignees: ["C"], day: "Day 3", date: "Jan 14", description: "Famous pedestrian shopping street. Try a rainbow cotton candy or crepe. Lots of kawaii shops and vintage stores." },
            { id: 9, time: "1:30 PM", title: "Lunch at Afuri Ramen", type: "Food", location: "Harajuku", status: "idea", assignees: ["C", "M"], day: "Day 3", date: "Jan 14", description: "Famous yuzu shio ramen. Usually 20-30 min wait. Vegetarian options available." },
            { id: 10, time: "3:00 PM", title: "Shibuya Crossing", type: "Sightseeing", duration: "30m", location: "Shibuya", status: "confirmed", assignees: ["C", "M"], day: "Day 3", date: "Jan 14", description: "World's busiest pedestrian crossing. Photo from Starbucks 2F or Shibuya Sky rooftop (¥2,000)." },
            { id: 11, time: "4:00 PM", title: "Shibuya Sky Observation", type: "Activity", duration: "1h 30m", location: "Shibuya Scramble Square", status: "booked", assignees: ["C", "M"], day: "Day 3", date: "Jan 14", description: "360° rooftop observation deck on 46th floor. Sunset time slot booked. Great for photos!", confirmationNumber: "SKY-2026-1412", price: "¥2,000 × 2" },
            { id: 12, time: "7:00 PM", title: "Dinner at Uobei Sushi", type: "Food", location: "Shibuya", status: "idea", assignees: ["C", "M"], day: "Day 3", date: "Jan 14", description: "Fun conveyor belt sushi with bullet train delivery. Order via touchscreen. Budget: ¥2,500/person." },
        ],
    },
    {
        date: "Jan 15",
        day: "Day 4",
        location: "Tokyo (Asakusa & Akihabara)",
        items: [
            { id: 13, time: "9:00 AM", title: "Senso-ji Temple", type: "Sightseeing", duration: "2h", location: "Asakusa", status: "confirmed", assignees: ["C", "M"], day: "Day 4", date: "Jan 15", description: "Tokyo's oldest temple. Enter through Kaminarimon gate with giant red lantern. Nakamise shopping street for souvenirs." },
            { id: 14, time: "11:30 AM", title: "Kimono Rental Experience", type: "Activity", duration: "4h", location: "Asakusa", status: "booked", assignees: ["C"], day: "Day 4", date: "Jan 15", description: "Wargo Asakusa kimono rental. Includes dressing, hair styling, accessories. Return by 5 PM.", confirmationNumber: "WARGO-1501", price: "¥6,500" },
            { id: 15, time: "12:30 PM", title: "Lunch at Asakusa Mugitoro", type: "Food", location: "Asakusa", status: "booked", assignees: ["C", "M"], day: "Day 4", date: "Jan 15", description: "Traditional tororo (grated yam) specialty restaurant since 1929. Reservation for 2 at 12:30.", confirmationNumber: "MUG-150126" },
            { id: 16, time: "3:00 PM", title: "Akihabara Electric Town", type: "Sightseeing", duration: "3h", location: "Akihabara", status: "idea", assignees: ["M"], day: "Day 4", date: "Jan 15", description: "Electronics and anime paradise. Visit Yodobashi Camera (8 floors!), Super Potato retro games, and maid cafes." },
            { id: 17, time: "7:00 PM", title: "Dinner at Gonpachi Nishi-Azabu", type: "Food", location: "Nishi-Azabu", status: "booked", assignees: ["C", "M"], day: "Day 4", date: "Jan 15", description: "The 'Kill Bill' restaurant. Traditional robatayaki. Reservation confirmed for 7 PM. Smart casual dress code.", confirmationNumber: "GONP-2026-1501", price: "~¥8,000/person" },
        ],
    },
    {
        date: "Jan 16",
        day: "Day 5",
        location: "Tokyo → Niseko",
        items: [
            { id: 18, time: "6:30 AM", title: "Check-out Park Hyatt", type: "Hotel", location: "Shinjuku", status: "info", assignees: ["C", "M"], day: "Day 5", date: "Jan 16", description: "Late checkout at 4 PM available but taking early flight. Luggage forwarding to Niseko arranged via Yamato." },
            { id: 19, time: "8:00 AM", title: "Flight to New Chitose", type: "Flight", duration: "1h 35m", location: "HND → CTS", status: "confirmed", assignees: ["C", "M"], day: "Day 5", date: "Jan 16", description: "ANA NH 053 from Haneda to New Chitose Airport (Sapporo). Economy class.", flightNumber: "NH 053", carrier: "ANA", departureTime: "8:00 AM", arrivalTime: "9:35 AM", departureLocation: "HND", arrivalLocation: "CTS", price: "¥24,000 × 2", confirmationNumber: "ANA-NH053-2026" },
            { id: 20, time: "10:30 AM", title: "Niseko United Bus Transfer", type: "Transfer", duration: "2h 30m", location: "CTS → Niseko", status: "booked", assignees: ["C", "M"], day: "Day 5", date: "Jan 16", description: "Chuo Bus resort liner direct to Niseko Hirafu. Departs from bus terminal 14.", confirmationNumber: "CHUO-1601", price: "¥4,000 × 2" },
            { id: 21, time: "1:30 PM", title: "Check-in: Niseko Airbnb", type: "Airbnb", location: "Niseko Hirafu", status: "confirmed", assignees: ["C", "M"], day: "Day 5", date: "Jan 16", description: "Yuki House - Modern 2BR ski-in/ski-out chalet. 5 min walk to Hirafu Gondola. Hot tub on deck! Host: Takeshi. 4 nights.", confirmationNumber: "ABNB-YUKI-2026", price: "¥38,000/night", bookingUrl: "https://airbnb.com/rooms/12345678" },
            { id: 22, time: "3:00 PM", title: "Ski Rental at Rhythm Japan", type: "Activity", duration: "1h", location: "Hirafu", status: "booked", assignees: ["C", "M"], day: "Day 5", date: "Jan 16", description: "Premium ski/snowboard rental. Fitted for: Camille (snowboard), Miguel (skis). 4-day rental.", confirmationNumber: "RHYTHM-1601", price: "¥32,000 total" },
            { id: 23, time: "5:00 PM", title: "Dinner at Niseko Ramen Kazahana", type: "Food", location: "Hirafu", status: "idea", assignees: ["C", "M"], day: "Day 5", date: "Jan 16", description: "Famous Hokkaido miso ramen. Cash only. Usually 15-20 min wait." },
        ],
    },
    {
        date: "Jan 17",
        day: "Day 6",
        location: "Niseko (Skiing)",
        items: [
            { id: 24, time: "8:30 AM", title: "Niseko United All-Mountain Pass", type: "Activity", duration: "Full day", location: "Niseko United", status: "confirmed", assignees: ["C", "M"], day: "Day 6", date: "Jan 17", description: "4-day all-mountain pass covering Grand Hirafu, Hanazono, Niseko Village, and Annupuri. Legendary powder day forecast!", confirmationNumber: "NISK-4DAY-2026", price: "¥29,600 × 2" },
            { id: 25, time: "12:30 PM", title: "Lunch at Hanazono 308", type: "Food", location: "Hanazono Resort", status: "idea", assignees: ["C", "M"], day: "Day 6", date: "Jan 17", description: "Slope-side cafe with great views. Try the pork katsu curry or soup curry." },
            { id: 26, time: "4:30 PM", title: "Après-ski at Bar Gyu+", type: "Food", location: "Hirafu", status: "idea", assignees: ["C", "M"], day: "Day 6", date: "Jan 17", description: "Popular après bar with live music. Happy hour 4-6 PM. Great cocktails." },
            { id: 27, time: "7:00 PM", title: "Dinner at Kamimura", type: "Food", location: "Hirafu", status: "booked", assignees: ["C", "M"], day: "Day 6", date: "Jan 17", description: "Michelin-starred French-Japanese fusion. 8-course tasting menu. Reservation for 7 PM. Smart casual.", confirmationNumber: "KAMI-170126", price: "¥18,000/person" },
        ],
    },
    {
        date: "Jan 18",
        day: "Day 7",
        location: "Niseko (Skiing)",
        items: [
            { id: 28, time: "8:00 AM", title: "First Tracks Skiing", type: "Activity", duration: "Full day", location: "Grand Hirafu", status: "confirmed", assignees: ["C", "M"], day: "Day 7", date: "Jan 18", description: "Early morning powder hunting! Start at King Quad Lift 3. Check avalanche conditions." },
            { id: 29, time: "12:00 PM", title: "Lunch at Boyoso", type: "Food", location: "Hirafu Village", status: "idea", assignees: ["C", "M"], day: "Day 7", date: "Jan 18", description: "Legendary soba noodles made fresh daily. Cash only. Usually sells out by 2 PM!" },
            { id: 30, time: "5:00 PM", title: "Yukoro Onsen", type: "Activity", duration: "1h 30m", location: "Niseko", status: "idea", assignees: ["C", "M"], day: "Day 7", date: "Jan 18", description: "Traditional Japanese hot spring. Tattoo-friendly. Indoor and outdoor baths. ¥1,000 entry. Bring your own towel or rent." },
            { id: 31, time: "7:30 PM", title: "Dinner at Rakuichi Soba", type: "Food", location: "Hirafu", status: "booked", assignees: ["C", "M"], day: "Day 7", date: "Jan 18", description: "Artisan soba restaurant. Handmade buckwheat noodles. Reservation confirmed.", confirmationNumber: "RAKU-1801" },
        ],
    },
    {
        date: "Jan 19",
        day: "Day 8",
        location: "Niseko → Sapporo",
        items: [
            { id: 32, time: "9:00 AM", title: "Morning Ski Session", type: "Activity", duration: "3h", location: "Annupuri", status: "confirmed", assignees: ["C", "M"], day: "Day 8", date: "Jan 19", description: "Last ski day! Annupuri has the best tree runs and fewer crowds." },
            { id: 33, time: "1:00 PM", title: "Return Ski Rentals", type: "Activity", location: "Rhythm Japan", status: "info", assignees: ["C", "M"], day: "Day 8", date: "Jan 19", description: "Return all rental equipment to Rhythm by 2 PM." },
            { id: 34, time: "2:30 PM", title: "Bus to Sapporo", type: "Bus", duration: "2h 30m", location: "Niseko → Sapporo", status: "booked", assignees: ["C", "M"], day: "Day 8", date: "Jan 19", description: "Chuo Bus to Sapporo Station. Departs from Hirafu Welcome Center.", confirmationNumber: "CHUO-1901", price: "¥2,600 × 2" },
            { id: 35, time: "5:30 PM", title: "Check-in: JR Tower Hotel Nikko", type: "Hotel", location: "Sapporo Station", status: "confirmed", assignees: ["C", "M"], day: "Day 8", date: "Jan 19", description: "Deluxe Twin with city view. 1 night. Connected directly to JR Sapporo Station. 22nd floor spa access included.", confirmationNumber: "JRTH-190126", price: "¥32,000" },
            { id: 36, time: "7:00 PM", title: "Sapporo Ramen Alley", type: "Food", location: "Susukino", status: "idea", assignees: ["C", "M"], day: "Day 8", date: "Jan 19", description: "Try the famous Sapporo miso ramen at Ramen Yokocho alley. Multiple shops to choose from." },
            { id: 37, time: "9:00 PM", title: "Sapporo Beer Museum", type: "Activity", duration: "1h", location: "Sapporo", status: "idea", assignees: ["M"], day: "Day 8", date: "Jan 19", description: "Evening tour and tasting at historic brewery. ¥800 for premium tasting set." },
        ],
    },
    {
        date: "Jan 20",
        day: "Day 9",
        location: "Sapporo → Kyoto",
        items: [
            { id: 38, time: "7:00 AM", title: "Nijo Fish Market", type: "Food", location: "Sapporo", status: "idea", assignees: ["C", "M"], day: "Day 9", date: "Jan 20", description: "Fresh seafood breakfast! Try the kaisendon (seafood rice bowl). Opens at 7 AM." },
            { id: 39, time: "10:00 AM", title: "Flight to Osaka", type: "Flight", duration: "2h 5m", location: "CTS → KIX", status: "confirmed", assignees: ["C", "M"], day: "Day 9", date: "Jan 20", description: "Peach Aviation MM 114 to Kansai Airport. Budget airline - no meal included.", flightNumber: "MM 114", carrier: "Peach Aviation", departureTime: "10:00 AM", arrivalTime: "12:05 PM", departureLocation: "CTS", arrivalLocation: "KIX", price: "¥11,800 × 2", confirmationNumber: "PCH-MM114-2026" },
            { id: 40, time: "1:30 PM", title: "Haruka Express to Kyoto", type: "Train", duration: "1h 15m", location: "KIX → Kyoto", status: "confirmed", assignees: ["C", "M"], day: "Day 9", date: "Jan 20", description: "JR Haruka limited express. Reserved seats in car 4. JR Pass valid.", price: "Included in JR Pass" },
            { id: 41, time: "3:00 PM", title: "Check-in: The Machiya Residence", type: "Airbnb", location: "Gion, Kyoto", status: "confirmed", assignees: ["C", "M"], day: "Day 9", date: "Jan 20", description: "Renovated 100-year-old machiya townhouse. Traditional tatami rooms, private garden. Walking distance to Gion. 4 nights. Host: Yuki-san.", confirmationNumber: "ABNB-MACH-2026", price: "¥28,000/night", bookingUrl: "https://airbnb.com/rooms/87654321" },
            { id: 42, time: "5:00 PM", title: "Walk through Gion District", type: "Sightseeing", duration: "2h", location: "Gion, Kyoto", status: "confirmed", assignees: ["C", "M"], day: "Day 9", date: "Jan 20", description: "Explore geisha district at dusk. Walk Hanamikoji Street. Might spot a geiko (geisha) or maiko (apprentice)." },
            { id: 43, time: "7:30 PM", title: "Dinner at Gion Karyo", type: "Food", location: "Gion", status: "booked", assignees: ["C", "M"], day: "Day 9", date: "Jan 20", description: "Traditional kaiseki dinner in private tatami room. Multi-course seasonal menu. Reservation required.", confirmationNumber: "KARYO-2001", price: "¥15,000/person" },
        ],
    },
    {
        date: "Jan 21",
        day: "Day 10",
        location: "Kyoto (Temples)",
        items: [
            { id: 44, time: "6:30 AM", title: "Fushimi Inari Shrine", type: "Sightseeing", duration: "2h", location: "Fushimi, Kyoto", status: "confirmed", assignees: ["C", "M"], day: "Day 10", date: "Jan 21", description: "Famous 10,000 vermillion torii gates. Go early to avoid crowds! Hike to the top takes ~2 hours. Free entry." },
            { id: 45, time: "9:30 AM", title: "Breakfast at Vermillion Cafe", type: "Food", location: "Near Fushimi Inari", status: "idea", assignees: ["C", "M"], day: "Day 10", date: "Jan 21", description: "Cute cafe with Inari views. Great coffee and Japanese breakfast set." },
            { id: 46, time: "11:00 AM", title: "Kinkaku-ji (Golden Pavilion)", type: "Sightseeing", duration: "1h", location: "Kita, Kyoto", status: "confirmed", assignees: ["C", "M"], day: "Day 10", date: "Jan 21", description: "Iconic gold-leaf covered temple reflected in the pond. Entry: ¥500. Can get crowded midday." },
            { id: 47, time: "1:00 PM", title: "Lunch at Shoraian", type: "Food", location: "Arashiyama", status: "booked", assignees: ["C", "M"], day: "Day 10", date: "Jan 21", description: "Beautiful riverside tofu restaurant. River views from tatami seating. Reservation at 1 PM.", confirmationNumber: "SHORA-2101", price: "¥3,500/person" },
            { id: 48, time: "2:30 PM", title: "Arashiyama Bamboo Grove", type: "Sightseeing", duration: "1h", location: "Arashiyama, Kyoto", status: "confirmed", assignees: ["C", "M"], day: "Day 10", date: "Jan 21", description: "Iconic bamboo forest path. Walk to Tenryu-ji Temple gardens (¥500). Best photos in early morning light." },
            { id: 49, time: "4:00 PM", title: "Monkey Park Iwatayama", type: "Activity", duration: "1h 30m", location: "Arashiyama", status: "idea", assignees: ["C", "M"], day: "Day 10", date: "Jan 21", description: "Hilltop park with wild Japanese macaques. 20-min uphill walk. ¥550 entry. Great city views from top." },
            { id: 50, time: "7:00 PM", title: "Dinner at Pontocho Alley", type: "Food", location: "Pontocho, Kyoto", status: "idea", assignees: ["C", "M"], day: "Day 10", date: "Jan 21", description: "Atmospheric narrow alley along Kamo River. Many restaurants with riverside seating (yuka in summer)." },
        ],
    },
    {
        date: "Jan 22",
        day: "Day 11",
        location: "Kyoto → Nara Day Trip",
        items: [
            { id: 51, time: "8:30 AM", title: "Train to Nara", type: "Train", duration: "45m", location: "Kyoto → Nara", status: "confirmed", assignees: ["C", "M"], day: "Day 11", date: "Jan 22", description: "JR Nara Line from Kyoto Station. Use JR Pass. Every 15-20 minutes.", price: "Included in JR Pass" },
            { id: 52, time: "9:30 AM", title: "Nara Park & Deer", type: "Sightseeing", duration: "2h", location: "Nara", status: "confirmed", assignees: ["C", "M"], day: "Day 11", date: "Jan 22", description: "1,200+ friendly deer roam freely! Buy shika senbei (deer crackers) for ¥200. Bow to the deer, they bow back!" },
            { id: 53, time: "11:30 AM", title: "Todai-ji Temple", type: "Sightseeing", duration: "1h 30m", location: "Nara", status: "confirmed", assignees: ["C", "M"], day: "Day 11", date: "Jan 22", description: "Houses the world's largest bronze Buddha. Entry: ¥600. Try crawling through the pillar hole for enlightenment!" },
            { id: 54, time: "1:30 PM", title: "Lunch at Mellow Cafe", type: "Food", location: "Nara", status: "idea", assignees: ["C", "M"], day: "Day 11", date: "Jan 22", description: "Cozy cafe near Nara Park. Great desserts and light lunch options." },
            { id: 55, time: "3:00 PM", title: "Kasuga Grand Shrine", type: "Sightseeing", duration: "1h", location: "Nara", status: "idea", assignees: ["C", "M"], day: "Day 11", date: "Jan 22", description: "Shinto shrine famous for hundreds of bronze and stone lanterns. Beautiful forest path approach." },
            { id: 56, time: "5:00 PM", title: "Return to Kyoto", type: "Train", duration: "45m", location: "Nara → Kyoto", status: "confirmed", assignees: ["C", "M"], day: "Day 11", date: "Jan 22", description: "JR Nara Line back to Kyoto.", price: "Included in JR Pass" },
            { id: 57, time: "7:00 PM", title: "Dinner at Nishiki Market Area", type: "Food", location: "Kyoto", status: "idea", assignees: ["C", "M"], day: "Day 11", date: "Jan 22", description: "Explore 'Kyoto's Kitchen' - covered market with food stalls. Try matcha desserts, pickles, and street food." },
        ],
    },
    {
        date: "Jan 23",
        day: "Day 12",
        location: "Kyoto → Tokyo",
        items: [
            { id: 58, time: "8:00 AM", title: "Tea Ceremony Experience", type: "Activity", duration: "1h 30m", location: "Gion, Kyoto", status: "booked", assignees: ["C", "M"], day: "Day 12", date: "Jan 23", description: "Traditional tea ceremony at En teahouse. Learn matcha preparation and etiquette. English explanation provided.", confirmationNumber: "EN-230126", price: "¥4,500/person" },
            { id: 59, time: "10:30 AM", title: "Kiyomizu-dera Temple", type: "Sightseeing", duration: "1h 30m", location: "Higashiyama, Kyoto", status: "confirmed", assignees: ["C", "M"], day: "Day 12", date: "Jan 23", description: "Famous wooden temple on hillside with panoramic views. Walk through Ninenzaka and Sannenzaka historic streets. Entry: ¥400." },
            { id: 60, time: "1:00 PM", title: "Shinkansen to Tokyo", type: "Train", duration: "2h 15m", location: "Kyoto → Tokyo", status: "confirmed", assignees: ["C", "M"], day: "Day 12", date: "Jan 23", description: "Nozomi bullet train. Reserved seats in car 8. JR Pass valid. Experience the 285 km/h speed!", carrier: "JR Tokaido Shinkansen", price: "Included in JR Pass" },
            { id: 61, time: "4:00 PM", title: "Check-in: Aman Tokyo", type: "Hotel", location: "Otemachi, Tokyo", status: "confirmed", assignees: ["C", "M"], day: "Day 12", date: "Jan 23", description: "Luxury finale hotel. Corner Suite on 33rd floor. Views of Imperial Palace Gardens. 2 nights. Spa access included.", confirmationNumber: "AMAN-2301-26", price: "¥145,000/night", bookingUrl: "https://aman.com/hotels/aman-tokyo" },
            { id: 62, time: "6:00 PM", title: "Imperial Palace East Gardens", type: "Sightseeing", duration: "1h", location: "Chiyoda, Tokyo", status: "idea", assignees: ["C", "M"], day: "Day 12", date: "Jan 23", description: "Free admission. Beautiful gardens in former castle grounds. Closes at sunset." },
            { id: 63, time: "7:30 PM", title: "Dinner at Sukiyabashi Jiro Roppongi", type: "Food", location: "Roppongi, Tokyo", status: "booked", assignees: ["C", "M"], day: "Day 12", date: "Jan 23", description: "Omakase sushi at the Roppongi location (easier reservation than Ginza). 20-piece course. World-class sushi experience.", confirmationNumber: "JIRO-2301", price: "¥33,000/person" },
        ],
    },
    {
        date: "Jan 24",
        day: "Day 13",
        location: "Tokyo → Home",
        items: [
            { id: 64, time: "8:00 AM", title: "Tsukiji Outer Market Breakfast", type: "Food", location: "Tsukiji, Tokyo", status: "idea", assignees: ["C", "M"], day: "Day 13", date: "Jan 24", description: "Final Japanese breakfast! Fresh sushi, tamagoyaki (egg), and matcha at the historic outer market." },
            { id: 65, time: "10:30 AM", title: "Last-minute Shopping at Ginza", type: "Activity", duration: "2h", location: "Ginza, Tokyo", status: "idea", assignees: ["C", "M"], day: "Day 13", date: "Jan 24", description: "Final souvenirs at Ginza Six, Itoya stationery, or Don Quijote. Tax-free shopping with passport." },
            { id: 66, time: "1:00 PM", title: "Hotel Checkout", type: "Hotel", location: "Aman Tokyo", status: "info", assignees: ["C", "M"], day: "Day 13", date: "Jan 24", description: "Late checkout arranged. Leave luggage with concierge for airport transfer." },
            { id: 67, time: "2:30 PM", title: "Narita Express to Airport", type: "Train", duration: "1h", location: "Tokyo → NRT", status: "confirmed", assignees: ["C", "M"], day: "Day 13", date: "Jan 24", description: "N'EX from Tokyo Station to Narita Airport. Allow 3 hours before flight.", price: "Included in JR Pass" },
            { id: 68, time: "5:55 PM", title: "Flight Home - JL 006", type: "Flight", duration: "12h 50m", location: "NRT Terminal 2", status: "confirmed", assignees: ["C", "M"], day: "Day 13", date: "Jan 24", description: "Japan Airlines direct to JFK. Arrives same day 5:45 PM EST. Premium Economy. Sayonara, Japan!", flightNumber: "JL 006", carrier: "Japan Airlines", departureTime: "5:55 PM", arrivalTime: "5:45 PM (same day)", departureLocation: "NRT", arrivalLocation: "JFK", seatClass: "Premium Economy", price: "$2,847 × 2", confirmationNumber: "JALTYO2026CM" },
        ],
    },
];

const initialPlaces: Place[] = [
    { id: 1, name: "teamLab Borderless", location: "Azabudai Hills, Tokyo", image: "https://images.unsplash.com/photo-1549490349-8643362247b5?q=80&w=2070&auto=format&fit=crop", tag: "Art", notes: "Immersive digital art museum. Book in advance! Allow 2-3 hours. ¥3,800 entry." },
    { id: 2, name: "Fushimi Inari Shrine", location: "Kyoto", image: "https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?q=80&w=2070&auto=format&fit=crop", tag: "Sightseeing", notes: "Go at sunrise to avoid crowds. 10,000 torii gates!" },
    { id: 3, name: "Omoide Yokocho", location: "Shinjuku, Tokyo", image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=2094&auto=format&fit=crop", tag: "Food", notes: "Memory Lane yakitori alley. Cash only. Great for photos at night." },
    { id: 4, name: "Hakone Open-Air Museum", location: "Hakone, Kanagawa", image: "https://images.unsplash.com/photo-1515542622106-78bda8ba30c8?q=80&w=2048&auto=format&fit=crop", tag: "Art", notes: "Outdoor sculpture park with Picasso collection. Beautiful mountain views." },
    { id: 5, name: "Arashiyama Bamboo Grove", location: "Kyoto", image: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?q=80&w=2070&auto=format&fit=crop", tag: "Nature", notes: "Best at early morning. Free entry. Rent a kimono nearby!" },
    { id: 6, name: "Niseko United Ski Resort", location: "Hokkaido", image: "https://images.unsplash.com/photo-1551817958-e1f0ed286379?q=80&w=2070&auto=format&fit=crop", tag: "Skiing", notes: "World-famous powder snow. 4 interconnected resorts." },
    { id: 7, name: "Tsukiji Outer Market", location: "Tsukiji, Tokyo", image: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=2069&auto=format&fit=crop", tag: "Food", notes: "Opens early AM. Fresh sushi breakfast, tamagoyaki, and street food." },
    { id: 8, name: "Kinkaku-ji Temple", location: "Kyoto", image: "https://images.unsplash.com/photo-1490761668535-35497054764d?q=80&w=2070&auto=format&fit=crop", tag: "Sightseeing", notes: "Golden Pavilion. ¥500 entry. Most photogenic in morning light." },
];

const initialProposals: Proposal[] = [
    {
        id: 1,
        title: "Add teamLab Borderless to Day 3",
        description: "The new Azabudai Hills location has shorter wait times in the afternoon. I can book tickets for Jan 14 at 2 PM (¥3,800/person).",
        confidence: 94,
        status: "pending",
        type: "itinerary",
        data: {
            day: "Jan 14",
            item: { title: "teamLab Borderless", type: "Activity", location: "Azabudai Hills, Tokyo", time: "2:00 PM" }
        }
    },
    {
        id: 2,
        title: "Book Hakone day trip for extra recovery day",
        description: "Weather forecast shows poor skiing conditions on Jan 18. Consider a day trip to Hakone for hot springs and Open-Air Museum instead.",
        confidence: 87,
        status: "pending",
        type: "itinerary",
    },
    {
        id: 3,
        title: "Reserve Robot Restaurant for unique Tokyo night",
        description: "The famous Robot Restaurant in Shinjuku has availability on Jan 15 at 7:30 PM. ¥8,500/person includes one drink. Very touristy but fun!",
        confidence: 79,
        status: "pending",
        type: "booking",
    },
    {
        id: 4,
        title: "Upgrade Kyoto stay to Hoshinoya",
        description: "Hoshinoya Kyoto (luxury ryokan on the river) has an opening for Jan 20-22. ¥85,000/night but includes kaiseki dinner and boat transfer.",
        confidence: 82,
        status: "pending",
        type: "booking",
    },
];

const initialActivities: ActivityItem[] = [
    { id: 1, user: "Camille", action: "confirmed reservation at", target: "Sukiyabashi Jiro Roppongi", time: "5m ago", timestamp: new Date(Date.now() - 5 * 60 * 1000) },
    { id: 2, user: "Miguel", action: "added ski rental to", target: "Rhythm Japan (Jan 16-19)", time: "23m ago", timestamp: new Date(Date.now() - 23 * 60 * 1000) },
    { id: 3, user: "AI Agent", action: "found better price for", target: "Narita Express tickets", time: "45m ago", timestamp: new Date(Date.now() - 45 * 60 * 1000) },
    { id: 4, user: "Camille", action: "booked tea ceremony at", target: "En Teahouse Gion", time: "1h ago", timestamp: new Date(Date.now() - 60 * 60 * 1000) },
    { id: 5, user: "Miguel", action: "updated notes for", target: "Park Hyatt Tokyo", time: "2h ago", timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) },
    { id: 6, user: "Camille", action: "marked as confirmed", target: "Kamimura dinner reservation", time: "3h ago", timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000) },
    { id: 7, user: "AI Agent", action: "suggested adding", target: "teamLab Borderless to itinerary", time: "4h ago", timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000) },
    { id: 8, user: "Miguel", action: "purchased", target: "14-day JR Pass (¥50,000 × 2)", time: "1d ago", timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) },
];

const initialMapPins: MapPin[] = [
    // Day 2: Arrival in Tokyo
    { id: 1, name: "Narita Airport Terminal 2", location: "Chiba, Japan", lat: 35.7720, lng: 140.3929, type: "Flight", day: "Day 2", notes: "Arrival 4:05 PM. Pick up Pocket WiFi & Suica cards." },
    { id: 2, name: "Park Hyatt Tokyo", location: "Shinjuku, Tokyo", lat: 35.6855, lng: 139.6906, type: "Hotel", day: "Day 2-4", notes: "52nd floor Park Suite. Lost in Translation hotel. 3 nights." },
    { id: 3, name: "Omoide Yokocho", location: "Shinjuku, Tokyo", lat: 35.6938, lng: 139.6997, type: "Food", day: "Day 2", notes: "Memory Lane yakitori. Cash only!" },
    
    // Day 3: Shibuya & Harajuku
    { id: 4, name: "Meiji Shrine", location: "Harajuku, Tokyo", lat: 35.6764, lng: 139.6993, type: "Sightseeing", day: "Day 3", notes: "Peaceful Shinto shrine in forest. Free entry." },
    { id: 5, name: "Takeshita Street", location: "Harajuku, Tokyo", lat: 35.6702, lng: 139.7027, type: "Sightseeing", day: "Day 3", notes: "Kawaii fashion street. Rainbow cotton candy!" },
    { id: 6, name: "Afuri Ramen", location: "Harajuku, Tokyo", lat: 35.6695, lng: 139.7050, type: "Food", day: "Day 3", notes: "Famous yuzu shio ramen" },
    { id: 7, name: "Shibuya Crossing", location: "Shibuya, Tokyo", lat: 35.6595, lng: 139.7004, type: "Sightseeing", day: "Day 3", notes: "World's busiest intersection!" },
    { id: 8, name: "Shibuya Sky", location: "Shibuya, Tokyo", lat: 35.6580, lng: 139.7016, type: "Activity", day: "Day 3", notes: "360° rooftop views. Sunset time slot booked." },
    
    // Day 4: Asakusa & Akihabara
    { id: 9, name: "Senso-ji Temple", location: "Asakusa, Tokyo", lat: 35.7148, lng: 139.7967, type: "Sightseeing", day: "Day 4", notes: "Tokyo's oldest temple. Nakamise shopping street." },
    { id: 10, name: "Wargo Kimono Rental", location: "Asakusa, Tokyo", lat: 35.7118, lng: 139.7950, type: "Activity", day: "Day 4", notes: "Kimono rental experience. Return by 5 PM." },
    { id: 11, name: "Akihabara Electric Town", location: "Akihabara, Tokyo", lat: 35.7023, lng: 139.7745, type: "Sightseeing", day: "Day 4", notes: "Electronics & anime district. Yodobashi Camera!" },
    { id: 12, name: "Gonpachi Nishi-Azabu", location: "Nishi-Azabu, Tokyo", lat: 35.6590, lng: 139.7266, type: "Food", day: "Day 4", notes: "Kill Bill restaurant. Reservation 7 PM." },
    
    // Day 5-8: Niseko
    { id: 13, name: "Haneda Airport", location: "Tokyo, Japan", lat: 35.5494, lng: 139.7798, type: "Flight", day: "Day 5", notes: "ANA flight to New Chitose" },
    { id: 14, name: "New Chitose Airport", location: "Hokkaido, Japan", lat: 42.7752, lng: 141.6925, type: "Flight", day: "Day 5", notes: "Arrival for Niseko transfer" },
    { id: 15, name: "Yuki House Airbnb", location: "Niseko Hirafu, Hokkaido", lat: 42.8614, lng: 140.6983, type: "Hotel", day: "Day 5-8", notes: "Ski-in/ski-out chalet. Hot tub! 4 nights." },
    { id: 16, name: "Grand Hirafu Ski Resort", location: "Niseko, Hokkaido", lat: 42.8580, lng: 140.6944, type: "Activity", day: "Day 6-8", notes: "Legendary powder skiing! All-mountain pass." },
    { id: 17, name: "Kamimura Restaurant", location: "Niseko Hirafu", lat: 42.8620, lng: 140.6970, type: "Food", day: "Day 6", notes: "Michelin-starred French-Japanese fusion" },
    { id: 18, name: "Yukoro Onsen", location: "Niseko, Hokkaido", lat: 42.8520, lng: 140.6890, type: "Activity", day: "Day 7", notes: "Traditional hot spring. Tattoo-friendly." },
    
    // Day 8-9: Sapporo
    { id: 19, name: "JR Tower Hotel Nikko", location: "Sapporo, Hokkaido", lat: 43.0687, lng: 141.3508, type: "Hotel", day: "Day 8", notes: "1 night. Connected to JR Station." },
    { id: 20, name: "Sapporo Ramen Alley", location: "Susukino, Sapporo", lat: 43.0544, lng: 141.3526, type: "Food", day: "Day 8", notes: "Famous miso ramen street" },
    { id: 21, name: "Nijo Fish Market", location: "Sapporo, Hokkaido", lat: 43.0611, lng: 141.3540, type: "Food", day: "Day 9", notes: "Fresh seafood breakfast. Kaisendon!" },
    
    // Day 9-12: Kyoto
    { id: 22, name: "The Machiya Residence", location: "Gion, Kyoto", lat: 35.0037, lng: 135.7780, type: "Hotel", day: "Day 9-12", notes: "100-year-old renovated townhouse. 4 nights." },
    { id: 23, name: "Gion District", location: "Gion, Kyoto", lat: 35.0045, lng: 135.7760, type: "Sightseeing", day: "Day 9", notes: "Geisha district. Walk Hanamikoji Street at dusk." },
    { id: 24, name: "Gion Karyo", location: "Gion, Kyoto", lat: 35.0048, lng: 135.7765, type: "Food", day: "Day 9", notes: "Kaiseki dinner. Private tatami room." },
    { id: 25, name: "Fushimi Inari Shrine", location: "Fushimi, Kyoto", lat: 34.9671, lng: 135.7727, type: "Sightseeing", day: "Day 10", notes: "10,000 torii gates. Go at sunrise!" },
    { id: 26, name: "Kinkaku-ji Golden Pavilion", location: "Kita, Kyoto", lat: 35.0394, lng: 135.7292, type: "Sightseeing", day: "Day 10", notes: "Iconic gold-leaf temple" },
    { id: 27, name: "Arashiyama Bamboo Grove", location: "Arashiyama, Kyoto", lat: 35.0168, lng: 135.6713, type: "Sightseeing", day: "Day 10", notes: "Magical bamboo forest path" },
    { id: 28, name: "Kiyomizu-dera Temple", location: "Higashiyama, Kyoto", lat: 34.9949, lng: 135.7850, type: "Sightseeing", day: "Day 12", notes: "Famous wooden terrace temple" },
    
    // Day 11: Nara Day Trip
    { id: 29, name: "Nara Park", location: "Nara, Japan", lat: 34.6851, lng: 135.8430, type: "Sightseeing", day: "Day 11", notes: "1,200 friendly deer! Buy crackers for ¥200" },
    { id: 30, name: "Todai-ji Temple", location: "Nara, Japan", lat: 34.6890, lng: 135.8398, type: "Sightseeing", day: "Day 11", notes: "World's largest bronze Buddha" },
    
    // Day 12-13: Back to Tokyo
    { id: 31, name: "Aman Tokyo", location: "Otemachi, Tokyo", lat: 35.6872, lng: 139.7645, type: "Hotel", day: "Day 12-13", notes: "Corner Suite 33F. Final 2 nights. Imperial Palace views." },
    { id: 32, name: "Imperial Palace East Gardens", location: "Chiyoda, Tokyo", lat: 35.6852, lng: 139.7528, type: "Sightseeing", day: "Day 12", notes: "Free entry. Beautiful gardens." },
    { id: 33, name: "Sukiyabashi Jiro Roppongi", location: "Roppongi, Tokyo", lat: 35.6624, lng: 139.7310, type: "Food", day: "Day 12", notes: "Omakase sushi. ¥33,000/person. Once in a lifetime!" },
    { id: 34, name: "Tsukiji Outer Market", location: "Tsukiji, Tokyo", lat: 35.6654, lng: 139.7707, type: "Food", day: "Day 13", notes: "Final breakfast in Japan. Fresh sushi!" },
    { id: 35, name: "Ginza Shopping District", location: "Ginza, Tokyo", lat: 35.6717, lng: 139.7649, type: "Activity", day: "Day 13", notes: "Last-minute shopping. Tax-free with passport." },
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
