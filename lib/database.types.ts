export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            trips: {
                Row: {
                    id: string
                    name: string
                    description: string | null
                    start_date: string | null
                    end_date: string | null
                    cover_image: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    description?: string | null
                    start_date?: string | null
                    end_date?: string | null
                    cover_image?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    description?: string | null
                    start_date?: string | null
                    end_date?: string | null
                    cover_image?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            trip_days: {
                Row: {
                    id: string
                    trip_id: string
                    date: string
                    day_label: string
                    location: string | null
                    day_order: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    trip_id: string
                    date: string
                    day_label: string
                    location?: string | null
                    day_order: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    trip_id?: string
                    date?: string
                    day_label?: string
                    location?: string | null
                    day_order?: number
                    created_at?: string
                }
            }
            itinerary_items: {
                Row: {
                    id: string
                    trip_id: string
                    day_id: string
                    time: string
                    title: string
                    type: string
                    location: string
                    status: string
                    assignees: string[]
                    duration: string | null
                    description: string | null
                    confirmation_number: string | null
                    carrier: string | null
                    flight_number: string | null
                    departure_time: string | null
                    arrival_time: string | null
                    departure_location: string | null
                    arrival_location: string | null
                    seat_class: string | null
                    price: string | null
                    booking_url: string | null
                    notes: string | null
                    item_order: number
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    trip_id: string
                    day_id: string
                    time: string
                    title: string
                    type: string
                    location: string
                    status?: string
                    assignees?: string[]
                    duration?: string | null
                    description?: string | null
                    confirmation_number?: string | null
                    carrier?: string | null
                    flight_number?: string | null
                    departure_time?: string | null
                    arrival_time?: string | null
                    departure_location?: string | null
                    arrival_location?: string | null
                    seat_class?: string | null
                    price?: string | null
                    booking_url?: string | null
                    notes?: string | null
                    item_order?: number
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    trip_id?: string
                    day_id?: string
                    time?: string
                    title?: string
                    type?: string
                    location?: string
                    status?: string
                    assignees?: string[]
                    duration?: string | null
                    description?: string | null
                    confirmation_number?: string | null
                    carrier?: string | null
                    flight_number?: string | null
                    departure_time?: string | null
                    arrival_time?: string | null
                    departure_location?: string | null
                    arrival_location?: string | null
                    seat_class?: string | null
                    price?: string | null
                    booking_url?: string | null
                    notes?: string | null
                    item_order?: number
                    created_at?: string
                    updated_at?: string
                }
            }
            map_pins: {
                Row: {
                    id: string
                    trip_id: string
                    name: string
                    location: string
                    lat: number
                    lng: number
                    type: string
                    day: string | null
                    notes: string | null
                    linked_item_id: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    trip_id: string
                    name: string
                    location: string
                    lat: number
                    lng: number
                    type: string
                    day?: string | null
                    notes?: string | null
                    linked_item_id?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    trip_id?: string
                    name?: string
                    location?: string
                    lat?: number
                    lng?: number
                    type?: string
                    day?: string | null
                    notes?: string | null
                    linked_item_id?: string | null
                    created_at?: string
                }
            }
            activities: {
                Row: {
                    id: string
                    trip_id: string
                    user_name: string
                    action: string
                    target: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    trip_id: string
                    user_name: string
                    action: string
                    target: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    trip_id?: string
                    user_name?: string
                    action?: string
                    target?: string
                    created_at?: string
                }
            }
            notes: {
                Row: {
                    id: string
                    trip_id: string
                    title: string
                    content: string
                    category: string
                    color: string | null
                    icon: string | null
                    is_favorite: boolean
                    created_by: string | null
                    last_edited_by: string | null
                    note_order: number
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    trip_id: string
                    title: string
                    content?: string
                    category?: string
                    color?: string | null
                    icon?: string | null
                    is_favorite?: boolean
                    created_by?: string | null
                    last_edited_by?: string | null
                    note_order?: number
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    trip_id?: string
                    title?: string
                    content?: string
                    category?: string
                    color?: string | null
                    icon?: string | null
                    is_favorite?: boolean
                    created_by?: string | null
                    last_edited_by?: string | null
                    note_order?: number
                    created_at?: string
                    updated_at?: string
                }
            }
            trip_settings: {
                Row: {
                    id: string
                    trip_id: string
                    timezone: string
                    currency: string
                    date_format: string
                    time_format: string
                    default_assignees: string[]
                    collaborators: Json
                    preferences: Json
                    notifications: Json
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    trip_id: string
                    timezone?: string
                    currency?: string
                    date_format?: string
                    time_format?: string
                    default_assignees?: string[]
                    collaborators?: Json
                    preferences?: Json
                    notifications?: Json
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    trip_id?: string
                    timezone?: string
                    currency?: string
                    date_format?: string
                    time_format?: string
                    default_assignees?: string[]
                    collaborators?: Json
                    preferences?: Json
                    notifications?: Json
                    created_at?: string
                    updated_at?: string
                }
            }
            expenses: {
                Row: {
                    id: string
                    trip_id: string
                    category: string
                    description: string
                    amount: number
                    currency: string
                    paid_by: string
                    split_with: string[]
                    date: string
                    payment_method: string | null
                    receipt_url: string | null
                    notes: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    trip_id: string
                    category: string
                    description: string
                    amount: number
                    currency?: string
                    paid_by: string
                    split_with?: string[]
                    date: string
                    payment_method?: string | null
                    receipt_url?: string | null
                    notes?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    trip_id?: string
                    category?: string
                    description?: string
                    amount?: number
                    currency?: string
                    paid_by?: string
                    split_with?: string[]
                    date?: string
                    payment_method?: string | null
                    receipt_url?: string | null
                    notes?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            files: {
                Row: {
                    id: string
                    trip_id: string
                    name: string
                    file_type: string
                    file_size: number | null
                    storage_path: string
                    url: string
                    category: string
                    uploaded_by: string | null
                    description: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    trip_id: string
                    name: string
                    file_type: string
                    file_size?: number | null
                    storage_path: string
                    url: string
                    category?: string
                    uploaded_by?: string | null
                    description?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    trip_id?: string
                    name?: string
                    file_type?: string
                    file_size?: number | null
                    storage_path?: string
                    url?: string
                    category?: string
                    uploaded_by?: string | null
                    description?: string | null
                    created_at?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
    }
}

