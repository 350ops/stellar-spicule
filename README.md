# HyperSpace - AI-Powered Trip Planner

A collaborative trip planning workspace with AI assistance and real-time synchronization powered by Supabase.

## Features

- **AI Chatbot**: Natural language interface to manage your itinerary
  - "Add breakfast at Yuyu cafe tomorrow morning"
  - "What's the plan for Thursday?"
  - "Change dinner to 8pm"
- **Real-time Updates**: Changes made by AI or other users appear instantly
- **Rich Itinerary Management**: Full CRUD operations for trip items
- **Activity Feed**: Track all changes made to the trip

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase account (free tier works)
- An OpenAI API key

### 1. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor and run the schema file:
   - Copy contents of `supabase/schema.sql` and execute
3. (Optional) Run the seed file for demo data:
   - Copy contents of `supabase/seed.sql` and execute
4. Get your credentials from Project Settings > API:
   - Project URL
   - Anon/Public key
   - Service Role key (for server-side operations)

### 2. Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-api-key

# Default Trip ID (use the ID from seed.sql or your own trip)
NEXT_PUBLIC_DEFAULT_TRIP_ID=00000000-0000-0000-0000-000000000001
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Demo Mode

The app can run without Supabase or OpenAI configured, using local demo data:

- **Without Supabase**: The app uses local state management with sample itinerary data
- **Without OpenAI**: The AI chatbot will display a helpful message explaining that an API key is needed

To run in full demo mode (no external services):

```bash
# Just run without .env.local
npm run dev
```

The console will show: `Supabase credentials not configured. Running in demo mode with local data.`

To enable AI chat, add your OpenAI API key to `.env.local`:

```bash
OPENAI_API_KEY=sk-your-openai-api-key
```

## Architecture

### Database Schema

- **trips**: Main trip information
- **trip_days**: Individual days within a trip
- **itinerary_items**: Activities, meals, transportation, etc.
- **activities**: Activity feed for tracking changes
- **map_pins**: Location markers for the map view

### Real-time Sync

The app uses Supabase's real-time subscriptions to:
- Listen for changes to itinerary items
- Update the UI instantly when changes occur
- Sync activity feed across all connected clients

### AI Integration

The AI chatbot uses OpenAI's GPT-4 with function calling to:
- Parse natural language requests
- Execute database operations (add, update, delete items)
- Query the itinerary to answer questions
- Provide contextual responses based on trip data

## Usage Examples

### Adding Items

```
"Add breakfast at Yuyu cafe tomorrow morning"
→ Creates a Food item at 9:00 AM on the next day

"Schedule a visit to Fushimi Inari on Day 4 at 6am"
→ Creates a Sightseeing item on Day 4 at 6:00 AM
```

### Querying the Itinerary

```
"What's the plan for Thursday?"
→ Returns all items scheduled for Thursday

"What restaurants do we have booked?"
→ Lists all Food type items
```

### Updating Items

```
"Change dinner to 8pm"
→ Updates the time of the dinner item

"Mark the hotel as confirmed"
→ Updates the status to confirmed
```

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Database**: Supabase (PostgreSQL)
- **AI**: OpenAI GPT-4 with Vercel AI SDK
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI / shadcn/ui
- **State Management**: React Context + Supabase Realtime

## Development

### Project Structure

```
tnc/
├── app/
│   ├── api/chat/       # AI chat endpoint with function calling
│   ├── layout.tsx      # Root layout with providers
│   └── page.tsx        # Main page
├── components/
│   ├── dashboard/      # Trip-specific components
│   ├── layout/         # App layout components
│   └── ui/             # Reusable UI components
├── lib/
│   ├── database.types.ts   # Supabase type definitions
│   ├── store.tsx           # Local state management
│   ├── supabase.ts         # Supabase client
│   ├── supabase-hooks.ts   # Real-time data hooks
│   └── trip-context.tsx    # Trip data provider
└── supabase/
    ├── schema.sql      # Database schema
    └── seed.sql        # Demo data
```

## License

MIT
