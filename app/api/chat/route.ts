import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { z } from 'zod';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const maxDuration = 60;

// Lazy-initialize Supabase client for server-side operations
let _supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
    if (!_supabase) {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (!url || !key) {
            throw new Error('Supabase credentials not configured');
        }
        _supabase = createClient(url, key);
    }
    return _supabase;
}

// Default trip ID
const DEFAULT_TRIP_ID = "550e8400-e29b-41d4-a716-446655440000";

// Helper to parse day references like "tomorrow", "thursday", "day 3", "jan 20"
function parseDayReference(reference: string): { dayLabel?: string; date?: string } | null {
    const ref = reference.toLowerCase().trim();
    
    // Map day names to their trip dates
    const tripDays = [
        { label: 'Day 1', date: '2026-01-18', weekday: 'saturday' },
        { label: 'Day 2', date: '2026-01-19', weekday: 'sunday' },
        { label: 'Day 3', date: '2026-01-20', weekday: 'monday' },
        { label: 'Day 4', date: '2026-01-21', weekday: 'tuesday' },
        { label: 'Day 5', date: '2026-01-22', weekday: 'wednesday' },
        { label: 'Day 6', date: '2026-01-23', weekday: 'thursday' },
        { label: 'Day 7', date: '2026-01-24', weekday: 'friday' },
        { label: 'Day 8', date: '2026-01-25', weekday: 'saturday' },
        { label: 'Day 9', date: '2026-01-26', weekday: 'sunday' },
    ];

    // Check for "day X" pattern
    const dayMatch = ref.match(/day\s*(\d+)/i);
    if (dayMatch) {
        const dayNum = parseInt(dayMatch[1]);
        const found = tripDays.find(d => d.label === `Day ${dayNum}`);
        if (found) return { dayLabel: found.label, date: found.date };
    }

    // Check for weekday names
    const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    for (const weekday of weekdays) {
        if (ref.includes(weekday)) {
            const found = tripDays.find(d => d.weekday === weekday);
            if (found) return { dayLabel: found.label, date: found.date };
        }
    }

    // Check for date patterns like "jan 20", "january 20", "1/20"
    const monthNames = ['jan', 'january', 'feb', 'february', 'mar', 'march', 'apr', 'april', 'may', 'jun', 'june', 'jul', 'july', 'aug', 'august', 'sep', 'september', 'oct', 'october', 'nov', 'november', 'dec', 'december'];
    for (let i = 0; i < monthNames.length; i++) {
        const monthName = monthNames[i];
        const monthNum = Math.floor(i / 2) + 1;
        const dateMatch = ref.match(new RegExp(`${monthName}\\s*(\\d{1,2})`));
        if (dateMatch) {
            const day = parseInt(dateMatch[1]);
            const dateStr = `2026-${String(monthNum).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const found = tripDays.find(d => d.date === dateStr);
            if (found) return { dayLabel: found.label, date: found.date };
        }
    }

    // Handle "tomorrow" - for demo purposes, let's say "tomorrow" means Day 2 (next day of trip)
    if (ref === 'tomorrow' || ref === 'tomorrow morning' || ref === 'tomorrow evening') {
        return { dayLabel: 'Day 2', date: '2026-01-19' };
    }

    // Handle "today" - for demo, Day 1
    if (ref === 'today') {
        return { dayLabel: 'Day 1', date: '2026-01-18' };
    }

    return null;
}

// Type definitions for database records
interface DbDay {
    id: string;
    day_label: string;
    date: string;
    location: string;
}

interface DbItem {
    id: string;
    day_id: string;
    time: string;
    title: string;
    type: string;
    status: string;
    location: string;
    description: string;
    duration: string;
    sort_order?: number;
}

export async function POST(req: Request) {
    const { messages, tripId = DEFAULT_TRIP_ID } = await req.json();

    const supabase = getSupabase();

    // Fetch current trip data for context
    const [tripData, daysData, itemsData] = await Promise.all([
        supabase.from('trips').select('*').eq('id', tripId).single(),
        supabase.from('days').select('*').eq('trip_id', tripId).order('sort_order'),
        supabase.from('itinerary_items').select('*').eq('trip_id', tripId).order('sort_order'),
    ]);

    const trip = tripData.data;
    const days: DbDay[] = daysData.data || [];
    const items: DbItem[] = itemsData.data || [];

    // Build context string for the AI
    const tripContext = days.map((day) => {
        const dayItems = items.filter((item) => item.day_id === day.id);
        const itemsList = dayItems.map((item) => 
            `  - ${item.time}: ${item.title} (${item.type}, ${item.status}) at ${item.location || 'TBD'}`
        ).join('\n');
        return `${day.day_label} (${day.date}) - ${day.location}:\n${itemsList || '  No items scheduled'}`;
    }).join('\n\n');

    const systemPrompt = `You are a helpful travel assistant for the HyperSpace trip planning app. You're helping plan a Japan trip for Camille and Miguel.

CURRENT TRIP: ${trip?.name || 'Japan Adventure 2026'}
DATES: January 18-26, 2026

CURRENT ITINERARY:
${tripContext}

You have access to tools to:
1. Add new items to the itinerary (meals, activities, transportation, etc.)
2. Update existing items (change time, status, description, etc.)
3. Delete items from the itinerary
4. Query the itinerary for specific days or items

When users ask to add something:
- Parse the day reference (e.g., "tomorrow", "thursday", "day 3", "jan 20")
- Infer the type of activity from context (Food, Activity, Sightseeing, etc.)
- Infer a reasonable time if not specified
- Default assignees to ["C", "M"] (Camille and Miguel)
- Default status to "idea" unless they say it's booked/confirmed

When users ask about the plan:
- Query the itinerary for the relevant day(s)
- Provide a clear, friendly summary

Be concise but helpful. After making changes, confirm what you did.`;

    // Define tool schemas
    const addItemSchema = z.object({
        dayReference: z.string().describe('The day to add the item to. Can be "Day 1", "Day 2", etc., or a date like "2026-01-20", or natural language like "tomorrow", "thursday"'),
        title: z.string().describe('The title/name of the item (e.g., "Breakfast at Yuyu Cafe", "Visit Fushimi Inari")'),
        time: z.string().describe('The time of the item in format like "9:00 AM", "12:30 PM"'),
        type: z.enum(['Flight', 'Train', 'Bus', 'Ferry', 'RentalCar', 'Taxi', 'Hotel', 'Airbnb', 'Food', 'Activity', 'Sightseeing', 'Arrival', 'Departure', 'Transfer', 'Meeting', 'Other']).describe('The type of item'),
        location: z.string().optional().describe('The location of the item'),
        description: z.string().optional().describe('Additional description or notes'),
        status: z.enum(['confirmed', 'booked', 'pending', 'idea', 'info']).default('idea').describe('The status of the item'),
        duration: z.string().optional().describe('Duration like "1h", "30m", "2h 30m"'),
        assignees: z.array(z.string()).default(['C', 'M']).describe('Array of assignee initials'),
    });

    const updateItemSchema = z.object({
        itemTitle: z.string().describe('The title of the item to update (partial match is ok)'),
        dayReference: z.string().optional().describe('The day the item is on (helps narrow down if multiple items have similar names)'),
        updates: z.object({
            time: z.string().optional(),
            title: z.string().optional(),
            status: z.enum(['confirmed', 'booked', 'pending', 'idea', 'info']).optional(),
            description: z.string().optional(),
            location: z.string().optional(),
            duration: z.string().optional(),
        }).describe('The fields to update'),
    });

    const deleteItemSchema = z.object({
        itemTitle: z.string().describe('The title of the item to delete (partial match is ok)'),
        dayReference: z.string().optional().describe('The day the item is on (helps narrow down if multiple items have similar names)'),
    });

    const getItinerarySchema = z.object({
        dayReference: z.string().optional().describe('The day to get the itinerary for. Leave empty to get the full trip itinerary.'),
    });

    const result = streamText({
        model: openai('gpt-4-turbo'),
        messages,
        system: systemPrompt,
        tools: {
            addItineraryItem: {
                description: 'Add a new item to the trip itinerary. Use this when the user wants to add a meal, activity, transportation, or any other event to their trip.',
                inputSchema: addItemSchema,
                execute: async (args: z.infer<typeof addItemSchema>) => {
                    const { dayReference, title, time, type, location, description, status, duration, assignees } = args;
                    try {
                        // Find the day
                        const parsed = parseDayReference(dayReference);
                        let day: DbDay | undefined = undefined;
                        
                        if (parsed?.dayLabel) {
                            day = days.find((d) => d.day_label.toLowerCase() === parsed.dayLabel!.toLowerCase());
                        }
                        if (!day && parsed?.date) {
                            day = days.find((d) => d.date === parsed.date);
                        }
                        if (!day) {
                            // Try direct match
                            day = days.find((d) => 
                                d.day_label.toLowerCase() === dayReference.toLowerCase() ||
                                d.date === dayReference
                            );
                        }

                        if (!day) {
                            return { success: false, error: `Could not find day matching "${dayReference}". Valid days are Day 1-9 (Jan 18-26).` };
                        }

                        // Get max sort order
                        const dayItems = items.filter((i) => i.day_id === day!.id);
                        const maxSortOrder = dayItems.length > 0 
                            ? Math.max(...dayItems.map((i) => i.sort_order || 0)) + 1 
                            : 0;

                        // Insert the item
                        const { data, error } = await supabase
                            .from('itinerary_items')
                            .insert({
                                day_id: day.id,
                                trip_id: tripId,
                                time,
                                title,
                                type,
                                location: location || null,
                                description: description || null,
                                status,
                                duration: duration || null,
                                assignees,
                                sort_order: maxSortOrder,
                            })
                            .select()
                            .single();

                        if (error) throw error;

                        // Log activity
                        await supabase.from('activities').insert({
                            trip_id: tripId,
                            user_name: 'AI Agent',
                            action: 'added',
                            target: title,
                        });

                        return { 
                            success: true, 
                            item: data,
                            message: `Added "${title}" to ${day.day_label} (${day.date}) at ${time}`
                        };
                    } catch (err) {
                        console.error('Error adding item:', err);
                        return { success: false, error: String(err) };
                    }
                },
            },

            updateItineraryItem: {
                description: 'Update an existing item in the itinerary. Use this to change the time, status, description, or other details of an existing item.',
                inputSchema: updateItemSchema,
                execute: async (args: z.infer<typeof updateItemSchema>) => {
                    const { itemTitle, dayReference, updates } = args;
                    try {
                        // Find the item
                        let matchingItems = items.filter((i) => 
                            i.title.toLowerCase().includes(itemTitle.toLowerCase())
                        );

                        // Narrow down by day if provided
                        if (dayReference && matchingItems.length > 1) {
                            const parsed = parseDayReference(dayReference);
                            if (parsed?.dayLabel) {
                                const day = days.find((d) => d.day_label.toLowerCase() === parsed.dayLabel!.toLowerCase());
                                if (day) {
                                    matchingItems = matchingItems.filter((i) => i.day_id === day.id);
                                }
                            }
                        }

                        if (matchingItems.length === 0) {
                            return { success: false, error: `Could not find item matching "${itemTitle}"` };
                        }

                        const item = matchingItems[0];

                        // Build update object
                        const dbUpdates: Record<string, unknown> = {};
                        if (updates.time) dbUpdates.time = updates.time;
                        if (updates.title) dbUpdates.title = updates.title;
                        if (updates.status) dbUpdates.status = updates.status;
                        if (updates.description) dbUpdates.description = updates.description;
                        if (updates.location) dbUpdates.location = updates.location;
                        if (updates.duration) dbUpdates.duration = updates.duration;

                        const { data, error } = await supabase
                            .from('itinerary_items')
                            .update(dbUpdates)
                            .eq('id', item.id)
                            .select()
                            .single();

                        if (error) throw error;

                        // Log activity
                        await supabase.from('activities').insert({
                            trip_id: tripId,
                            user_name: 'AI Agent',
                            action: 'updated',
                            target: item.title,
                        });

                        return { 
                            success: true, 
                            item: data,
                            message: `Updated "${item.title}"`
                        };
                    } catch (err) {
                        console.error('Error updating item:', err);
                        return { success: false, error: String(err) };
                    }
                },
            },

            deleteItineraryItem: {
                description: 'Delete an item from the itinerary. Use this when the user wants to remove an event from their trip.',
                inputSchema: deleteItemSchema,
                execute: async (args: z.infer<typeof deleteItemSchema>) => {
                    const { itemTitle, dayReference } = args;
                    try {
                        // Find the item
                        let matchingItems = items.filter((i) => 
                            i.title.toLowerCase().includes(itemTitle.toLowerCase())
                        );

                        // Narrow down by day if provided
                        if (dayReference && matchingItems.length > 1) {
                            const parsed = parseDayReference(dayReference);
                            if (parsed?.dayLabel) {
                                const day = days.find((d) => d.day_label.toLowerCase() === parsed.dayLabel!.toLowerCase());
                                if (day) {
                                    matchingItems = matchingItems.filter((i) => i.day_id === day.id);
                                }
                            }
                        }

                        if (matchingItems.length === 0) {
                            return { success: false, error: `Could not find item matching "${itemTitle}"` };
                        }

                        const item = matchingItems[0];

                        const { error } = await supabase
                            .from('itinerary_items')
                            .delete()
                            .eq('id', item.id);

                        if (error) throw error;

                        // Log activity
                        await supabase.from('activities').insert({
                            trip_id: tripId,
                            user_name: 'AI Agent',
                            action: 'deleted',
                            target: item.title,
                        });

                        return { 
                            success: true, 
                            message: `Deleted "${item.title}"`
                        };
                    } catch (err) {
                        console.error('Error deleting item:', err);
                        return { success: false, error: String(err) };
                    }
                },
            },

            getItinerary: {
                description: 'Get the itinerary for a specific day or the entire trip. Use this when the user asks about the plan for a specific day.',
                inputSchema: getItinerarySchema,
                execute: async (args: z.infer<typeof getItinerarySchema>) => {
                    const { dayReference } = args;
                    try {
                        if (!dayReference) {
                            // Return full itinerary summary
                            const summary = days.map((day) => {
                                const dayItems = items.filter((i) => i.day_id === day.id);
                                return {
                                    day: day.day_label,
                                    date: day.date,
                                    location: day.location,
                                    itemCount: dayItems.length,
                                    items: dayItems.map((i) => ({
                                        time: i.time,
                                        title: i.title,
                                        type: i.type,
                                        status: i.status,
                                        location: i.location,
                                    })),
                                };
                            });
                            return { success: true, itinerary: summary };
                        }

                        // Find specific day
                        const parsed = parseDayReference(dayReference);
                        let day: DbDay | undefined = undefined;
                        
                        if (parsed?.dayLabel) {
                            day = days.find((d) => d.day_label.toLowerCase() === parsed.dayLabel!.toLowerCase());
                        }
                        if (!day && parsed?.date) {
                            day = days.find((d) => d.date === parsed.date);
                        }
                        if (!day) {
                            day = days.find((d) => 
                                d.day_label.toLowerCase() === dayReference.toLowerCase() ||
                                d.date === dayReference
                            );
                        }

                        if (!day) {
                            return { success: false, error: `Could not find day matching "${dayReference}"` };
                        }

                        const dayItems = items.filter((i) => i.day_id === day!.id);
                        
                        return {
                            success: true,
                            day: {
                                label: day.day_label,
                                date: day.date,
                                location: day.location,
                                items: dayItems.map((i) => ({
                                    time: i.time,
                                    title: i.title,
                                    type: i.type,
                                    status: i.status,
                                    location: i.location,
                                    description: i.description,
                                    duration: i.duration,
                                })),
                            },
                        };
                    } catch (err) {
                        console.error('Error getting itinerary:', err);
                        return { success: false, error: String(err) };
                    }
                },
            },
        },
    });

    return result.toTextStreamResponse();
}
