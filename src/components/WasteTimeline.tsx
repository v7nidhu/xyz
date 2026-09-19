import React, { useState } from "react";
import {
  Calendar,
  Layers,
  Filter,
  Plus,
  Trash2,
  AlertCircle,
  Clock,
  Users,
  CheckCircle2,
  TrendingDown
} from "lucide-react";
import { WasteEvent, WasteStage, WasteTrigger } from "../types";

interface WasteTimelineProps {
  events: WasteEvent[];
  onOpenCapture: () => void;
  onDeleteEvent: (id: string) => void;
}

const DAYS_ORDER = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export const WasteTimeline: React.FC<WasteTimelineProps> = ({
  events,
  onOpenCapture,
  onDeleteEvent,
}) => {
  const [selectedStage, setSelectedStage] = useState<"ALL" | WasteStage>("ALL");
  const [selectedMeal, setSelectedMeal] = useState<string>("ALL");

  // Filter events
  const filteredEvents = events.filter((e) => {
    if (selectedStage !== "ALL" && e.stage !== selectedStage) return false;
    if (selectedMeal !== "ALL" && e.meal !== selectedMeal) return false;
    return true;
  });

  // Group by day of week
  const eventsByDay: Record<string, WasteEvent[]> = {};
  for (const day of DAYS_ORDER) {
    eventsByDay[day] = [];
  }
  for (const ev of filteredEvents) {
    if (eventsByDay[ev.dayOfWeek]) {
      eventsByDay[ev.dayOfWeek].push(ev);
    }
  }

  return (
    <div className="space-y-5">
      {/* Timeline Controls & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#11161d] border border-[#1e2733] p-4 rounded-xl font-mono text-xs">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-amber-400 font-semibold">
            Chronological Investigation Log
          </div>
          <h2 className="text-sm font-bold text-white tracking-tight mt-0.5">
            Shift-by-Shift Waste Timeline (Monday → Sunday)
          </h2>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Stage Filter */}
          <div className="flex items-center bg-[#090d12] p-1 rounded-lg border border-[#1e2735]">
            <span className="text-[#6d7e90] px-2 text-[10px] uppercase">Stage:</span>
            {(["ALL", "PREP", "SERVICE", "PLATE"] as const).map((stg) => (
              <button
                key={stg}
                onClick={() => setSelectedStage(stg)}
                className={`px-2 py-0.5 rounded text-[11px] transition-all ${
                  selectedStage === stg
                    ? stg === "SERVICE"
                      ? "bg-red-500 text-white font-bold"
                      : stg === "PREP"
                      ? "bg-amber-400 text-black font-bold"
                      : stg === "PLATE"
                      ? "bg-blue-500 text-white font-bold"
                      : "bg-[#253242] text-white font-bold"
                    : "text-[#8b9ba8] hover:text-white"
                }`}
              >
                {stg}
              </button>
            ))}
          </div>

          <button
            onClick={onOpenCapture}
            className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-black font-bold rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            Log Shift
          </button>
        </div>
      </div>

      {/* Monday → Sunday Day Tracks */}
      <div className="space-y-4">
        {DAYS_ORDER.map((day) => {
          const dayList = eventsByDay[day] || [];
          const dayTotal = Number(dayList.reduce((acc, e) => acc + e.quantityKg, 0).toFixed(1));
          const dayAttendances = dayList
            .map((e) => e.attendancePct)
            .filter((a): a is number => a !== undefined);
          const avgAtt = dayAttendances.length > 0
            ? Math.round(dayAttendances.reduce((a, b) => a + b, 0) / dayAttendances.length)
            : null;

          return (
            <div
              key={day}
              className={`border rounded-xl transition-all overflow-hidden ${
                day === "Thursday"
                  ? "bg-[#141214] border-red-500/40 shadow-md"
                  : "bg-[#10151c] border-[#1e2836]"
              }`}
            >
              {/* Day Header Strip */}
              <div className="px-4 py-2.5 bg-[#141b24] border-b border-[#1f2a38] flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-white text-sm tracking-wide">{day}</span>
                  {avgAtt !== null && (
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold border ${
                        avgAtt < 65
                          ? "bg-red-950/70 border-red-500/40 text-red-300"
                          : "bg-[#18222d] border-[#293748] text-[#8b9ba8]"
                      }`}
                    >
                      <Users className="w-3 h-3" />
                      Turnout: {avgAtt}% {avgAtt < 65 && "• LOW"}
                    </span>
                  )}
                  {day === "Thursday" && (
                    <span className="px-2 py-0.5 rounded bg-red-900/50 border border-red-500/60 text-red-200 text-[10px] font-bold">
                      BENCHMARK FORENSIC SPIKE (+38%)
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[#8b9ba8]">Daily Discard:</span>
                  <span className="font-bold text-white text-sm">{dayTotal} kg</span>
                  <span className="text-[#647688]">({dayList.length} incidents)</span>
                </div>
              </div>

              {/* Event Cards within Day */}
              {dayList.length === 0 ? (
                <div className="p-4 text-center text-xs font-mono text-[#677788]">
                  No waste events recorded for {day} under current filter.
                </div>
              ) : (
                <div className="divide-y divide-[#1b2431]">
                  {dayList.map((ev) => (
                    <div
                      key={ev.id}
                      className="p-3.5 hover:bg-[#151c26] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono"
                    >
                      {/* Left: Food Item & Badges */}
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-white text-sm font-sans">{ev.foodItem}</span>
                          <span className="text-amber-400 font-bold text-sm">{ev.quantityKg} kg</span>

                          {/* Stage Pill */}
                          <span
                            className={`px-2 py-0.2 rounded text-[10px] font-bold uppercase border ${
                              ev.stage === "SERVICE"
                                ? "bg-red-950/80 border-red-500/50 text-red-300"
                                : ev.stage === "PREP"
                                ? "bg-amber-950/80 border-amber-500/50 text-amber-300"
                                : "bg-blue-950/80 border-blue-500/50 text-blue-300"
                            }`}
                          >
                            {ev.stage}
                          </span>

                          {/* Meal */}
                          <span className="text-[#7d8f9f] text-[11px] bg-[#1a232e] px-1.5 py-0.2 rounded">
                            {ev.meal}
                          </span>

                          {/* Trigger */}
                          {ev.trigger && (
                            <span className="text-[#cad5df] text-[10px] bg-[#222c38] px-2 py-0.2 rounded border border-[#2e3c4d]">
                              Trigger: <strong className="text-white">{ev.trigger}</strong>
                            </span>
                          )}
                        </div>

                        {/* Reason / Circumstance Note */}
                        <p className="text-[11px] text-[#93a3b3] font-sans">
                          {ev.reason}
                        </p>
                      </div>

                      {/* Right: Avoidable & Actions */}
                      <div className="flex items-center gap-3 self-end md:self-auto shrink-0">
                        <div className="text-right">
                          <div className="text-[10px] text-[#718293]">Avoidable</div>
                          <div className="text-emerald-400 font-semibold">{ev.avoidablePct}%</div>
                        </div>

                        <button
                          onClick={() => onDeleteEvent(ev.id)}
                          title="Delete event record"
                          className="p-1.5 text-[#6c7c8c] hover:text-red-400 hover:bg-[#202936] rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
