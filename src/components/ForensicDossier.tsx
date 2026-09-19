import React, { useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Target,
  Sparkles,
  Layers,
  HelpCircle,
  CheckCircle2,
  Calendar,
  Users
} from "lucide-react";
import { PatternReport, WasteEvent, WasteStage } from "../types";

interface ForensicDossierProps {
  report: PatternReport;
  events: WasteEvent[];
  onOpenCapture: () => void;
  onNavigateToFingerprint: () => void;
  onNavigateToTimeline: () => void;
}

export const ForensicDossier: React.FC<ForensicDossierProps> = ({
  report,
  events,
  onOpenCapture,
  onNavigateToFingerprint,
  onNavigateToTimeline,
}) => {
  // Day selector for forensic case file (defaults to Thursday benchmark or Today)
  const availableDays = ["All Week", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const [selectedDay, setSelectedDay] = useState<string>("Thursday");

  // Compute metrics for the selected day vs baseline
  const dayEvents = selectedDay === "All Week"
    ? events
    : events.filter((e) => e.dayOfWeek === selectedDay);

  const dayTotalKg = Number(dayEvents.reduce((sum, e) => sum + e.quantityKg, 0).toFixed(1));
  const dayPrepKg = Number(dayEvents.filter((e) => e.stage === "PREP").reduce((sum, e) => sum + e.quantityKg, 0).toFixed(1));
  const dayServiceKg = Number(dayEvents.filter((e) => e.stage === "SERVICE").reduce((sum, e) => sum + e.quantityKg, 0).toFixed(1));
  const dayPlateKg = Number(dayEvents.filter((e) => e.stage === "PLATE").reduce((sum, e) => sum + e.quantityKg, 0).toFixed(1));

  // Attendance for selected day
  const attendances = dayEvents.map((e) => e.attendancePct).filter((a): a is number => a !== undefined);
  const dayAttendanceAvg = attendances.length > 0 ? Math.round(attendances.reduce((a, b) => a + b, 0) / attendances.length) : 75;

  // Comparison vs average daily service waste
  const avgDailyServiceWaste = report.stages.SERVICE.totalKg / 6 || 1;
  const serviceDiffPct = Math.round(((dayServiceKg - avgDailyServiceWaste) / avgDailyServiceWaste) * 100);

  // Determine forensic cause for the selected day
  let dayAnomalyStatement = "";
  let dayCause = "";
  let dayNextAction = "";

  if (selectedDay === "Thursday") {
    dayAnomalyStatement = "Service waste was 38% higher than your weekly baseline.";
    dayCause = "Customer turnout was unusually low (attendance dropped to 54% due to severe thunderstorm / campus strike). Standard 60kg rice and dal batches were prepared without headcount adjustment.";
    dayNextAction = "Reduce batch preparation by 35% on similar weather-forecast or low-turnout days. Introduce flexible staggered cooking at 12:45 PM.";
  } else if (dayServiceKg >= dayPrepKg && dayServiceKg >= dayPlateKg) {
    dayAnomalyStatement = `Service overproduction accounted for ${dayTotalKg > 0 ? Math.round((dayServiceKg / dayTotalKg) * 100) : 0}% of discards (${dayServiceKg} kg).`;
    dayCause = dayAttendanceAvg < 65
      ? `Customer turnout was low (${dayAttendanceAvg}% attendance), leaving hot holding trays untouched.`
      : "Steam table buffer was cooked in fixed batch sizes despite slower mid-shift demand.";
    dayNextAction = "Cap initial morning batch at 65% of par; hold secondary batch in chiller until 12:30 demand confirmation.";
  } else if (dayPrepKg > dayServiceKg) {
    dayAnomalyStatement = `Prep stage was the primary leak, generating ${dayPrepKg} kg in discarded ingredients.`;
    dayCause = "Ingredient shelf-life expiration and aggressive trimming of perishable produce.";
    dayNextAction = "Shift salad batch dressing to on-demand service and audit automatic vegetable peel machine calibration.";
  } else {
    dayAnomalyStatement = `Plate returns dominated with ${dayPlateKg} kg uneaten by guests.`;
    dayCause = "Portion size discrepancy or recipe seasoning feedback (e.g. overcooked pasta or oversalted side).";
    dayNextAction = "Trim standard starch scoop size by 15% and collect direct diner feedback on recipe seasoning.";
  }

  return (
    <div className="space-y-6">
      {/* Scope Subhead & Pitch */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#11171f] border border-[#1e2733] p-4 rounded-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono tracking-wider uppercase text-amber-400 font-semibold">
              Forensic Case Dossier
            </span>
            <span className="text-[#4b5b6d]">•</span>
            <span className="text-xs text-[#8b9ba8] font-mono">
              Audit Period: Mon Sep 14 – Sun Sep 20, 2026
            </span>
          </div>
          <h1 className="text-lg font-bold text-white tracking-tight">
            FoodTrace Forensic Investigation
          </h1>
          <p className="text-xs text-[#98a6b3] max-w-2xl">
            FoodTrace doesn't just measure food waste. It finds out <span className="text-white font-medium">where the waste happens</span>, <span className="text-white font-medium">why it happens</span>, and <span className="text-amber-300 font-medium">what pattern could prevent it next time</span>.
          </p>
        </div>

        {/* Day Selector Pills */}
        <div className="flex flex-wrap items-center gap-1.5 self-start md:self-auto bg-[#0a0e13] p-1 rounded-lg border border-[#1e2836]">
          {availableDays.map((d) => (
            <button
              key={d}
              id={`day-select-${d.toLowerCase().replace(/\s+/g, "-")}`}
              onClick={() => setSelectedDay(d)}
              className={`px-2.5 py-1 text-xs font-mono rounded transition-all ${
                selectedDay === d
                  ? "bg-amber-400 text-black font-semibold shadow-sm"
                  : "text-[#8b9ba8] hover:text-white hover:bg-[#151c24]"
              }`}
            >
              {d === "All Week" ? "7-Day Summary" : d.slice(0, 3)}
            </button>
          ))}
        </div>
      </div>

      {/* Main Investigative Briefing Card (Matching exact user mock format) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Dossier Telemetry Box */}
        <div className="lg:col-span-7 bg-[#10151c] border-2 border-[#263342] rounded-xl p-5 sm:p-6 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 px-3 py-1 bg-amber-500/10 border-b border-l border-amber-500/30 text-[10px] font-mono text-amber-400 tracking-wider">
            CASE FILE: FT-{selectedDay.toUpperCase().slice(0, 3)}-2026
          </div>

          <div className="space-y-6">
            {/* Header / Metric */}
            <div className="border-b border-[#212c3b] pb-5">
              <div className="text-xs font-mono tracking-widest text-[#7b8c9d] uppercase mb-1">
                {selectedDay === "All Week" ? "Total Weekly Waste" : `${selectedDay}'s Waste Audit`}
              </div>
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                  {dayTotalKg} <span className="text-2xl font-normal text-amber-400">kg</span>
                </span>
                <span className="text-xs font-mono text-[#8b9ba8] bg-[#17202b] px-2.5 py-1 rounded border border-[#2b394a]">
                  Attendance: <span className="text-white font-semibold">{dayAttendanceAvg}%</span>
                </span>
              </div>
            </div>

            {/* Section 1: Where it happened (3 stages) */}
            <div className="space-y-2.5">
              <div className="text-xs font-mono font-semibold tracking-wider text-amber-400 uppercase flex items-center gap-2">
                <Layers className="w-3.5 h-3.5" />
                Where it happened
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                {/* PREP */}
                <div className="bg-[#151c25] border border-[#253241] p-3 rounded-lg">
                  <div className="flex items-center justify-between text-[11px] font-mono text-[#8b9ba8]">
                    <span>Preparation</span>
                    <span className="text-amber-400 font-semibold">
                      {dayTotalKg > 0 ? Math.round((dayPrepKg / dayTotalKg) * 100) : 0}%
                    </span>
                  </div>
                  <div className="text-lg font-mono font-bold text-white mt-1">
                    {dayPrepKg} <span className="text-xs font-normal text-[#8b9ba8]">kg</span>
                  </div>
                  <div className="text-[10px] text-[#718293] mt-0.5">Trimming & prep spoilage</div>
                </div>

                {/* SERVICE (Highlight) */}
                <div className="bg-[#1c1817] border-2 border-red-500/40 p-3 rounded-lg relative">
                  <div className="flex items-center justify-between text-[11px] font-mono text-red-300">
                    <span className="font-semibold">Service</span>
                    <span className="bg-red-950 px-1 rounded text-red-400 font-bold">
                      {dayTotalKg > 0 ? Math.round((dayServiceKg / dayTotalKg) * 100) : 0}%
                    </span>
                  </div>
                  <div className="text-lg font-mono font-bold text-red-200 mt-1">
                    {dayServiceKg} <span className="text-xs font-normal text-red-400/80">kg</span>
                  </div>
                  <div className="text-[10px] text-red-400/80 mt-0.5">Unserved batch surplus</div>
                </div>

                {/* PLATE */}
                <div className="bg-[#151c25] border border-[#253241] p-3 rounded-lg">
                  <div className="flex items-center justify-between text-[11px] font-mono text-[#8b9ba8]">
                    <span>Plate</span>
                    <span className="text-blue-400 font-semibold">
                      {dayTotalKg > 0 ? Math.round((dayPlateKg / dayTotalKg) * 100) : 0}%
                    </span>
                  </div>
                  <div className="text-lg font-mono font-bold text-white mt-1">
                    {dayPlateKg} <span className="text-xs font-normal text-[#8b9ba8]">kg</span>
                  </div>
                  <div className="text-[10px] text-[#718293] mt-0.5">Diner uneaten scraps</div>
                </div>
              </div>
            </div>

            {/* Section 2: What changed */}
            <div className="bg-[#141b24] border-l-4 border-amber-400 p-3.5 rounded-r-lg space-y-1">
              <div className="text-[11px] font-mono uppercase tracking-wider text-amber-300 font-semibold flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" />
                What changed
              </div>
              <p className="text-sm text-[#cad5df] font-medium leading-relaxed">
                {dayAnomalyStatement}
              </p>
            </div>

            {/* Section 3: Possible cause */}
            <div className="bg-[#141b24] border-l-4 border-red-400 p-3.5 rounded-r-lg space-y-1">
              <div className="text-[11px] font-mono uppercase tracking-wider text-red-300 font-semibold flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5" />
                Possible cause
              </div>
              <p className="text-sm text-[#cad5df] leading-relaxed">
                {dayCause}
              </p>
            </div>

            {/* Section 4: Next action */}
            <div className="bg-[#11241a] border-l-4 border-emerald-400 p-3.5 rounded-r-lg space-y-1">
              <div className="text-[11px] font-mono uppercase tracking-wider text-emerald-300 font-semibold flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" />
                Next action
              </div>
              <p className="text-sm text-[#c6ebd4] font-medium leading-relaxed">
                {dayNextAction}
              </p>
            </div>
          </div>
        </div>

        {/* Right Stage Pipeline & The "Aha!" Discovery */}
        <div className="lg:col-span-5 space-y-4">
          {/* Conceptual Identity Box: Three Waste Stages */}
          <div className="bg-[#10161e] border border-[#212c3a] rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#1f2a38] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-white font-bold">
                  The Three Waste Stages
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[#8b9ba8]">
                Standard Lifecycle
              </span>
            </div>

            {/* Stage Flow */}
            <div className="space-y-3 font-mono">
              {/* PREP */}
              <div className="bg-[#151c26] border border-[#263445] p-3 rounded-lg flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-amber-950/70 border border-amber-500/40 text-amber-300 font-bold text-xs">
                      1. PREP
                    </span>
                    <span className="text-xs text-white font-medium">Preparation Stage</span>
                  </div>
                  <p className="text-[11px] text-[#8b9ba8] mt-1 font-sans">
                    Food discarded during kitchen preparation, peeling & trimming.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-white">{report.stages.PREP.totalKg} kg</span>
                  <div className="text-[10px] text-[#8b9ba8]">({report.stages.PREP.percentage}%)</div>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center text-[#495b6e]">
                <ArrowRight className="w-4 h-4 rotate-90" />
              </div>

              {/* SERVICE (The Big Culprit) */}
              <div className="bg-[#211516] border-2 border-red-500/50 p-3 rounded-lg flex items-start justify-between relative shadow-lg">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-red-950 border border-red-500 text-red-300 font-bold text-xs">
                      2. SERVICE
                    </span>
                    <span className="text-xs text-red-200 font-bold">Service Stage</span>
                    <span className="px-1.5 py-0.2 rounded bg-red-900/60 text-[9px] text-red-200 uppercase font-mono">
                      Largest Leak
                    </span>
                  </div>
                  <p className="text-[11px] text-red-200/80 mt-1 font-sans">
                    Food prepared and cooked for service, but never served or bought.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-red-300">{report.stages.SERVICE.totalKg} kg</span>
                  <div className="text-[10px] text-red-400">({report.stages.SERVICE.percentage}%)</div>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center text-[#495b6e]">
                <ArrowRight className="w-4 h-4 rotate-90" />
              </div>

              {/* PLATE */}
              <div className="bg-[#151c26] border border-[#263445] p-3 rounded-lg flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-blue-950/70 border border-blue-500/40 text-blue-300 font-bold text-xs">
                      3. PLATE
                    </span>
                    <span className="text-xs text-white font-medium">Plate Waste</span>
                  </div>
                  <p className="text-[11px] text-[#8b9ba8] mt-1 font-sans">
                    Food served to diners but left unconsumed on plates.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-white">{report.stages.PLATE.totalKg} kg</span>
                  <div className="text-[10px] text-[#8b9ba8]">({report.stages.PLATE.percentage}%)</div>
                </div>
              </div>
            </div>

            {/* The Master Operational Insight Quote (from prompt) */}
            <div className="bg-[#1a1512] border border-amber-500/40 p-3.5 rounded-lg space-y-1.5">
              <div className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                The Operational Breakthrough
              </div>
              <p className="text-xs italic text-[#e7dcd5] leading-relaxed font-sans">
                “{report.forensicHeadline}”
              </p>
            </div>
          </div>

          {/* Quick Trigger Correlation Widget */}
          <div className="bg-[#10161e] border border-[#212c3a] rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#8b9ba8] flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-amber-400" />
                Turnout Correlation Finding:
              </span>
              <span className="text-red-400 font-bold">+{report.lowAttendanceCorrelation.percentageSpike}% Spike</span>
            </div>

            <p className="text-xs text-[#cad5df] leading-relaxed">
              Your <strong className="text-white">{report.mostWastedItem.name}</strong> waste increased{" "}
              <span className="text-amber-300 font-semibold">{report.lowAttendanceCorrelation.percentageSpike}%</span> on days when attendance dropped below 60%.
            </p>

            <div className="pt-1 flex items-center justify-between">
              <button
                onClick={onNavigateToFingerprint}
                className="text-xs font-mono text-amber-400 hover:text-amber-300 hover:underline flex items-center gap-1"
              >
                Inspect Waste Fingerprint matrix →
              </button>
              <button
                onClick={onOpenCapture}
                className="px-2.5 py-1 text-xs font-mono bg-[#1c2430] hover:bg-[#253140] text-white rounded border border-[#2b394b]"
              >
                + Log New Event
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Forensic Findings Summary Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 font-mono text-xs">
        <div className="bg-[#111720] border border-[#202b38] p-3.5 rounded-lg">
          <div className="text-[#7c8d9e] text-[11px]">Most Wasted Item</div>
          <div className="text-white font-bold text-sm mt-0.5">{report.mostWastedItem.name}</div>
          <div className="text-amber-400 text-[11px] mt-0.5">
            {report.mostWastedItem.totalKg} kg ({report.mostWastedItem.pctOfTotal}% of all waste)
          </div>
        </div>

        <div className="bg-[#111720] border border-[#202b38] p-3.5 rounded-lg">
          <div className="text-[#7c8d9e] text-[11px]">Highest Waste Day</div>
          <div className="text-white font-bold text-sm mt-0.5">{report.highestWasteDay.day}</div>
          <div className="text-red-400 text-[11px] mt-0.5">
            {report.highestWasteDay.totalKg} kg (Attendance: {report.highestWasteDay.attendanceAvg}%)
          </div>
        </div>

        <div className="bg-[#111720] border border-[#202b38] p-3.5 rounded-lg">
          <div className="text-[#7c8d9e] text-[11px]">Dominant Waste Stage</div>
          <div className="text-white font-bold text-sm mt-0.5">{report.dominantStage.stage} STAGE</div>
          <div className="text-red-300 text-[11px] mt-0.5">
            {report.dominantStage.totalKg} kg ({report.dominantStage.pct}% of total)
          </div>
        </div>

        <div className="bg-[#111720] border border-[#202b38] p-3.5 rounded-lg">
          <div className="text-[#7c8d9e] text-[11px]">Avoidable Volume</div>
          <div className="text-emerald-400 font-bold text-sm mt-0.5">{report.totalAvoidableKg} kg ({report.avoidablePercentage}%)</div>
          <div className="text-[#8b9ba8] text-[11px] mt-0.5">
            Est. Cost Leakage: ~${report.estimatedCostLoss}
          </div>
        </div>
      </div>
    </div>
  );
};
