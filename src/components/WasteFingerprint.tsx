import React, { useState } from "react";
import {
  Sparkles,
  ArrowRight,
  TrendingDown,
  Layers,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  HelpCircle,
  Loader2,
  DollarSign,
  Scale
} from "lucide-react";
import { PatternReport, WasteEvent } from "../types";

interface WasteFingerprintProps {
  report: PatternReport;
  events: WasteEvent[];
}

export const WasteFingerprint: React.FC<WasteFingerprintProps> = ({
  report,
  events,
}) => {
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [aiReport, setAiReport] = useState<{
    headline: string;
    stage_breakdown_diagnosis: string;
    primary_culprit_matrix?: Array<{
      food: string;
      waste_kg: number;
      common_trigger: string;
      stage: string;
      recommended_batch_adjustment: string;
    }>;
    immediate_action: string;
    estimated_monthly_savings_kg?: number;
  } | null>(null);

  const handleRunAiAudit = async () => {
    setIsSynthesizing(true);
    try {
      const res = await fetch("/api/explain-fingerprint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          summary: {
            totalWeeklyKg: report.totalWeeklyKg,
            stages: report.stages,
            mostWastedItem: report.mostWastedItem,
            lowAttendanceSpike: report.lowAttendanceCorrelation,
          },
          logs: events,
        }),
      });
      const data = await res.json();
      if (data.success && data.report) {
        setAiReport(data.report);
      }
    } catch (err) {
      console.warn("Synthesis failed:", err);
    } finally {
      setIsSynthesizing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header / Intro */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#11171f] border border-[#1e2733] p-4 rounded-xl font-mono text-xs">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-amber-400 font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            The Core Discovery Engine
          </div>
          <h2 className="text-sm font-bold text-white tracking-tight mt-0.5">
            Waste Fingerprint & Operational Cause-Effect
          </h2>
          <p className="text-[#8b9ba8] font-sans text-xs mt-1">
            Connecting waste volume with real operational circumstances over time.
          </p>
        </div>

        <button
          onClick={handleRunAiAudit}
          disabled={isSynthesizing}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-black font-bold transition-all shadow-md shadow-amber-950/40 disabled:opacity-50"
        >
          {isSynthesizing ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Sparkles className="w-3.5 h-3.5" />
          )}
          Deep Forensic AI Audit
        </button>
      </div>

      {/* The Master Discovery Callout Banner (Direct from user prompt) */}
      <div className="bg-[#1a1412] border-2 border-amber-500/50 rounded-xl p-5 relative overflow-hidden shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 border border-amber-500/40 text-amber-300 uppercase tracking-wider">
              KEY PATTERN INSIGHT
            </span>
            <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
              “Your largest recurring waste isn't caused by one food item. It happens mainly on low-attendance days in the Service stage.”
            </h3>
            <p className="text-xs text-[#cad5df] leading-relaxed">
              When kitchen preparation volume remains static despite shifts in customer turnout, unserved buffet and steam bar food accumulates rapidly.
            </p>
          </div>

          <div className="shrink-0 bg-[#0d1014] border border-[#2b394b] p-3 rounded-lg font-mono text-xs space-y-1 text-right">
            <div className="text-[#8b9ba8] text-[10px]">Service Overprep Share</div>
            <div className="text-red-400 font-bold text-lg">{report.stages.SERVICE.percentage}% of all waste</div>
            <div className="text-emerald-400 text-[11px] font-medium">{report.stages.SERVICE.avoidableKg} kg avoidable</div>
          </div>
        </div>
      </div>

      {/* The 4-Step Chain: Waste → Pattern → Cause → Preventive Action */}
      <div className="bg-[#10151c] border border-[#1f2a38] rounded-xl p-5 space-y-3 font-mono text-xs">
        <div className="text-[#8b9ba8] text-[11px] uppercase tracking-wider">
          Forensic Operational Progression
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Step 1: Waste */}
          <div className="bg-[#151c26] border border-[#263445] p-3.5 rounded-lg space-y-1">
            <div className="flex items-center justify-between text-[10px] text-amber-400 font-bold">
              <span>1. WASTE</span>
              <span>{report.totalWeeklyKg} kg</span>
            </div>
            <div className="text-white font-bold text-xs mt-1 font-sans">
              Discard Event Logged
            </div>
            <p className="text-[11px] text-[#8b9ba8] font-sans">
              Rice, dal, salad, and bread discarded across 18 separate incidents.
            </p>
          </div>

          {/* Step 2: Pattern */}
          <div className="bg-[#151c26] border border-[#263445] p-3.5 rounded-lg space-y-1">
            <div className="flex items-center justify-between text-[10px] text-amber-400 font-bold">
              <span>2. PATTERN</span>
              <span>+42% Spike</span>
            </div>
            <div className="text-white font-bold text-xs mt-1 font-sans">
              Attendance Sensitivity
            </div>
            <p className="text-[11px] text-[#8b9ba8] font-sans">
              Waste spikes sharply on days when customer headcount drops below 60%.
            </p>
          </div>

          {/* Step 3: Cause */}
          <div className="bg-[#151c26] border border-[#263445] p-3.5 rounded-lg space-y-1">
            <div className="flex items-center justify-between text-[10px] text-red-400 font-bold">
              <span>3. CAUSE</span>
              <span>Static Par</span>
            </div>
            <div className="text-white font-bold text-xs mt-1 font-sans">
              Pre-rush Overproduction
            </div>
            <p className="text-[11px] text-[#8b9ba8] font-sans">
              Kitchen cooks 100% batch early; unserved cooked food held past safety limits.
            </p>
          </div>

          {/* Step 4: Action */}
          <div className="bg-[#112318] border border-emerald-500/40 p-3.5 rounded-lg space-y-1">
            <div className="flex items-center justify-between text-[10px] text-emerald-400 font-bold">
              <span>4. ACTION</span>
              <span>Preventive</span>
            </div>
            <div className="text-emerald-300 font-bold text-xs mt-1 font-sans">
              Two-Tier Batch Prep
            </div>
            <p className="text-[11px] text-[#a9d9be] font-sans">
              Cook 60% standard par before rush; prepare remainder only if turnout confirms.
            </p>
          </div>
        </div>
      </div>

      {/* The Waste Fingerprint Matrix (From Prompt) */}
      <div className="bg-[#10151c] border border-[#1f2a38] rounded-xl overflow-hidden font-mono text-xs">
        <div className="px-5 py-3.5 bg-[#141b24] border-b border-[#1e2836] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-white tracking-wider">
              WASTE FINGERPRINT MATRIX
            </span>
          </div>
          <span className="text-[11px] text-[#8b9ba8]">
            Sorted by Total Waste Volume
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#1b2532] text-[10px] uppercase text-[#718293] bg-[#0c1015]">
                <th className="py-2.5 px-4">Food Item</th>
                <th className="py-2.5 px-4">Total Waste</th>
                <th className="py-2.5 px-4">Dominant Stage</th>
                <th className="py-2.5 px-4">Common Trigger</th>
                <th className="py-2.5 px-4">Avoidable</th>
                <th className="py-2.5 px-4">Forensic Operational Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#18212c]">
              {report.fingerprintRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-[#141c25] transition-colors">
                  <td className="py-3 px-4 font-bold text-white font-sans text-sm">
                    {row.food}
                    <div className="text-[10px] text-[#718293] font-mono font-normal">
                      {row.category}
                    </div>
                  </td>

                  <td className="py-3 px-4 font-bold text-amber-400 text-sm">
                    {row.totalKg} kg
                    <span className="text-[10px] text-[#718293] font-normal ml-1">
                      ({row.eventCount}x)
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                        row.dominantStage === "SERVICE"
                          ? "bg-red-950/80 border-red-500/50 text-red-300"
                          : row.dominantStage === "PREP"
                          ? "bg-amber-950/80 border-amber-500/50 text-amber-300"
                          : "bg-blue-950/80 border-blue-500/50 text-blue-300"
                      }`}
                    >
                      {row.dominantStage}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-[#1c2633] text-white text-[11px] border border-[#2b3a4d]">
                      {row.commonTrigger}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-emerald-400 font-semibold">
                    {row.avoidableKg} kg
                  </td>

                  <td className="py-3 px-4 text-[#cad5df] text-[11px] font-sans">
                    {row.correlationNote}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Deep Audit Output (if triggered) */}
      {aiReport && (
        <div className="bg-[#121c27] border-2 border-amber-400/50 rounded-xl p-5 space-y-4 font-mono text-xs shadow-xl animate-in fade-in duration-300">
          <div className="flex items-center justify-between border-b border-[#223347] pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-white uppercase tracking-wider text-sm">
                Executive Forensic Audit Briefing
              </span>
            </div>
            {aiReport.estimated_monthly_savings_kg && (
              <span className="px-2.5 py-1 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-300 font-bold">
                Est. Monthly Savings: ~{aiReport.estimated_monthly_savings_kg} kg
              </span>
            )}
          </div>

          <div className="space-y-3 font-sans">
            <div className="text-sm font-bold text-amber-300 leading-snug">
              “{aiReport.headline}”
            </div>

            <p className="text-xs text-[#cad5df] leading-relaxed">
              {aiReport.stage_breakdown_diagnosis}
            </p>

            {aiReport.primary_culprit_matrix && aiReport.primary_culprit_matrix.length > 0 && (
              <div className="bg-[#0b1016] p-3 rounded-lg border border-[#1e2a39] space-y-2 font-mono">
                <div className="text-[11px] text-amber-400 uppercase font-bold">
                  Recommended Batch Adjustments by Item:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {aiReport.primary_culprit_matrix.map((item, i) => (
                    <div key={i} className="bg-[#141b24] p-2.5 rounded border border-[#253241]">
                      <div className="flex items-center justify-between font-bold text-white">
                        <span>{item.food} ({item.waste_kg} kg)</span>
                        <span className="text-amber-400 text-[10px]">{item.stage}</span>
                      </div>
                      <div className="text-[11px] text-emerald-300 mt-1">
                        → {item.recommended_batch_adjustment}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-[#11241a] border-l-4 border-emerald-400 p-3 rounded-r-lg space-y-1">
              <div className="text-[11px] font-mono uppercase text-emerald-300 font-bold">
                Priority Action for Tomorrow:
              </div>
              <p className="text-xs text-[#c6ebd4]">
                {aiReport.immediate_action}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Trigger Breakdown Breakdown Pills */}
      <div className="bg-[#10151c] border border-[#1f2a38] rounded-xl p-4 font-mono text-xs space-y-3">
        <div className="text-[#8b9ba8] text-[11px] uppercase tracking-wider">
          Aggregated Circumstantial Triggers
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {report.triggerBreakdown.map((t, idx) => (
            <div key={idx} className="bg-[#151c25] border border-[#24303f] p-3 rounded-lg">
              <div className="text-[#8b9ba8] text-[10px] truncate">{t.trigger}</div>
              <div className="text-white font-bold text-sm mt-1">{t.totalKg} kg</div>
              <div className="text-[#64778a] text-[10px]">{t.count} logged incidents</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
