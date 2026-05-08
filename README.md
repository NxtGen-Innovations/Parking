# ParkEase – Disaster-Aware Parking Platform (Chennai)

ParkEase is a smart parking platform designed to help Chennai drivers find safer parking during extreme weather and flood-risk situations.  
The core idea is simple: when disaster conditions are detected, the platform prioritizes flood-safe parking options so users can avoid unsafe spots (like low-lying or bridge-side risk zones) and reduce vehicle damage.

## Project Baseline

We built this as a **disaster-aware parking platform specially built for Chennai**.  
The platform recommends **flood-safe spots** for drivers during emergencies and supports safer routing and booking decisions in real time.

## What the Platform Does

### Driver Side
- Search and browse nearby parking spaces
- View map-based parking discovery with live location context
- Trigger **Storm / SOS mode** to focus on flood-safe options
- Book spots by vehicle type (bike, car, SUV)
- Navigate to booked location
- Scan QR for check-in/check-out flow
- Track booking history
- Chat with parking provider in real time

### Provider Side
- Register new parking spaces with detailed metadata
- Mark space as flood-safe
- Configure availability windows (24/7 or custom timings)
- Set pricing by vehicle type
- Upload verification and parking images
- View provider dashboard stats (bookings, earnings, occupancy patterns)
- Manage listing status (active/inactive), edit/delete spaces

### Smart Pricing & Safety Logic
- Dynamic pricing based on occupancy, peak hours, weather, and emergency mode
- Flood-safety logic that blocks unsafe ground-floor inventory in flood scenarios
- AI-assisted pricing model (TensorFlow.js) trained from synthetic demand-weather signals

## Why This Matters for Chennai

Chennai faces recurrent heavy rain and flood-impact events.  
During these periods, normal parking search is not enough—drivers need risk-aware recommendations. ParkEase adds an emergency-first parking layer to improve:
- vehicle safety
- driver decision speed
- utilization of safer elevated/private/commercial parking supply

## High-Level Architecture

### Frontend
- Single-page application built with React + TypeScript
- Route-protected user flows (driver/provider roles)
- Interactive map UI for discovery and navigation support

### Backend & Data
- Supabase for authentication, database access, and real-time messaging
- Core entities inferred from app flows:
  - users/profiles
  - parking_spaces
  - bookings
  - messages
  - reviews
  - favorites

### External Data/Services
- Open-Meteo API for weather/rain signals
- Geolocation + reverse geocoding for location capture
- TomTom map tiles + Leaflet/React-Leaflet map rendering

## Tech Stack

### Core Web App
- **Vite 5**
- **React 18**
- **TypeScript**
- **React Router**

### UI & Styling
- **Tailwind CSS**
- **shadcn/ui** + **Radix UI**
- **Framer Motion**
- **Lucide React**

### Data & State
- **Supabase JS**
- **TanStack React Query**
- **React Hook Form** + **Zod**

### Maps, Geo & Navigation
- **Leaflet** + **React-Leaflet**
- **Mapbox GL** (dependency present)
- Browser Geolocation APIs

### AI / ML
- **TensorFlow.js** for pricing prediction logic

### QR & Visualization
- **@blackbox-vision/react-qr-reader**
- **react-qr-code**
- **Recharts**

### Tooling
- **ESLint**
- **PostCSS / Autoprefixer**
- **Vite React SWC plugin**

## Repository Structure (Key Paths)

```text
src/
  pages/                # App screens (Auth, Browse, Booking, Navigation, Dashboards)
  components/           # Reusable UI + feature components
  contexts/             # Auth context
  lib/                  # Supabase client, pricing engine, ML model utilities
public/                 # Static assets
```

## Local Setup

### Prerequisites
- Node.js 18+ (recommended)
- npm

### Install
```bash
npm ci --legacy-peer-deps
```

### Environment Variables
Create a `.env` file with:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Run
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Lint
```bash
npm run lint
```

## Current Build/Lint Status in This Branch

- Build runs successfully with current source state.
- Lint currently reports multiple pre-existing TypeScript/ESLint issues unrelated to this README update.

## Future Expansion Ideas

- Live flood-map overlays and ward-level risk scoring for Chennai
- Disaster alert integration from civic/weather feeds
- Evacuation-safe routing + parking recommendations
- Occupancy prediction from real booking telemetry
- Emergency responder/authority dashboard for coordinated parking control

---

ParkEase is positioned as a practical **urban resilience product**: a parking system that stays useful not just on normal days, but especially when cities face climate stress.
