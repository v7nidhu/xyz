export type WasteStage = "PREP" | "SERVICE" | "PLATE";

export type MealType = "Breakfast" | "Lunch" | "Dinner" | "All-Day / Snack";

export type WasteTrigger =
  | "Low customer turnout"
  | "Overestimated demand"
  | "Menu change"
  | "Preparation mistake"
  | "Short shelf life"
  | "Over-ordering"
  | "Weather / Rain drop"
  | "Holiday slowdown"
  | "Unknown";

export interface WasteEvent {
  id: string;
  foodItem: string;
  quantityKg: number;
  date: string; // YYYY-MM-DD
  dayOfWeek: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
  meal: MealType;
  stage: WasteStage;
  category: string;
  trigger?: WasteTrigger;
  confidence: number;
  avoidablePct: number;
  reason: string;
  attendancePct?: number; // e.g., 55% attendance
  notes?: string;
  imageUrl?: string;
  createdAt: string;
}

export interface StageMetric {
  stage: WasteStage;
  label: string;
  description: string;
  totalKg: number;
  percentage: number;
  avoidableKg: number;
  eventCount: number;
  color: string;
}

export interface WasteFingerprintRow {
  food: string;
  category: string;
  totalKg: number;
  eventCount: number;
  dominantStage: WasteStage;
  commonTrigger: WasteTrigger | string;
  avoidableKg: number;
  correlationNote: string;
}

export interface PatternReport {
  totalWeeklyKg: number;
  totalAvoidableKg: number;
  avoidablePercentage: number;
  estimatedCostLoss: number; // in USD assuming avg $4.20/kg
  mostWastedItem: {
    name: string;
    totalKg: number;
    pctOfTotal: number;
    commonTrigger: string;
  };
  highestWasteDay: {
    day: string;
    totalKg: number;
    dominantItem: string;
    attendanceAvg: number;
  };
  dominantStage: {
    stage: WasteStage;
    totalKg: number;
    pct: number;
  };
  stages: {
    PREP: StageMetric;
    SERVICE: StageMetric;
    PLATE: StageMetric;
  };
  triggerBreakdown: { trigger: string; totalKg: number; count: number }[];
  fingerprintRows: WasteFingerprintRow[];
  lowAttendanceCorrelation: {
    lowAttendanceAvgKg: number;
    normalAttendanceAvgKg: number;
    percentageSpike: number;
    primaryImpactedItem: string;
  };
  forensicHeadline: string;
  primaryCause: string;
  recommendedAction: string;
}

export interface ClassificationResult {
  food_item: string;
  waste_category: string;
  waste_stage: WasteStage;
  estimated_reason: string;
  confidence: number;
  estimated_avoidable_pct: number;
  probable_triggers?: string[];
  forensic_notes?: string;
}
