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
    data?: Record<string, unknown>;
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
    id: string;
    name: string;
    location: string;
    lat: number;
    lng: number;
    type: string;
    day?: string;
    notes?: string;
    linkedItemId?: string; // Link to itinerary item if auto-generated
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
    updateMapPin: (id: string, updates: Partial<MapPin>) => void;
    deleteMapPin: (id: string) => void;
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
        date: "Jan 18",
        day: "Day 1",
        location: "Arrive Osaka",
        items: [
            { id: 1, time: "11:30 AM", title: "Arrive Kansai Airport", type: "Arrival", location: "KIX Terminal 1", status: "confirmed", assignees: ["C", "M"], day: "Day 1", date: "Jan 18", description: "Immigration & customs ~45 mins. Pick up Pocket WiFi at arrivals. Get ICOCA cards from JR counter.", flightNumber: "JL 060", carrier: "Japan Airlines", arrivalLocation: "KIX" },
            { id: 2, time: "1:00 PM", title: "Nankai Rapi:t to Namba", type: "Train", duration: "40m", location: "KIX → Namba", status: "confirmed", assignees: ["C", "M"], day: "Day 1", date: "Jan 18", description: "Stylish limited express train to central Osaka. Reserved seats in futuristic blue train.", confirmationNumber: "RAPIT-1801", price: "¥1,450 × 2" },
            { id: 3, time: "2:00 PM", title: "Check-in: The St. Regis Osaka", type: "Hotel", location: "Midosuji, Osaka", status: "confirmed", assignees: ["C", "M"], day: "Day 1", date: "Jan 18", description: "Luxury hotel on Midosuji Boulevard. Grand Deluxe Room, 20th floor. 2 nights. Butler service included.", confirmationNumber: "STR-2026-1801", price: "¥68,000/night", bookingUrl: "https://marriott.com" },
            { id: 4, time: "4:00 PM", title: "Explore Shinsaibashi & Amerikamura", type: "Sightseeing", duration: "2h", location: "Shinsaibashi, Osaka", status: "idea", assignees: ["C", "M"], day: "Day 1", date: "Jan 18", description: "Osaka's premier shopping arcade. American Village for vintage clothing and street fashion." },
            { id: 5, time: "7:00 PM", title: "Dinner at Dotonbori", type: "Food", location: "Dotonbori, Osaka", status: "booked", assignees: ["C", "M"], day: "Day 1", date: "Jan 18", description: "Iconic neon-lit food street! Try takoyaki at Kukuru, okonomiyaki at Mizuno (est. 1945), and end with gyoza at Chao Chao.", price: "~¥5,000/person" },
        ],
    },
    {
        date: "Jan 19",
        day: "Day 2",
        location: "Osaka (Full Day)",
        items: [
            { id: 6, time: "9:00 AM", title: "Osaka Castle", type: "Sightseeing", duration: "2h", location: "Chuo-ku, Osaka", status: "confirmed", assignees: ["C", "M"], day: "Day 2", date: "Jan 19", description: "Historic castle surrounded by moat and park. ¥600 entry to main tower. Great views from 8th floor observation deck." },
            { id: 7, time: "11:30 AM", title: "Kuromon Market", type: "Food", duration: "1h 30m", location: "Nipponbashi, Osaka", status: "confirmed", assignees: ["C", "M"], day: "Day 2", date: "Jan 19", description: "Osaka's Kitchen - 170+ years old! Fresh seafood, grilled wagyu skewers, and uni. Arrive hungry!" },
            { id: 8, time: "1:30 PM", title: "Shinsekai District", type: "Sightseeing", duration: "2h", location: "Shinsekai, Osaka", status: "idea", assignees: ["C", "M"], day: "Day 2", date: "Jan 19", description: "Retro neighborhood with Tsutenkaku Tower. Try kushikatsu (deep-fried skewers) - no double-dipping!" },
            { id: 9, time: "4:00 PM", title: "Spa World", type: "Activity", duration: "3h", location: "Shinsekai, Osaka", status: "idea", assignees: ["C", "M"], day: "Day 2", date: "Jan 19", description: "Huge onsen theme park with baths from around the world. Zones rotate by gender daily. ¥1,500 entry." },
            { id: 10, time: "7:30 PM", title: "Dinner at Ajinoya", type: "Food", location: "Namba, Osaka", status: "booked", assignees: ["C", "M"], day: "Day 2", date: "Jan 19", description: "Best okonomiyaki in Osaka since 1965. Try the specialty mix with pork and squid. Cash only.", confirmationNumber: "AJIN-1901" },
        ],
    },
    {
        date: "Jan 20",
        day: "Day 3",
        location: "Osaka → Kyoto",
        items: [
            { id: 11, time: "9:30 AM", title: "Train to Kyoto", type: "Train", duration: "30m", location: "Osaka → Kyoto", status: "confirmed", assignees: ["C", "M"], day: "Day 3", date: "Jan 20", description: "JR Special Rapid from Osaka Station. Frequent departures every 15 mins.", price: "¥570 × 2" },
            { id: 12, time: "10:30 AM", title: "Check-in: The Machiya Residence", type: "Airbnb", location: "Gion, Kyoto", status: "confirmed", assignees: ["C", "M"], day: "Day 3", date: "Jan 20", description: "Renovated 100-year-old machiya townhouse. Traditional tatami rooms, private garden. Walking distance to Gion. 3 nights. Host: Yuki-san.", confirmationNumber: "ABNB-MACH-2026", price: "¥28,000/night", bookingUrl: "https://airbnb.com/rooms/87654321" },
            { id: 13, time: "12:00 PM", title: "Lunch at Gion Nanba", type: "Food", location: "Gion, Kyoto", status: "booked", assignees: ["C", "M"], day: "Day 3", date: "Jan 20", description: "Famous soba restaurant in a traditional townhouse. Try the cold soba with tempura.", confirmationNumber: "NANBA-2001" },
            { id: 14, time: "2:00 PM", title: "Walk through Gion District", type: "Sightseeing", duration: "2h", location: "Gion, Kyoto", status: "confirmed", assignees: ["C", "M"], day: "Day 3", date: "Jan 20", description: "Explore geisha district. Walk Hanamikoji Street. Might spot a geiko (geisha) or maiko (apprentice)." },
            { id: 15, time: "4:30 PM", title: "Yasaka Shrine", type: "Sightseeing", duration: "1h", location: "Gion, Kyoto", status: "idea", assignees: ["C", "M"], day: "Day 3", date: "Jan 20", description: "Beautiful shrine at the end of Shijo street. Free entry. Great at dusk with lanterns lit." },
            { id: 16, time: "7:00 PM", title: "Dinner at Gion Karyo", type: "Food", location: "Gion, Kyoto", status: "booked", assignees: ["C", "M"], day: "Day 3", date: "Jan 20", description: "Traditional kaiseki dinner in private tatami room. Multi-course seasonal menu.", confirmationNumber: "KARYO-2001", price: "¥15,000/person" },
        ],
    },
    {
        date: "Jan 21",
        day: "Day 4",
        location: "Kyoto (Temples & Bamboo)",
        items: [
            { id: 17, time: "6:30 AM", title: "Fushimi Inari Shrine (Sunrise)", type: "Sightseeing", duration: "2h", location: "Fushimi, Kyoto", status: "confirmed", assignees: ["C", "M"], day: "Day 4", date: "Jan 21", description: "Famous 10,000 vermillion torii gates. Go early to avoid crowds! Hike to the top takes ~2 hours. Free entry." },
            { id: 18, time: "9:30 AM", title: "Breakfast at Vermillion Cafe", type: "Food", location: "Near Fushimi Inari", status: "idea", assignees: ["C", "M"], day: "Day 4", date: "Jan 21", description: "Cute cafe with Inari views. Great coffee and Japanese breakfast set." },
            { id: 19, time: "11:00 AM", title: "Kinkaku-ji (Golden Pavilion)", type: "Sightseeing", duration: "1h", location: "Kita, Kyoto", status: "confirmed", assignees: ["C", "M"], day: "Day 4", date: "Jan 21", description: "Iconic gold-leaf covered temple reflected in the pond. Entry: ¥500. Can get crowded midday." },
            { id: 20, time: "1:00 PM", title: "Lunch at Shoraian", type: "Food", location: "Arashiyama, Kyoto", status: "booked", assignees: ["C", "M"], day: "Day 4", date: "Jan 21", description: "Beautiful riverside tofu restaurant. River views from tatami seating.", confirmationNumber: "SHORA-2101", price: "¥3,500/person" },
            { id: 21, time: "2:30 PM", title: "Arashiyama Bamboo Grove", type: "Sightseeing", duration: "1h", location: "Arashiyama, Kyoto", status: "confirmed", assignees: ["C", "M"], day: "Day 4", date: "Jan 21", description: "Iconic bamboo forest path. Walk to Tenryu-ji Temple gardens (¥500)." },
            { id: 22, time: "4:00 PM", title: "Monkey Park Iwatayama", type: "Activity", duration: "1h 30m", location: "Arashiyama, Kyoto", status: "idea", assignees: ["C", "M"], day: "Day 4", date: "Jan 21", description: "Hilltop park with wild Japanese macaques. 20-min uphill walk. ¥550 entry. Great city views." },
            { id: 23, time: "7:00 PM", title: "Dinner at Pontocho Alley", type: "Food", location: "Pontocho, Kyoto", status: "idea", assignees: ["C", "M"], day: "Day 4", date: "Jan 21", description: "Atmospheric narrow alley along Kamo River. Many restaurants with riverside seating." },
        ],
    },
    {
        date: "Jan 22",
        day: "Day 5",
        location: "Nara Day Trip",
        items: [
            { id: 24, time: "8:30 AM", title: "Train to Nara", type: "Train", duration: "45m", location: "Kyoto → Nara", status: "confirmed", assignees: ["C", "M"], day: "Day 5", date: "Jan 22", description: "JR Nara Line from Kyoto Station. Every 15-20 minutes.", price: "¥720 × 2" },
            { id: 25, time: "9:30 AM", title: "Nara Park & Deer", type: "Sightseeing", duration: "2h", location: "Nara", status: "confirmed", assignees: ["C", "M"], day: "Day 5", date: "Jan 22", description: "1,200+ friendly deer roam freely! Buy shika senbei (deer crackers) for ¥200. Bow to the deer, they bow back!" },
            { id: 26, time: "11:30 AM", title: "Todai-ji Temple", type: "Sightseeing", duration: "1h 30m", location: "Nara", status: "confirmed", assignees: ["C", "M"], day: "Day 5", date: "Jan 22", description: "Houses the world's largest bronze Buddha. Entry: ¥600. Try crawling through the pillar hole for enlightenment!" },
            { id: 27, time: "1:30 PM", title: "Lunch at Mellow Cafe", type: "Food", location: "Nara", status: "idea", assignees: ["C", "M"], day: "Day 5", date: "Jan 22", description: "Cozy cafe near Nara Park. Great desserts and light lunch options." },
            { id: 28, time: "3:00 PM", title: "Kasuga Grand Shrine", type: "Sightseeing", duration: "1h", location: "Nara", status: "idea", assignees: ["C", "M"], day: "Day 5", date: "Jan 22", description: "Shinto shrine famous for hundreds of bronze and stone lanterns. Beautiful forest path approach." },
            { id: 29, time: "5:00 PM", title: "Return to Kyoto", type: "Train", duration: "45m", location: "Nara → Kyoto", status: "confirmed", assignees: ["C", "M"], day: "Day 5", date: "Jan 22", description: "JR Nara Line back to Kyoto.", price: "¥720 × 2" },
            { id: 30, time: "7:00 PM", title: "Dinner at Nishiki Market Area", type: "Food", location: "Kyoto", status: "idea", assignees: ["C", "M"], day: "Day 5", date: "Jan 22", description: "Explore 'Kyoto's Kitchen' - covered market with food stalls. Try matcha desserts, pickles, and street food." },
        ],
    },
    {
        date: "Jan 23",
        day: "Day 6",
        location: "Kyoto → Tokyo",
        items: [
            { id: 31, time: "8:00 AM", title: "Tea Ceremony Experience", type: "Activity", duration: "1h 30m", location: "Gion, Kyoto", status: "booked", assignees: ["C", "M"], day: "Day 6", date: "Jan 23", description: "Traditional tea ceremony at En teahouse. Learn matcha preparation and etiquette. English explanation provided.", confirmationNumber: "EN-230126", price: "¥4,500/person" },
            { id: 32, time: "10:30 AM", title: "Kiyomizu-dera Temple", type: "Sightseeing", duration: "1h 30m", location: "Higashiyama, Kyoto", status: "confirmed", assignees: ["C", "M"], day: "Day 6", date: "Jan 23", description: "Famous wooden temple on hillside with panoramic views. Walk through Ninenzaka and Sannenzaka historic streets. Entry: ¥400." },
            { id: 33, time: "1:00 PM", title: "Shinkansen to Tokyo", type: "Train", duration: "2h 15m", location: "Kyoto → Tokyo", status: "confirmed", assignees: ["C", "M"], day: "Day 6", date: "Jan 23", description: "Nozomi bullet train. Reserved seats in car 8. Experience the 285 km/h speed!", carrier: "JR Tokaido Shinkansen", price: "¥14,170 × 2" },
            { id: 34, time: "4:00 PM", title: "Check-in: Park Hyatt Tokyo", type: "Hotel", location: "Shinjuku, Tokyo", status: "confirmed", assignees: ["C", "M"], day: "Day 6", date: "Jan 23", description: "Park Hyatt Tokyo (Lost in Translation hotel). Park Suite, 52nd floor. 3 nights. Globalist benefits: free breakfast.", confirmationNumber: "PHT-2026-2301", price: "¥89,000/night", bookingUrl: "https://hyatt.com" },
            { id: 35, time: "6:00 PM", title: "Walk around Shinjuku", type: "Sightseeing", duration: "1h", location: "Shinjuku, Tokyo", status: "idea", assignees: ["C", "M"], day: "Day 6", date: "Jan 23", description: "Explore the neon-lit streets of Shinjuku. See the famous Godzilla head at Toho Cinemas." },
            { id: 36, time: "8:00 PM", title: "Dinner at Omoide Yokocho", type: "Food", location: "Shinjuku, Tokyo", status: "booked", assignees: ["C", "M"], day: "Day 6", date: "Jan 23", description: "Memory Lane yakitori alley near Shinjuku Station west exit. Try Asadachi for grilled chicken skewers. Cash only!" },
        ],
    },
    {
        date: "Jan 24",
        day: "Day 7",
        location: "Tokyo (Shibuya & Harajuku)",
        items: [
            { id: 37, time: "8:00 AM", title: "Breakfast at New York Grill", type: "Food", location: "Park Hyatt, 52F", status: "confirmed", assignees: ["C", "M"], day: "Day 7", date: "Jan 24", description: "Included with Globalist status. Amazing city views. Dress code: Smart casual." },
            { id: 38, time: "10:00 AM", title: "Meiji Shrine", type: "Sightseeing", duration: "1h 30m", location: "Harajuku, Tokyo", status: "confirmed", assignees: ["C", "M"], day: "Day 7", date: "Jan 24", description: "Tokyo's most famous Shinto shrine. Walk through the torii gates in the forest. Write wishes on ema wooden plaques." },
            { id: 39, time: "12:00 PM", title: "Takeshita Street", type: "Sightseeing", duration: "1h", location: "Harajuku, Tokyo", status: "idea", assignees: ["C"], day: "Day 7", date: "Jan 24", description: "Famous pedestrian shopping street. Try a rainbow cotton candy or crepe. Lots of kawaii shops and vintage stores." },
            { id: 40, time: "1:30 PM", title: "Lunch at Afuri Ramen", type: "Food", location: "Harajuku, Tokyo", status: "idea", assignees: ["C", "M"], day: "Day 7", date: "Jan 24", description: "Famous yuzu shio ramen. Usually 20-30 min wait. Vegetarian options available." },
            { id: 41, time: "3:00 PM", title: "Shibuya Crossing", type: "Sightseeing", duration: "30m", location: "Shibuya, Tokyo", status: "confirmed", assignees: ["C", "M"], day: "Day 7", date: "Jan 24", description: "World's busiest pedestrian crossing. Photo from Starbucks 2F or Shibuya Sky rooftop." },
            { id: 42, time: "4:00 PM", title: "Shibuya Sky Observation", type: "Activity", duration: "1h 30m", location: "Shibuya Scramble Square", status: "booked", assignees: ["C", "M"], day: "Day 7", date: "Jan 24", description: "360° rooftop observation deck on 46th floor. Sunset time slot booked. Great for photos!", confirmationNumber: "SKY-2026-2401", price: "¥2,000 × 2" },
            { id: 43, time: "7:00 PM", title: "Dinner at Uobei Sushi", type: "Food", location: "Shibuya, Tokyo", status: "idea", assignees: ["C", "M"], day: "Day 7", date: "Jan 24", description: "Fun conveyor belt sushi with bullet train delivery. Order via touchscreen. Budget: ¥2,500/person." },
        ],
    },
    {
        date: "Jan 25",
        day: "Day 8",
        location: "Tokyo (Asakusa & Akihabara)",
        items: [
            { id: 44, time: "9:00 AM", title: "Senso-ji Temple", type: "Sightseeing", duration: "2h", location: "Asakusa, Tokyo", status: "confirmed", assignees: ["C", "M"], day: "Day 8", date: "Jan 25", description: "Tokyo's oldest temple. Enter through Kaminarimon gate with giant red lantern. Nakamise shopping street for souvenirs." },
            { id: 45, time: "11:30 AM", title: "Kimono Rental Experience", type: "Activity", duration: "4h", location: "Asakusa, Tokyo", status: "booked", assignees: ["C"], day: "Day 8", date: "Jan 25", description: "Wargo Asakusa kimono rental. Includes dressing, hair styling, accessories. Return by 5 PM.", confirmationNumber: "WARGO-2501", price: "¥6,500" },
            { id: 46, time: "12:30 PM", title: "Lunch at Asakusa Mugitoro", type: "Food", location: "Asakusa, Tokyo", status: "booked", assignees: ["C", "M"], day: "Day 8", date: "Jan 25", description: "Traditional tororo (grated yam) specialty restaurant since 1929. Reservation for 2.", confirmationNumber: "MUG-250126" },
            { id: 47, time: "3:00 PM", title: "Akihabara Electric Town", type: "Sightseeing", duration: "3h", location: "Akihabara, Tokyo", status: "idea", assignees: ["M"], day: "Day 8", date: "Jan 25", description: "Electronics and anime paradise. Visit Yodobashi Camera (8 floors!), Super Potato retro games, and maid cafes." },
            { id: 48, time: "7:00 PM", title: "Dinner at Gonpachi Nishi-Azabu", type: "Food", location: "Nishi-Azabu, Tokyo", status: "booked", assignees: ["C", "M"], day: "Day 8", date: "Jan 25", description: "The 'Kill Bill' restaurant. Traditional robatayaki. Reservation confirmed for 7 PM.", confirmationNumber: "GONP-2026-2501", price: "~¥8,000/person" },
        ],
    },
    {
        date: "Jan 26",
        day: "Day 9",
        location: "Tokyo → Home",
        items: [
            { id: 49, time: "7:30 AM", title: "Tsukiji Outer Market Breakfast", type: "Food", location: "Tsukiji, Tokyo", status: "idea", assignees: ["C", "M"], day: "Day 9", date: "Jan 26", description: "Final Japanese breakfast! Fresh sushi, tamagoyaki (egg), and matcha at the historic outer market." },
            { id: 50, time: "10:00 AM", title: "Last-minute Shopping at Ginza", type: "Activity", duration: "1h 30m", location: "Ginza, Tokyo", status: "idea", assignees: ["C", "M"], day: "Day 9", date: "Jan 26", description: "Final souvenirs at Ginza Six, Itoya stationery, or Don Quijote. Tax-free shopping with passport." },
            { id: 51, time: "12:00 PM", title: "Hotel Checkout", type: "Hotel", location: "Park Hyatt Tokyo", status: "info", assignees: ["C", "M"], day: "Day 9", date: "Jan 26", description: "Leave luggage with concierge for airport transfer." },
            { id: 52, time: "1:30 PM", title: "Narita Express to Airport", type: "Train", duration: "1h 20m", location: "Shinjuku → NRT", status: "confirmed", assignees: ["C", "M"], day: "Day 9", date: "Jan 26", description: "N'EX from Shinjuku Station to Narita Airport. Allow 3 hours before flight.", price: "¥3,250 × 2" },
            { id: 53, time: "5:55 PM", title: "Flight Home - JL 006", type: "Departure", duration: "12h 50m", location: "NRT Terminal 2", status: "confirmed", assignees: ["C", "M"], day: "Day 9", date: "Jan 26", description: "Japan Airlines direct to JFK. Arrives same day 5:45 PM EST. Premium Economy. Sayonara, Japan!", flightNumber: "JL 006", carrier: "Japan Airlines", departureTime: "5:55 PM", arrivalTime: "5:45 PM (same day)", departureLocation: "NRT", arrivalLocation: "JFK", seatClass: "Premium Economy", price: "$2,847 × 2", confirmationNumber: "JALTYO2026CM" },
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
        title: "Add teamLab Borderless to Day 7",
        description: "The new Azabudai Hills location has shorter wait times in the afternoon. I can book tickets for Jan 24 at 2 PM (¥3,800/person).",
        confidence: 94,
        status: "pending",
        type: "itinerary",
        data: {
            day: "Jan 24",
            item: { title: "teamLab Borderless", type: "Activity", location: "Azabudai Hills, Tokyo", time: "2:00 PM" }
        }
    },
    {
        id: 2,
        title: "Add Osaka Aquarium Kaiyukan to Day 2",
        description: "One of Japan's largest aquariums with a stunning whale shark exhibit. Perfect for the afternoon on Jan 19. ¥2,700/person.",
        confidence: 87,
        status: "pending",
        type: "itinerary",
    },
    {
        id: 3,
        title: "Reserve Robot Restaurant for Tokyo night",
        description: "The famous Robot Restaurant in Shinjuku has availability on Jan 25 at 7:30 PM. ¥8,500/person includes one drink. Very touristy but fun!",
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
    { id: 1, user: "Camille", action: "confirmed reservation at", target: "Gion Karyo (Jan 20)", time: "5m ago", timestamp: new Date(Date.now() - 5 * 60 * 1000) },
    { id: 2, user: "Miguel", action: "booked hotel", target: "St. Regis Osaka (Jan 18-19)", time: "23m ago", timestamp: new Date(Date.now() - 23 * 60 * 1000) },
    { id: 3, user: "AI Agent", action: "found better price for", target: "Nankai Rapi:t tickets", time: "45m ago", timestamp: new Date(Date.now() - 45 * 60 * 1000) },
    { id: 4, user: "Camille", action: "booked tea ceremony at", target: "En Teahouse Gion (Jan 23)", time: "1h ago", timestamp: new Date(Date.now() - 60 * 60 * 1000) },
    { id: 5, user: "Miguel", action: "updated notes for", target: "Park Hyatt Tokyo", time: "2h ago", timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) },
    { id: 6, user: "Camille", action: "marked as confirmed", target: "Gonpachi dinner (Jan 25)", time: "3h ago", timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000) },
    { id: 7, user: "AI Agent", action: "suggested adding", target: "teamLab Borderless to itinerary", time: "4h ago", timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000) },
    { id: 8, user: "Miguel", action: "booked Shinkansen", target: "Kyoto → Tokyo (Jan 23)", time: "1d ago", timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) },
];

const initialMapPins: MapPin[] = [
    // Day 1: Arrive Osaka (Jan 18)
    { id: "pin-1", name: "Kansai International Airport", location: "Osaka, Japan", lat: 34.4320, lng: 135.2304, type: "Arrival", day: "Day 1", notes: "Arrival 11:30 AM. Pick up Pocket WiFi & ICOCA cards." },
    { id: "pin-2", name: "The St. Regis Osaka", location: "Midosuji, Osaka", lat: 34.6846, lng: 135.4993, type: "Hotel", day: "Day 1-2", notes: "Grand Deluxe Room, 20th floor. 2 nights. Butler service." },
    { id: "pin-3", name: "Shinsaibashi Shopping Street", location: "Shinsaibashi, Osaka", lat: 34.6755, lng: 135.5022, type: "Sightseeing", day: "Day 1", notes: "Premier shopping arcade. Amerikamura nearby." },
    { id: "pin-4", name: "Dotonbori", location: "Dotonbori, Osaka", lat: 34.6687, lng: 135.5030, type: "Food", day: "Day 1", notes: "Iconic food street! Takoyaki, okonomiyaki, gyoza." },
    
    // Day 2: Osaka (Jan 19)
    { id: "pin-5", name: "Osaka Castle", location: "Chuo-ku, Osaka", lat: 34.6873, lng: 135.5259, type: "Sightseeing", day: "Day 2", notes: "Historic castle. ¥600 entry. Great views from 8th floor." },
    { id: "pin-6", name: "Kuromon Market", location: "Nipponbashi, Osaka", lat: 34.6627, lng: 135.5062, type: "Food", day: "Day 2", notes: "Osaka's Kitchen - fresh seafood, wagyu, uni!" },
    { id: "pin-7", name: "Shinsekai District", location: "Shinsekai, Osaka", lat: 34.6523, lng: 135.5063, type: "Sightseeing", day: "Day 2", notes: "Retro area with Tsutenkaku Tower. Try kushikatsu!" },
    { id: "pin-8", name: "Spa World", location: "Shinsekai, Osaka", lat: 34.6517, lng: 135.5056, type: "Activity", day: "Day 2", notes: "Huge onsen theme park. ¥1,500 entry." },
    { id: "pin-9", name: "Ajinoya", location: "Namba, Osaka", lat: 34.6660, lng: 135.5010, type: "Food", day: "Day 2", notes: "Best okonomiyaki since 1965. Cash only." },
    
    // Day 3: Osaka → Kyoto (Jan 20)
    { id: "pin-10", name: "The Machiya Residence", location: "Gion, Kyoto", lat: 35.0037, lng: 135.7780, type: "Airbnb", day: "Day 3-5", notes: "100-year-old renovated townhouse. 3 nights." },
    { id: "pin-11", name: "Gion Nanba", location: "Gion, Kyoto", lat: 35.0040, lng: 135.7755, type: "Food", day: "Day 3", notes: "Famous soba in traditional townhouse." },
    { id: "pin-12", name: "Gion District", location: "Gion, Kyoto", lat: 35.0045, lng: 135.7760, type: "Sightseeing", day: "Day 3", notes: "Geisha district. Walk Hanamikoji Street at dusk." },
    { id: "pin-13", name: "Yasaka Shrine", location: "Gion, Kyoto", lat: 35.0036, lng: 135.7785, type: "Sightseeing", day: "Day 3", notes: "Beautiful shrine at end of Shijo street. Free entry." },
    { id: "pin-14", name: "Gion Karyo", location: "Gion, Kyoto", lat: 35.0048, lng: 135.7765, type: "Food", day: "Day 3", notes: "Kaiseki dinner. Private tatami room." },
    
    // Day 4: Kyoto Temples & Bamboo (Jan 21)
    { id: "pin-15", name: "Fushimi Inari Shrine", location: "Fushimi, Kyoto", lat: 34.9671, lng: 135.7727, type: "Sightseeing", day: "Day 4", notes: "10,000 torii gates. Go at sunrise!" },
    { id: "pin-16", name: "Vermillion Cafe", location: "Near Fushimi Inari", lat: 34.9680, lng: 135.7720, type: "Food", day: "Day 4", notes: "Cute cafe with Inari views. Japanese breakfast." },
    { id: "pin-17", name: "Kinkaku-ji Golden Pavilion", location: "Kita, Kyoto", lat: 35.0394, lng: 135.7292, type: "Sightseeing", day: "Day 4", notes: "Iconic gold-leaf temple. ¥500 entry." },
    { id: "pin-18", name: "Shoraian", location: "Arashiyama, Kyoto", lat: 35.0130, lng: 135.6740, type: "Food", day: "Day 4", notes: "Riverside tofu restaurant. Beautiful views." },
    { id: "pin-19", name: "Arashiyama Bamboo Grove", location: "Arashiyama, Kyoto", lat: 35.0168, lng: 135.6713, type: "Sightseeing", day: "Day 4", notes: "Magical bamboo forest path." },
    { id: "pin-20", name: "Monkey Park Iwatayama", location: "Arashiyama, Kyoto", lat: 35.0098, lng: 135.6785, type: "Activity", day: "Day 4", notes: "Wild Japanese macaques. Great city views." },
    { id: "pin-21", name: "Pontocho Alley", location: "Pontocho, Kyoto", lat: 35.0060, lng: 135.7700, type: "Food", day: "Day 4", notes: "Atmospheric alley along Kamo River." },
    
    // Day 5: Nara Day Trip (Jan 22)
    { id: "pin-22", name: "Nara Park", location: "Nara, Japan", lat: 34.6851, lng: 135.8430, type: "Sightseeing", day: "Day 5", notes: "1,200 friendly deer! Buy crackers for ¥200." },
    { id: "pin-23", name: "Todai-ji Temple", location: "Nara, Japan", lat: 34.6890, lng: 135.8398, type: "Sightseeing", day: "Day 5", notes: "World's largest bronze Buddha. ¥600 entry." },
    { id: "pin-24", name: "Kasuga Grand Shrine", location: "Nara, Japan", lat: 34.6822, lng: 135.8478, type: "Sightseeing", day: "Day 5", notes: "Ancient shrine with hundreds of lanterns." },
    { id: "pin-25", name: "Nishiki Market", location: "Kyoto", lat: 35.0050, lng: 135.7650, type: "Food", day: "Day 5", notes: "Kyoto's Kitchen. Matcha desserts, street food." },
    
    // Day 6: Kyoto → Tokyo (Jan 23)
    { id: "pin-26", name: "En Teahouse", location: "Gion, Kyoto", lat: 35.0042, lng: 135.7752, type: "Activity", day: "Day 6", notes: "Traditional tea ceremony experience." },
    { id: "pin-27", name: "Kiyomizu-dera Temple", location: "Higashiyama, Kyoto", lat: 34.9949, lng: 135.7850, type: "Sightseeing", day: "Day 6", notes: "Famous wooden terrace temple. ¥400 entry." },
    { id: "pin-28", name: "Kyoto Station", location: "Kyoto, Japan", lat: 34.9858, lng: 135.7587, type: "Train", day: "Day 6", notes: "Shinkansen to Tokyo. 2h 15m." },
    { id: "pin-29", name: "Park Hyatt Tokyo", location: "Shinjuku, Tokyo", lat: 35.6855, lng: 139.6906, type: "Hotel", day: "Day 6-8", notes: "52nd floor Park Suite. Lost in Translation hotel. 3 nights." },
    { id: "pin-30", name: "Omoide Yokocho", location: "Shinjuku, Tokyo", lat: 35.6938, lng: 139.6997, type: "Food", day: "Day 6", notes: "Memory Lane yakitori. Cash only!" },
    
    // Day 7: Tokyo Shibuya & Harajuku (Jan 24)
    { id: "pin-31", name: "New York Grill", location: "Park Hyatt, 52F", lat: 35.6855, lng: 139.6906, type: "Food", day: "Day 7", notes: "Breakfast with city views. Globalist benefit." },
    { id: "pin-32", name: "Meiji Shrine", location: "Harajuku, Tokyo", lat: 35.6764, lng: 139.6993, type: "Sightseeing", day: "Day 7", notes: "Peaceful Shinto shrine in forest. Free entry." },
    { id: "pin-33", name: "Takeshita Street", location: "Harajuku, Tokyo", lat: 35.6702, lng: 139.7027, type: "Sightseeing", day: "Day 7", notes: "Kawaii fashion street. Rainbow cotton candy!" },
    { id: "pin-34", name: "Afuri Ramen", location: "Harajuku, Tokyo", lat: 35.6695, lng: 139.7050, type: "Food", day: "Day 7", notes: "Famous yuzu shio ramen." },
    { id: "pin-35", name: "Shibuya Crossing", location: "Shibuya, Tokyo", lat: 35.6595, lng: 139.7004, type: "Sightseeing", day: "Day 7", notes: "World's busiest intersection!" },
    { id: "pin-36", name: "Shibuya Sky", location: "Shibuya, Tokyo", lat: 35.6580, lng: 139.7016, type: "Activity", day: "Day 7", notes: "360° rooftop views. Sunset time slot booked." },
    { id: "pin-37", name: "Uobei Sushi", location: "Shibuya, Tokyo", lat: 35.6590, lng: 139.7000, type: "Food", day: "Day 7", notes: "Conveyor belt sushi. Bullet train delivery!" },
    
    // Day 8: Tokyo Asakusa & Akihabara (Jan 25)
    { id: "pin-38", name: "Senso-ji Temple", location: "Asakusa, Tokyo", lat: 35.7148, lng: 139.7967, type: "Sightseeing", day: "Day 8", notes: "Tokyo's oldest temple. Nakamise shopping street." },
    { id: "pin-39", name: "Wargo Kimono Rental", location: "Asakusa, Tokyo", lat: 35.7118, lng: 139.7950, type: "Activity", day: "Day 8", notes: "Kimono rental experience. Return by 5 PM." },
    { id: "pin-40", name: "Asakusa Mugitoro", location: "Asakusa, Tokyo", lat: 35.7135, lng: 139.7955, type: "Food", day: "Day 8", notes: "Tororo specialty restaurant since 1929." },
    { id: "pin-41", name: "Akihabara Electric Town", location: "Akihabara, Tokyo", lat: 35.7023, lng: 139.7745, type: "Sightseeing", day: "Day 8", notes: "Electronics & anime district. Yodobashi Camera!" },
    { id: "pin-42", name: "Gonpachi Nishi-Azabu", location: "Nishi-Azabu, Tokyo", lat: 35.6590, lng: 139.7266, type: "Food", day: "Day 8", notes: "Kill Bill restaurant. Reservation 7 PM." },
    
    // Day 9: Tokyo → Home (Jan 26)
    { id: "pin-43", name: "Tsukiji Outer Market", location: "Tsukiji, Tokyo", lat: 35.6654, lng: 139.7707, type: "Food", day: "Day 9", notes: "Final breakfast in Japan. Fresh sushi!" },
    { id: "pin-44", name: "Ginza Shopping District", location: "Ginza, Tokyo", lat: 35.6717, lng: 139.7649, type: "Activity", day: "Day 9", notes: "Last-minute shopping. Tax-free with passport." },
    { id: "pin-45", name: "Narita International Airport", location: "Chiba, Japan", lat: 35.7720, lng: 140.3929, type: "Departure", day: "Day 9", notes: "JL 006 departure 5:55 PM. Sayonara Japan!" },
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
                const newItinerary = s.itinerary.map((day) => {
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
                const newPin = { ...pin, id: crypto.randomUUID() };
                const newActivity: ActivityItem = {
                    id: Date.now(),
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

export function usePlaces() {
    const store = useAppStore();
    return {
        places: store.places,
    };
}
