import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { z } from 'zod';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const maxDuration = 60;

// Check if OpenAI is configured
const isOpenAIConfigured = () => {
    return !!process.env.OPENAI_API_KEY;
};

// Check if Supabase is configured
const isSupabaseConfigured = () => {
    return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && 
              (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY));
};

// Create a simple Supabase client for server-side use
function createServerClient(): SupabaseClient | null {
    if (!isSupabaseConfigured()) {
        return null;
    }
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
}

interface TripDay {
    id: string;
    trip_id: string;
    date: string;
    day_label: string;
    location: string | null;
    day_order: number;
}

interface ItineraryItem {
    id: string;
    trip_id: string;
    day_id: string;
    time: string;
    title: string;
    type: string;
    location: string;
    status: string;
    assignees: string[];
    item_order: number;
    description?: string;
}

// Helper to parse relative dates like "tomorrow", "thursday", etc.
function parseRelativeDate(dateStr: string, tripDays: TripDay[]): string | null {
    const lower = dateStr.toLowerCase().trim();
    
    // Direct day name matching
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayIndex = dayNames.indexOf(lower);
    
    if (dayIndex !== -1) {
        // Find a day that matches this weekday
        for (const day of tripDays) {
            const dayDate = new Date(day.date + ', 2026');
            if (dayDate.getDay() === dayIndex) {
                return day.id;
            }
        }
    }
    
    // Match by day label like "day 1", "day 2"
    const dayMatch = lower.match(/day\s*(\d+)/i);
    if (dayMatch) {
        const dayNum = parseInt(dayMatch[1]);
        const found = tripDays.find(d => d.day_label.toLowerCase() === `day ${dayNum}`);
        if (found) return found.id;
    }
    
    // Match by date like "jan 18", "january 18"
    for (const day of tripDays) {
        if (day.date.toLowerCase().includes(lower) || lower.includes(day.date.toLowerCase())) {
            return day.id;
        }
    }
    
    // Tomorrow - find next day after today in the trip
    if (lower === 'tomorrow') {
        return tripDays.length > 1 ? tripDays[1].id : tripDays[0]?.id;
    }
    
    // Today
    if (lower === 'today') {
        return tripDays[0]?.id;
    }
    
    return null;
}

// Helper to parse time strings
function parseTime(timeStr: string): string {
    const lower = timeStr.toLowerCase().trim();
    
    if (lower.includes('morning') || lower.includes('breakfast')) {
        return '9:00 AM';
    }
    if (lower.includes('lunch') || lower.includes('noon')) {
        return '12:00 PM';
    }
    if (lower.includes('afternoon')) {
        return '3:00 PM';
    }
    if (lower.includes('dinner') || lower.includes('evening')) {
        return '7:00 PM';
    }
    if (lower.includes('night')) {
        return '9:00 PM';
    }
    
    const timeMatch = timeStr.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
    if (timeMatch) {
        let hours = parseInt(timeMatch[1]);
        const minutes = timeMatch[2] || '00';
        const period = timeMatch[3]?.toLowerCase();
        
        if (period === 'pm' && hours < 12) hours += 12;
        if (period === 'am' && hours === 12) hours = 0;
        
        const h = hours % 12 || 12;
        const p = hours >= 12 ? 'PM' : 'AM';
        return `${h}:${minutes} ${p}`;
    }
    
    return timeStr;
}

// Infer item type from title
function inferItemType(title: string): string {
    const lower = title.toLowerCase();
    
    if (lower.includes('breakfast') || lower.includes('lunch') || lower.includes('dinner') || 
        lower.includes('restaurant') || lower.includes('cafe') || lower.includes('food') ||
        lower.includes('eat') || lower.includes('ramen') || lower.includes('sushi')) {
        return 'Food';
    }
    if (lower.includes('flight') || lower.includes('arrive') || lower.includes('airport')) {
        return 'Flight';
    }
    if (lower.includes('train') || lower.includes('shinkansen')) {
        return 'Train';
    }
    if (lower.includes('hotel') || lower.includes('check-in') || lower.includes('check in') || lower.includes('airbnb')) {
        return 'Hotel';
    }
    if (lower.includes('temple') || lower.includes('shrine') || lower.includes('castle') || 
        lower.includes('museum') || lower.includes('park') || lower.includes('garden')) {
        return 'Sightseeing';
    }
    if (lower.includes('shopping') || lower.includes('market')) {
        return 'Activity';
    }
    
    return 'Activity';
}

// Demo trip days for when Supabase is not configured
const DEMO_TRIP_DAYS: TripDay[] = [
    { id: 'day-1', trip_id: 'demo', date: 'Jan 18', day_label: 'Day 1', location: 'Tokyo', day_order: 0 },
    { id: 'day-2', trip_id: 'demo', date: 'Jan 19', day_label: 'Day 2', location: 'Tokyo', day_order: 1 },
    { id: 'day-3', trip_id: 'demo', date: 'Jan 20', day_label: 'Day 3', location: 'Tokyo', day_order: 2 },
    { id: 'day-4', trip_id: 'demo', date: 'Jan 21', day_label: 'Day 4', location: 'Niseko', day_order: 3 },
    { id: 'day-5', trip_id: 'demo', date: 'Jan 22', day_label: 'Day 5', location: 'Niseko', day_order: 4 },
    { id: 'day-6', trip_id: 'demo', date: 'Jan 23', day_label: 'Day 6', location: 'Kyoto', day_order: 5 },
    { id: 'day-7', trip_id: 'demo', date: 'Jan 24', day_label: 'Day 7', location: 'Kyoto', day_order: 6 },
    { id: 'day-8', trip_id: 'demo', date: 'Jan 25', day_label: 'Day 8', location: 'Kyoto', day_order: 7 },
    { id: 'day-9', trip_id: 'demo', date: 'Jan 26', day_label: 'Day 9', location: 'Tokyo', day_order: 8 },
];

export async function POST(req: Request) {
    // Check if OpenAI API key is configured
    if (!isOpenAIConfigured()) {
        return new Response(
            JSON.stringify({ 
                error: 'OpenAI API key not configured',
                message: 'Please set OPENAI_API_KEY in your .env.local file to enable AI chat functionality.',
                demoResponse: "I'm currently running in demo mode without an OpenAI API key. To enable full AI functionality, please add your OPENAI_API_KEY to a .env.local file in the project root."
            }),
            { 
                status: 503, 
                headers: { 'Content-Type': 'application/json' } 
            }
        );
    }
    
    const { messages, tripId, itineraryContext } = await req.json();
    
    const supabase = createServerClient();
    const isDemoMode = !supabase;
    
    // Fetch trip days for date resolution
    let tripDays: TripDay[] = [];
    if (isDemoMode) {
        tripDays = DEMO_TRIP_DAYS;
    } else if (tripId) {
        const { data } = await supabase
            .from('trip_days')
            .select('*')
            .eq('trip_id', tripId)
            .order('day_order', { ascending: true });
        tripDays = (data as TripDay[]) || [];
    }
    
    const systemPrompt = `You are an intelligent travel assistant for a trip planning app called "HyperSpace". You help users manage their Japan trip itinerary.

CURRENT ITINERARY:
${itineraryContext || 'No itinerary data available.'}

AVAILABLE DAYS:
${tripDays.map(d => `- ${d.day_label} (${d.date}): ${d.location || 'No location set'} [ID: ${d.id}]`).join('\n')}

YOUR CAPABILITIES:
1. Add new items to the itinerary using the add_itinerary_item tool
2. Update existing items using the update_itinerary_item tool  
3. Delete items using the delete_itinerary_item tool
4. Answer questions about the trip schedule

IMPORTANT RULES:
- When the user asks to add something, use the add_itinerary_item tool
- When parsing dates like "tomorrow", "thursday", "day 3", match them to the available days above
- For times like "morning", use 9:00 AM; "lunch" use 12:00 PM; "dinner/evening" use 7:00 PM
- Infer the item type from context (Food for restaurants/cafes, Sightseeing for temples/shrines, etc.)
- Always confirm what you've done after making changes
- Be concise and helpful
- When asked about plans for a specific day, look up that day in the itinerary and summarize it

TRIP CONTEXT:
- This is a Japan trip for Camille (C) and Miguel (M)
- The trip runs from Jan 18-26, 2026
- Default assignees for new items should be ["C", "M"]`;

    const result = streamText({
        model: openai('gpt-4o'),
        messages,
        system: systemPrompt,
        tools: {
            add_itinerary_item: {
                description: 'Add a new item to the trip itinerary. Use this when the user wants to add activities, meals, transportation, etc.',
                inputSchema: z.object({
                    day_reference: z.string().describe('The day to add the item to. Can be "Day 1", "Jan 18", "tomorrow", "thursday", etc.'),
                    time: z.string().describe('The time for the item. Can be specific like "9:00 AM" or general like "morning", "lunch", "dinner"'),
                    title: z.string().describe('The title/name of the activity'),
                    location: z.string().optional().describe('The location where this takes place'),
                    description: z.string().optional().describe('Additional details about the activity'),
                    type: z.string().optional().describe('Type of item: Food, Sightseeing, Hotel, Train, Flight, Activity, etc.'),
                    status: z.enum(['idea', 'pending', 'booked', 'confirmed']).optional().describe('Status of the item'),
                }),
                execute: async (input: {
                    day_reference: string;
                    time: string;
                    title: string;
                    location?: string;
                    description?: string;
                    type?: string;
                    status?: 'idea' | 'pending' | 'booked' | 'confirmed';
                }) => {
                    const { day_reference, time, title, location, description, type, status } = input;
                    
                    const dayId = parseRelativeDate(day_reference, tripDays);
                    if (!dayId) {
                        return { 
                            success: false, 
                            error: `Could not find day matching "${day_reference}". Available days: ${tripDays.map(d => d.day_label).join(', ')}` 
                        };
                    }
                    
                    const day = tripDays.find(d => d.id === dayId);
                    const parsedTime = parseTime(time);
                    const itemType = type || inferItemType(title);
                    
                    // In demo mode, just return success without database operations
                    if (isDemoMode) {
                        return { 
                            success: true, 
                            demoMode: true,
                            item: {
                                id: `demo-${Date.now()}`,
                                time: parsedTime,
                                title,
                                location: location || 'TBD',
                                type: itemType,
                                status: status || 'idea',
                            },
                            message: `[Demo Mode] Would add "${title}" to ${day?.day_label} (${day?.date}) at ${parsedTime}. Connect Supabase to persist changes.`
                        };
                    }
                    
                    if (!tripId) {
                        return { success: false, error: 'No trip selected' };
                    }
                    
                    const { data: existingItems } = await supabase!
                        .from('itinerary_items')
                        .select('item_order')
                        .eq('day_id', dayId)
                        .order('item_order', { ascending: false })
                        .limit(1);
                    
                    const items = existingItems as { item_order: number }[] | null;
                    const maxOrder = items?.[0]?.item_order ?? -1;
                    
                    const { data: newItem, error } = await supabase!
                        .from('itinerary_items')
                        .insert({
                            trip_id: tripId,
                            day_id: dayId,
                            time: parsedTime,
                            title,
                            location: location || 'TBD',
                            description,
                            type: itemType,
                            status: status || 'idea',
                            assignees: ['C', 'M'],
                            item_order: maxOrder + 1,
                        })
                        .select()
                        .single();
                    
                    if (error) {
                        return { success: false, error: error.message };
                    }
                    
                    await supabase!.from('activities').insert({
                        trip_id: tripId,
                        user_name: 'AI Assistant',
                        action: 'added',
                        target: title,
                    });
                    
                    return { 
                        success: true, 
                        item: newItem,
                        message: `Added "${title}" to ${day?.day_label} (${day?.date}) at ${parsedTime}`
                    };
                },
            },
            
            update_itinerary_item: {
                description: 'Update an existing itinerary item. Use this when the user wants to change details of an existing activity.',
                inputSchema: z.object({
                    item_title: z.string().describe('The title of the item to update (partial match is OK)'),
                    day_reference: z.string().optional().describe('The day the item is on, to help identify it'),
                    updates: z.object({
                        time: z.string().optional(),
                        title: z.string().optional(),
                        location: z.string().optional(),
                        description: z.string().optional(),
                        status: z.enum(['idea', 'pending', 'booked', 'confirmed']).optional(),
                    }).describe('The fields to update'),
                }),
                execute: async (input: {
                    item_title: string;
                    day_reference?: string;
                    updates: {
                        time?: string;
                        title?: string;
                        location?: string;
                        description?: string;
                        status?: 'idea' | 'pending' | 'booked' | 'confirmed';
                    };
                }) => {
                    const { item_title, day_reference, updates } = input;
                    
                    // In demo mode, just return success without database operations
                    if (isDemoMode) {
                        const updateDetails = Object.entries(updates)
                            .filter(([, v]) => v !== undefined)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(', ');
                        return { 
                            success: true, 
                            demoMode: true,
                            message: `[Demo Mode] Would update "${item_title}" with: ${updateDetails}. Connect Supabase to persist changes.`
                        };
                    }
                    
                    if (!tripId) {
                        return { success: false, error: 'No trip selected' };
                    }
                    
                    let query = supabase!
                        .from('itinerary_items')
                        .select('*')
                        .eq('trip_id', tripId)
                        .ilike('title', `%${item_title}%`);
                    
                    if (day_reference) {
                        const dayId = parseRelativeDate(day_reference, tripDays);
                        if (dayId) {
                            query = query.eq('day_id', dayId);
                        }
                    }
                    
                    const { data: foundItems } = await query.limit(1);
                    const items = foundItems as ItineraryItem[] | null;
                    
                    if (!items || items.length === 0) {
                        return { success: false, error: `Could not find item matching "${item_title}"` };
                    }
                    
                    const item = items[0];
                    
                    const updateData: Record<string, string> = {};
                    if (updates.time) updateData.time = parseTime(updates.time);
                    if (updates.title) updateData.title = updates.title;
                    if (updates.location) updateData.location = updates.location;
                    if (updates.description) updateData.description = updates.description;
                    if (updates.status) updateData.status = updates.status;
                    
                    const { error } = await supabase!
                        .from('itinerary_items')
                        .update(updateData)
                        .eq('id', item.id);
                    
                    if (error) {
                        return { success: false, error: error.message };
                    }
                    
                    await supabase!.from('activities').insert({
                        trip_id: tripId,
                        user_name: 'AI Assistant',
                        action: 'updated',
                        target: item.title,
                    });
                    
                    return { 
                        success: true, 
                        message: `Updated "${item.title}"`
                    };
                },
            },
            
            delete_itinerary_item: {
                description: 'Delete an item from the itinerary. Use this when the user wants to remove an activity.',
                inputSchema: z.object({
                    item_title: z.string().describe('The title of the item to delete (partial match is OK)'),
                    day_reference: z.string().optional().describe('The day the item is on, to help identify it'),
                }),
                execute: async (input: {
                    item_title: string;
                    day_reference?: string;
                }) => {
                    const { item_title, day_reference } = input;
                    
                    // In demo mode, just return success without database operations
                    if (isDemoMode) {
                        return { 
                            success: true, 
                            demoMode: true,
                            message: `[Demo Mode] Would delete "${item_title}". Connect Supabase to persist changes.`
                        };
                    }
                    
                    if (!tripId) {
                        return { success: false, error: 'No trip selected' };
                    }
                    
                    let query = supabase!
                        .from('itinerary_items')
                        .select('*')
                        .eq('trip_id', tripId)
                        .ilike('title', `%${item_title}%`);
                    
                    if (day_reference) {
                        const dayId = parseRelativeDate(day_reference, tripDays);
                        if (dayId) {
                            query = query.eq('day_id', dayId);
                        }
                    }
                    
                    const { data: foundItems } = await query.limit(1);
                    const items = foundItems as ItineraryItem[] | null;
                    
                    if (!items || items.length === 0) {
                        return { success: false, error: `Could not find item matching "${item_title}"` };
                    }
                    
                    const item = items[0];
                    
                    const { error } = await supabase!
                        .from('itinerary_items')
                        .delete()
                        .eq('id', item.id);
                    
                    if (error) {
                        return { success: false, error: error.message };
                    }
                    
                    await supabase!.from('activities').insert({
                        trip_id: tripId,
                        user_name: 'AI Assistant',
                        action: 'removed',
                        target: item.title,
                    });
                    
                    return { 
                        success: true, 
                        message: `Deleted "${item.title}"`
                    };
                },
            },
            
            get_day_schedule: {
                description: 'Get the schedule for a specific day. Use this to answer questions about what is planned.',
                inputSchema: z.object({
                    day_reference: z.string().describe('The day to look up. Can be "Day 1", "Jan 18", "tomorrow", "thursday", etc.'),
                }),
                execute: async (input: { day_reference: string }) => {
                    const { day_reference } = input;
                    
                    const dayId = parseRelativeDate(day_reference, tripDays);
                    if (!dayId) {
                        return { 
                            success: false, 
                            error: `Could not find day matching "${day_reference}". Available days: ${tripDays.map(d => d.day_label).join(', ')}` 
                        };
                    }
                    
                    const day = tripDays.find(d => d.id === dayId);
                    
                    // In demo mode, return demo schedule from itineraryContext
                    if (isDemoMode) {
                        return {
                            success: true,
                            demoMode: true,
                            day: {
                                label: day?.day_label,
                                date: day?.date,
                                location: day?.location,
                            },
                            items: [],
                            note: `This is demo mode. The schedule for ${day?.day_label} (${day?.date}) in ${day?.location} would be fetched from Supabase when configured.`
                        };
                    }
                    
                    if (!tripId) {
                        return { success: false, error: 'No trip selected' };
                    }
                    
                    const { data: foundItems } = await supabase!
                        .from('itinerary_items')
                        .select('*')
                        .eq('day_id', dayId)
                        .order('item_order', { ascending: true });
                    
                    const items = foundItems as ItineraryItem[] | null;
                    
                    return {
                        success: true,
                        day: {
                            label: day?.day_label,
                            date: day?.date,
                            location: day?.location,
                        },
                        items: items?.map(i => ({
                            time: i.time,
                            title: i.title,
                            type: i.type,
                            location: i.location,
                            status: i.status,
                            description: i.description,
                        })) || [],
                    };
                },
            },
        },
    });

    return result.toTextStreamResponse();
}
