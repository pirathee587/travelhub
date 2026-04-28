# TravelHub — Agent Dashboard (Frontend)

A modern travel-agency agent dashboard for managing vehicles, bookings, tour packages, and analytics. Built for **Sri Lanka Travel Experts** as a single-page application.

## Features

- **Dashboard Overview** — At-a-glance stats, recent bookings, and quick actions.
- **Fleet Management** — Full vehicle CRUD with driver assignment and status tracking.
- **Bookings** — View, filter, and inspect booking requests with detailed itineraries.
- **Tour Packages** — Browse and create curated travel packages with pricing, destinations, and media.
- **Analytics** — Revenue charts, booking trends, and fleet utilisation powered by Recharts.
- **Profile & Settings** — Agent profile editing, notification preferences, and app configuration.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | [React 18](https://react.dev/) |
| Build Tool | [Vite 5](https://vitejs.dev/) |
| Routing | React Router v6 |
| Styling | Tailwind CSS 3 + shadcn/ui (Radix primitives) |
| Charts | Recharts |
| Forms | React Hook Form + Zod validation |
| State / Data | TanStack React Query |
| Icons | Lucide React |

## Project Structure

```
src/
├── components/
│   ├── dashboard/     # Sidebar, BookingsTable, layout components
│   └── ui/            # Reusable shadcn/ui primitives (Button, Card, Dialog …)
├── pages/
│   ├── Index.jsx      # Dashboard home
│   ├── Vehicles.jsx   # Fleet management
│   ├── Bookings.jsx   # Booking list
│   ├── BookingDetails.jsx
│   ├── Packages.jsx   # Tour packages
│   ├── PackageDetails.jsx
│   ├── Analytics.jsx  # Charts & reports
│   ├── Profile.jsx    # Agent profile
│   ├── Settings.jsx   # App settings
│   └── NotFound.jsx   # 404 page
├── hooks/             # Custom React hooks
├── lib/               # Utility helpers (cn, etc.)
└── App.jsx            # Root component & route definitions
```

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** (or bun / pnpm)

### Installation

```bash
# 1. Clone the repo
git clone <YOUR_GIT_URL>
cd Agent

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

The app will be available at **http://localhost:5173** by default.

### Other Scripts

| Command | Description |
|---------|-------------|
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

## License

Private — all rights reserved.
