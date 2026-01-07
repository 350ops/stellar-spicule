import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create a lazy-initialized Supabase client to handle build-time when env vars aren't available
let _supabase: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient => {
    if (!_supabase) {
        if (!supabaseUrl || !supabaseAnonKey) {
            throw new Error('Supabase URL and Anon Key are required. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.');
        }
        _supabase = createClient(supabaseUrl, supabaseAnonKey);
    }
    return _supabase;
};

// Internal helper - all functions below use this
const supabase = () => getSupabase();

// ============================================
// Database Types
// ============================================
export interface DbTrip {
    id: string;
    name: string;
    description: string | null;
    start_date: string | null;
    end_date: string | null;
    cover_image: string | null;
    created_at: string;
    updated_at: string;
}

export interface DbDay {
    id: string;
    trip_id: string;
    date: string;
    day_label: string;
    location: string | null;
    sort_order: number;
    created_at: string;
    updated_at: string;
}

export interface DbItineraryItem {
    id: string;
    day_id: string;
    trip_id: string;
    time: string;
    title: string;
    type: string;
    location: string | null;
    status: string;
    duration: string | null;
    description: string | null;
    assignees: string[];
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
    sort_order: number;
    created_at: string;
    updated_at: string;
}

export interface DbMapPin {
    id: string;
    trip_id: string;
    name: string;
    location: string | null;
    lat: number;
    lng: number;
    type: string | null;
    day_label: string | null;
    notes: string | null;
    linked_item_id: string | null;
    created_at: string;
    updated_at: string;
}

export interface DbPlace {
    id: string;
    trip_id: string;
    name: string;
    location: string | null;
    image: string | null;
    tag: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

export interface DbActivity {
    id: string;
    trip_id: string;
    user_name: string;
    action: string;
    target: string;
    created_at: string;
}

// ============================================
// Trip Operations
// ============================================
export async function getTrip(tripId: string) {
    const { data, error } = await supabase()
        .from('trips')
        .select('*')
        .eq('id', tripId)
        .single();
    
    if (error) throw error;
    return data as DbTrip;
}

export async function getTrips() {
    const { data, error } = await supabase()
        .from('trips')
        .select('*')
        .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as DbTrip[];
}

// ============================================
// Day Operations
// ============================================
export async function getDays(tripId: string) {
    const { data, error } = await supabase()
        .from('days')
        .select('*')
        .eq('trip_id', tripId)
        .order('sort_order', { ascending: true });
    
    if (error) throw error;
    return data as DbDay[];
}

export async function getDayByDate(tripId: string, date: string) {
    const { data, error } = await supabase
        .from('days')
        .select('*')
        .eq('trip_id', tripId)
        .eq('date', date)
        .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data as DbDay | null;
}

export async function getDayByLabel(tripId: string, dayLabel: string) {
    const { data, error } = await supabase
        .from('days')
        .select('*')
        .eq('trip_id', tripId)
        .ilike('day_label', dayLabel)
        .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data as DbDay | null;
}

// ============================================
// Itinerary Item Operations
// ============================================
export async function getItineraryItems(tripId: string) {
    const { data, error } = await supabase
        .from('itinerary_items')
        .select('*')
        .eq('trip_id', tripId)
        .order('sort_order', { ascending: true });
    
    if (error) throw error;
    return data as DbItineraryItem[];
}

export async function getItineraryItemsByDay(dayId: string) {
    const { data, error } = await supabase
        .from('itinerary_items')
        .select('*')
        .eq('day_id', dayId)
        .order('sort_order', { ascending: true });
    
    if (error) throw error;
    return data as DbItineraryItem[];
}

export async function createItineraryItem(item: Omit<DbItineraryItem, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
        .from('itinerary_items')
        .insert(item)
        .select()
        .single();
    
    if (error) throw error;
    return data as DbItineraryItem;
}

export async function updateItineraryItem(itemId: string, updates: Partial<DbItineraryItem>) {
    const { data, error } = await supabase
        .from('itinerary_items')
        .update(updates)
        .eq('id', itemId)
        .select()
        .single();
    
    if (error) throw error;
    return data as DbItineraryItem;
}

export async function deleteItineraryItem(itemId: string) {
    const { error } = await supabase
        .from('itinerary_items')
        .delete()
        .eq('id', itemId);
    
    if (error) throw error;
}

// ============================================
// Map Pin Operations
// ============================================
export async function getMapPins(tripId: string) {
    const { data, error } = await supabase
        .from('map_pins')
        .select('*')
        .eq('trip_id', tripId);
    
    if (error) throw error;
    return data as DbMapPin[];
}

export async function createMapPin(pin: Omit<DbMapPin, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
        .from('map_pins')
        .insert(pin)
        .select()
        .single();
    
    if (error) throw error;
    return data as DbMapPin;
}

export async function updateMapPin(pinId: string, updates: Partial<DbMapPin>) {
    const { data, error } = await supabase
        .from('map_pins')
        .update(updates)
        .eq('id', pinId)
        .select()
        .single();
    
    if (error) throw error;
    return data as DbMapPin;
}

export async function deleteMapPin(pinId: string) {
    const { error } = await supabase
        .from('map_pins')
        .delete()
        .eq('id', pinId);
    
    if (error) throw error;
}

// ============================================
// Places Operations
// ============================================
export async function getPlaces(tripId: string) {
    const { data, error } = await supabase
        .from('places')
        .select('*')
        .eq('trip_id', tripId);
    
    if (error) throw error;
    return data as DbPlace[];
}

// ============================================
// Activity Operations
// ============================================
export async function getActivities(tripId: string, limit = 20) {
    const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('trip_id', tripId)
        .order('created_at', { ascending: false })
        .limit(limit);
    
    if (error) throw error;
    return data as DbActivity[];
}

export async function createActivity(activity: Omit<DbActivity, 'id' | 'created_at'>) {
    const { data, error } = await supabase
        .from('activities')
        .insert(activity)
        .select()
        .single();
    
    if (error) throw error;
    return data as DbActivity;
}

// ============================================
// Full Trip Data with Nested Structure
// ============================================
export interface FullTripData {
    trip: DbTrip;
    days: (DbDay & { items: DbItineraryItem[] })[];
    mapPins: DbMapPin[];
    places: DbPlace[];
    activities: DbActivity[];
}

export async function getFullTripData(tripId: string): Promise<FullTripData> {
    const [trip, days, items, mapPins, places, activities] = await Promise.all([
        getTrip(tripId),
        getDays(tripId),
        getItineraryItems(tripId),
        getMapPins(tripId),
        getPlaces(tripId),
        getActivities(tripId),
    ]);

    // Group items by day
    const daysWithItems = days.map(day => ({
        ...day,
        items: items.filter(item => item.day_id === day.id).sort((a, b) => a.sort_order - b.sort_order),
    }));

    return {
        trip,
        days: daysWithItems,
        mapPins,
        places,
        activities,
    };
}

// ============================================
// Real-time Subscriptions
// ============================================
export function subscribeToItineraryChanges(
    tripId: string,
    onInsert: (item: DbItineraryItem) => void,
    onUpdate: (item: DbItineraryItem) => void,
    onDelete: (itemId: string) => void
) {
    const channel = supabase
        .channel(`itinerary-${tripId}`)
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'itinerary_items',
                filter: `trip_id=eq.${tripId}`,
            },
            (payload) => onInsert(payload.new as DbItineraryItem)
        )
        .on(
            'postgres_changes',
            {
                event: 'UPDATE',
                schema: 'public',
                table: 'itinerary_items',
                filter: `trip_id=eq.${tripId}`,
            },
            (payload) => onUpdate(payload.new as DbItineraryItem)
        )
        .on(
            'postgres_changes',
            {
                event: 'DELETE',
                schema: 'public',
                table: 'itinerary_items',
                filter: `trip_id=eq.${tripId}`,
            },
            (payload) => onDelete(payload.old.id as string)
        )
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
}

export function subscribeToActivityChanges(
    tripId: string,
    onInsert: (activity: DbActivity) => void
) {
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
            (payload) => onInsert(payload.new as DbActivity)
        )
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
}

export function subscribeToMapPinChanges(
    tripId: string,
    onInsert: (pin: DbMapPin) => void,
    onUpdate: (pin: DbMapPin) => void,
    onDelete: (pinId: string) => void
) {
    const channel = supabase
        .channel(`map-pins-${tripId}`)
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'map_pins',
                filter: `trip_id=eq.${tripId}`,
            },
            (payload) => onInsert(payload.new as DbMapPin)
        )
        .on(
            'postgres_changes',
            {
                event: 'UPDATE',
                schema: 'public',
                table: 'map_pins',
                filter: `trip_id=eq.${tripId}`,
            },
            (payload) => onUpdate(payload.new as DbMapPin)
        )
        .on(
            'postgres_changes',
            {
                event: 'DELETE',
                schema: 'public',
                table: 'map_pins',
                filter: `trip_id=eq.${tripId}`,
            },
            (payload) => onDelete(payload.old.id as string)
        )
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
}

