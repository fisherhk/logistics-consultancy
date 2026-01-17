# FreightView - Transactional Freight Management

A web application for collecting, comparing, and analyzing freight quotes from multiple forwarders.

## Features

- **Shipment Request Form**: Submit shipment details and select designated forwarders
- **Quote Collection**: Receive and normalize quotes from multiple forwarders
- **Quote Comparison**: Side-by-side comparison of air vs sea options
- **Mode Analysis**: Cost-transit trade-off visualization with recommendations
- **Decision Tracking**: Record and audit freight decisions

## Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (via Supabase)
- **Auth**: Supabase Auth

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase account (free tier works)

### Setup

1. **Clone and install dependencies**

```bash
cd freightview-app
npm install
```

2. **Create a Supabase project**

   - Go to [supabase.com](https://supabase.com) and create a new project
   - Wait for the database to be ready

3. **Run the database migration**

   - Go to SQL Editor in Supabase dashboard
   - Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
   - Run the SQL

4. **Configure environment variables**

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

5. **Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project Structure

```
src/
├── app/
│   ├── (auth)/           # Auth pages (login, signup)
│   ├── (dashboard)/      # Protected pages
│   │   ├── dashboard/    # Main dashboard
│   │   ├── requests/     # Request list and detail pages
│   │   └── settings/     # User settings
│   └── api/              # API routes
│       ├── requests/     # Request CRUD
│       ├── quotes/       # Quote management
│       └── forwarders/   # Forwarder data
├── components/           # Reusable components
├── lib/                  # Utilities and clients
│   └── supabase/         # Supabase client setup
└── types/                # TypeScript types
```

## API Endpoints

### Requests

- `GET /api/requests` - List all requests
- `POST /api/requests` - Create a new request
- `GET /api/requests/:id` - Get request details
- `PATCH /api/requests/:id` - Update request
- `DELETE /api/requests/:id` - Delete request

### Quotes

- `GET /api/requests/:id/quotes` - Get quotes for a request
- `POST /api/requests/:id/quotes` - Add a quote manually
- `GET /api/requests/:id/analysis` - Get air vs sea analysis

### Forwarders

- `GET /api/forwarders` - List all forwarders
- `GET /api/user/forwarders` - List user's designated forwarders
- `POST /api/user/forwarders` - Add a designated forwarder

## Database Schema

See `supabase/migrations/001_initial_schema.sql` for the complete schema including:

- `profiles` - User profiles
- `forwarders` - Forwarder master data
- `user_forwarders` - User's designated forwarders
- `requests` - Shipment requests
- `quotes` - Received quotes
- `decisions` - Quote selection decisions

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Other Platforms

The app can be deployed to any platform that supports Next.js:

- Railway
- Render
- AWS Amplify
- Self-hosted with `npm run build && npm start`

## Next Steps (Roadmap)

- [ ] Email integration for automatic quote requests
- [ ] AI-powered email parsing for incoming quotes
- [ ] Freightos API integration for spot rates
- [ ] Historical rate analytics
- [ ] Booking confirmation workflow
- [ ] Mobile responsive improvements

## License

Proprietary - GlobalLogistics
