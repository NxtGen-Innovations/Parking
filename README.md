# 🅿️ ParkEase – Disaster-Aware Parking Platform

> A smart parking platform designed to help Chennai drivers find safer parking during extreme weather and flood-risk situations.

![License](https://img.shields.io/badge/license-MIT-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-98.3%25-blue)
![React](https://img.shields.io/badge/React-18-61dafb?logo=react)
![Status](https://img.shields.io/badge/status-Active-success)

## 📍 Live Project

🔗 **[Visit ParkEase](https://github.com/NxtGen-Innovations/Parking)**

---

## 🎯 About ParkEase

ParkEase is a **disaster-aware parking platform** specifically built for Chennai. When extreme weather and flood conditions are detected, the platform intelligently prioritizes flood-safe parking options, helping drivers:

- ✅ Avoid unsafe parking spots (low-lying zones, bridge-side areas)
- ✅ Make safer routing and booking decisions in real-time
- ✅ Access emergency parking recommendations during disasters

### Why This Matters for Chennai

Chennai faces recurrent heavy rain and flood-impact events. During these critical periods, normal parking search is insufficient. ParkEase adds an **emergency-first parking layer** to improve:

- 🚗 **Vehicle Safety** – Protect assets during floods
- ⚡ **Decision Speed** – Quick access to safe alternatives
- 📊 **Resource Utilization** – Leverage safer elevated & private parking supply

---

## 🚀 Key Features

### Driver Experience

| Feature | Description |
|---------|-------------|
| 🔍 **Smart Search** | Find nearby parking spaces with live location context |
| 🗺️ **Map Discovery** | Interactive map-based parking exploration |
| 🚨 **Storm/SOS Mode** | One-tap access to flood-safe parking options only |
| 📋 **Flexible Booking** | Book by vehicle type (Bike, Car, SUV) |
| 🧭 **Navigation** | Turn-by-turn directions to booked location |
| 📱 **QR Check-in/out** | Seamless scan-based verification |
| 💬 **Real-time Chat** | Communicate with parking providers instantly |
| 📜 **Booking History** | Track all past and upcoming reservations |

### Provider Dashboard

| Feature | Description |
|---------|-------------|
| ➕ **Space Registration** | Add parking spaces with detailed metadata |
| 🛡️ **Flood-Safe Marking** | Designate spaces as safe during emergencies |
| ⏰ **Custom Availability** | Set 24/7 or custom operating hours |
| 💰 **Dynamic Pricing** | Configure rates by vehicle type & demand |
| 📸 **Verification & Media** | Upload images and proof documents |
| 📊 **Advanced Dashboard** | Track bookings, earnings, and occupancy patterns |
| ⚙️ **Space Management** | Activate, deactivate, edit, or delete listings |

### Smart Intelligence

- 🤖 **AI-Powered Pricing** – TensorFlow.js dynamic pricing based on occupancy, weather, and emergency mode
- 🌡️ **Weather Integration** – Real-time rain and flood alerts
- 🔐 **Safety Logic** – Automatic blocking of unsafe ground-floor inventory in flood scenarios

---

## 🏗️ Architecture Overview

### Frontend Stack
- **React 18** – Modern UI framework
- **TypeScript** – Type-safe development
- **Vite 5** – Lightning-fast dev server & builds
- **React Router** – Client-side routing

### UI & Design
- **Tailwind CSS** – Utility-first styling
- **Shadcn/ui** – High-quality component library
- **Framer Motion** – Smooth animations
- **Lucide React** – Beautiful icons

### Backend & Data
- **Supabase** – PostgreSQL, Auth, Real-time APIs
- **TanStack React Query** – Data synchronization
- **Zod & React Hook Form** – Form validation & state

### Maps & Location
- **Leaflet + React-Leaflet** – Interactive mapping
- **TomTom Maps** – Map tiles and geocoding
- **Geolocation APIs** – Real-time positioning

### AI & Analytics
- **TensorFlow.js** – Client-side ML pricing models
- **Recharts** – Data visualization
- **Open-Meteo API** – Weather & climate data

### Developer Tools
- **ESLint** – Code quality
- **PostCSS** – CSS processing
- **SWC** – Fast TypeScript compilation

---

## 📁 Project Structure

```
src/
├── pages/                  # Main application screens
│   ├── Auth/              # Login & Registration flows
│   ├── Browse/            # Parking discovery & search
│   ├── Booking/           # Reservation & checkout
│   ├── Navigation/        # Directions & routing
│   └── Dashboards/        # Driver & Provider analytics
├── components/            # Reusable React components
│   ├── Map/              # Map-related components
│   ├── Cards/            # Card & UI elements
│   └── Forms/            # Form components
├── contexts/             # React Context (Auth, etc.)
├── lib/                  # Core utilities
│   ├── supabase.ts       # Supabase client
│   ├── pricing.ts        # Pricing engine
│   └── ml-model.ts       # TensorFlow.js utilities
└── styles/              # Global CSS
public/                  # Static assets
```

---

## 🛠️ Getting Started

### Prerequisites

- **Node.js** 18+ (LTS recommended)
- **npm** 9+
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/NxtGen-Innovations/Parking.git
   cd Parking
   ```

2. **Install dependencies**
   ```bash
   npm ci
   ```

   > If peer dependency errors occur, use:
   > ```bash
   > npm ci --legacy-peer-deps
   > ```

3. **Configure environment**
   
   Create a `.env` file in the project root:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

   > Get these credentials from your Supabase project settings

### Running the Application

```bash
# Development server (with hot reload)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

---

## 🚀 Deployment

The application is optimized for deployment on:
- **Vercel** (recommended for Next.js-like performance)
- **Netlify** (static site hosting with serverless functions)
- **AWS Amplify** (full-stack deployment)
- **Docker** (containerized deployment)

---

## 📊 Tech Stack Summary

| Category | Technologies |
|----------|--------------|
| **Frontend** | React 18, TypeScript, Vite 5, React Router |
| **Styling** | Tailwind CSS, Shadcn/ui, Framer Motion |
| **State & Data** | React Query, Zod, React Hook Form |
| **Maps & Location** | Leaflet, React-Leaflet, TomTom Maps |
| **Backend** | Supabase (PostgreSQL, Auth, Realtime) |
| **AI/ML** | TensorFlow.js, Open-Meteo API |
| **Visualization** | Recharts, Lucide Icons |
| **QR & Scanning** | react-qr-code, @blackbox-vision/react-qr-reader |

---

## 🗓️ Roadmap

### Short Term
- ✨ Live flood-map overlays with ward-level risk scoring
- 🚨 Integration with civic disaster feeds & weather alerts
- 📍 Evacuation-safe routing with intelligent recommendations

### Medium Term
- 🤖 Occupancy prediction using real booking telemetry
- 👮 Emergency responder dashboard for coordinated parking control
- 📱 Native mobile apps (iOS & Android)

### Long Term
- 🌍 Expansion to other Indian cities facing similar climate challenges
- 🔗 Integration with public transportation systems
- 🎛️ Blockchain-based payment & verification systems

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Code Standards
- Follow ESLint rules
- Write TypeScript (no `any` types without good reason)
- Add tests for new features
- Update documentation

---

## 📄 License

This project is licensed under the **MIT License** – see the [LICENSE](LICENSE) file for details.

---

## 💬 Support & Community

- 🐛 **Bug Reports** – [Open an Issue](https://github.com/NxtGen-Innovations/Parking/issues)
- 💡 **Feature Requests** – [Discussions](https://github.com/NxtGen-Innovations/Parking/discussions)
- 📧 **Contact** – Reach out via GitHub Issues

---

## 🌟 Acknowledgments

- **Open-Meteo** for weather data APIs
- **TomTom** for mapping services
- **Supabase** for backend infrastructure
- **React & Vite** communities for excellent tooling
- **Chennai Smart City Initiative** for inspiration

---

## 🎓 Vision

ParkEase is positioned as a practical **urban resilience product**: a parking system that stays useful not just on normal days, but especially when cities face climate stress. We believe smart technology can help cities adapt and thrive.

---

<div align="center">

**Made with ❤️ by NxtGen Innovations**

[⭐ Star us on GitHub](https://github.com/NxtGen-Innovations/Parking) | [🚀 Visit Live Project](#-live-project) | [📧 Get in Touch](#-support--community)

</div>
