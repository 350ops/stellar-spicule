# HyperSpace - AI-Powered Collaborative Trip Planning

A modern trip planning application with real-time collaboration, AI assistant, and Supabase backend.

## Features

- 🗓️ **Itinerary Management** - Organize your trip day-by-day with detailed items
- 🤖 **AI Assistant** - Natural language commands to add, update, or query your itinerary
- 🔄 **Real-time Sync** - Changes sync instantly across all connected clients via Supabase
- 🗺️ **Interactive Map** - Visualize all your trip locations with filtering and route display
- 👥 **Collaborative** - Share trips with travel companions

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Real-time subscriptions)
- **AI**: OpenAI GPT-4 with function calling via Vercel AI SDK
- **UI Components**: shadcn/ui, Radix UI primitives

## Getting Started

### 1. Clone and Install

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor and run the schema from `supabase/schema.sql`
3. (Optional) Run `supabase/seed.sql` to populate with sample Japan trip data

### 3. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# OpenAI API Key (for AI chat)
OPENAI_API_KEY=sk-your-openai-api-key
```

You can find your Supabase credentials in:
- Project Settings → API → Project URL
- Project Settings → API → anon/public key

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## AI Assistant Commands

The AI assistant understands natural language commands. Try:

### Adding Items
- "Add breakfast at Yuyu Cafe tomorrow morning"
- "Schedule a visit to Fushimi Inari on Thursday at 6:30 AM"
- "Add dinner at Gonpachi on Day 8"

### Querying the Itinerary
- "What's the plan for Thursday?"
- "What are we doing on Day 4?"
- "Show me the full itinerary"

### Updating Items
- "Change the Shibuya Sky time to 5 PM"
- "Mark the tea ceremony as confirmed"
- "Update the description for Osaka Castle"

### Deleting Items
- "Remove the Spa World activity"
- "Delete lunch at Mellow Cafe"

## Database Schema

The app uses the following main tables:

- **trips** - Trip metadata (name, dates, etc.)
- **days** - Individual days of a trip
- **itinerary_items** - Events, activities, meals, transport, etc.
- **map_pins** - Geographic locations for the map
- **places** - Saved/wishlist places
- **activities** - Activity feed for collaboration

All tables have real-time subscriptions enabled for instant updates.

## Project Structure

```
mct/
├── app/
│   ├── api/chat/       # AI chat API with function calling
│   ├── layout.tsx      # Root layout with providers
│   └── page.tsx        # Main page
├── components/
│   ├── dashboard/      # Trip-related components
│   ├── layout/         # App shell components
│   └── ui/             # shadcn/ui components
├── lib/
│   ├── supabase.ts     # Supabase client & operations
│   ├── supabase-store.tsx  # React context with real-time sync
│   └── utils.ts        # Utility functions
└── supabase/
    ├── schema.sql      # Database schema
    └── seed.sql        # Sample data
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Project Settings
4. Deploy!

### Environment Variables for Production

Make sure to set these in your deployment platform:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `OPENAI_API_KEY`

## License

MIT
