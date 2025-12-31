// lib/pricingEngine.ts
import { isWeekend, getHours } from 'date-fns';

// 1. Define the Input Features (The "X" variables for your model)
interface PricingFeatures {
  basePrice: number;
  totalSlots: number;
  occupiedSlots: number;
  bookingDate: Date;
  weather: {
    rainMM: number;     // Rainfall in mm
    isFloodMode: boolean; // Manual or auto trigger
  };
  floorLevel: number;   // 0 = Ground, 1 = 1st Floor, etc.
}

interface PricingResult {
  finalPrice: number;
  multiplier: number;
  isBlocked: boolean;
  factors: string[]; // Explains WHY the price is high/low
}

// 2. The Logic (The "Model")
export const calculateDynamicPrice = (features: PricingFeatures): PricingResult => {
  let multiplier = 1.0;
  const factors: string[] = [];
  const { basePrice, totalSlots, occupiedSlots, bookingDate, weather, floorLevel } = features;

  // --- A. OCCUPANCY FACTOR (Supply & Demand) ---
  const occupancyRate = occupiedSlots / totalSlots;
  
  if (occupancyRate >= 0.9) {
    multiplier += 0.5; // +50% if 90% full
    factors.push("High Occupancy (+50%)");
  } else if (occupancyRate >= 0.7) {
    multiplier += 0.2; // +20% if 70% full
    factors.push("Busy Demand (+20%)");
  }

  // --- B. TEMPORAL FACTOR (Time of Day / Weekend) ---
  const hour = getHours(bookingDate);
  const isPeakHour = (hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 19);
  
  if (isPeakHour) {
    multiplier += 0.25; // +25% during rush hour
    factors.push("Peak Hour Surge (+25%)");
  }
  
  if (isWeekend(bookingDate)) {
    multiplier += 0.1; // +10% on weekends
    factors.push("Weekend Rate (+10%)");
  }

  // --- C. WEATHER & FLOOD FACTOR (The Critical Safety Logic) ---
  // Rain Logic: Comfort Premium
  if (weather.rainMM > 5 && !weather.isFloodMode) {
     multiplier += 0.15;
     factors.push("Rain Convenience (+15%)");
  }

  // Flood Logic: Safety Premium vs Risk Block
  if (weather.isFloodMode) {
    if (floorLevel === 0) {
      // DANGER: Ground floor is unsafe
      return { 
        finalPrice: 0, 
        multiplier: 0, 
        isBlocked: true, 
        factors: ["⛔ FLOOD RISK: Ground Floor Blocked"] 
      };
    } else {
      // SAFE HAVEN: Upper floors are valuable
      multiplier += 2.0; // +200% price hike
      factors.push("🛡️ Flood Safe Zone Premium (+200%)");
    }
  }

  // Calculate Final
  return {
    finalPrice: Math.round(basePrice * multiplier),
    multiplier: parseFloat(multiplier.toFixed(2)),
    isBlocked: false,
    factors
  };
};

// 3. Weather Fetcher (Uses Open-Meteo Free API)
export const fetchLocalWeather = async (lat: number, lng: number) => {
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=rain&hourly=rain`
    );
    const data = await res.json();
    return {
      rainMM: data.current.rain || 0,
      // Simple logic: If rain > 30mm/hr, trigger flood mode automatically
      isFloodMode: (data.current.rain || 0) > 30 
    };
  } catch (error) {
    console.error("Weather API Error", error);
    return { rainMM: 0, isFloodMode: false }; // Fallback
  }
};