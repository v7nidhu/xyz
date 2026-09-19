import React from "react";
import { ShieldAlert, Plus, RotateCcw, AlertTriangle, Scale } from "lucide-react";
import { PatternReport } from "../types";

interface HeaderProps {
  activeTab: "dossier" | "timeline" | "fingerprint";
  setActiveTab: (tab: "dossier" | "timeline" | "fingerprint") => void;
  onOpenCapture: () => void;
  onResetData: () => void;
  report: PatternReport;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenCapture,
  onResetData,
  report,
}) => {
  return (
    <header className="border-b border-[#212a35] bg-[#0e1319]/95 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3.5 gap-3">
          {/* Logo & Pitch */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400 font-mono font-bold text-lg shadow-sm">
              FT
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold tracking-wider text-white text-base">FOODTRACE</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-emerald-950/60 border border-emerald-500/30 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
                  OPERATIONAL TELEMETRY
                </span>
              </div>
              <p className="text-xs text-[#8b9ba8] hidden sm:block">
                Forensic investigation: <span className="text-[#cad4dc]">Where did the food waste actually come from?</span>
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="hidden lg:flex items-center gap-4 bg-[#141b22] border border-[#26313f] px-3.5 py-1.5 rounded-lg text-xs font-mono">
            <div className="flex items-center gap-2">
              <Scale className="w-3.5 h-3.5 text-[#8b9ba8]" />
              <span className="text-[#8b9ba8]">Weekly:</span>
              <span className="text-white font-semibold">{report.totalWeeklyKg} kg</span>
            </div>
            <span className="text-[#324050]">|</span>
            <div className="flex items-center gap-1.5">
              <span className="text-pink-400 font-medium">Service Overprep:</span>
              <span className="text-white font-semibold">{report.stages.SERVICE.percentage}%</span>
            </div>
            <span className="text-[#324050]">|</span>
            <div className="flex items-center gap-1.5 text-emerald-400">
              <span>Avoidable:</span>
              <span className="font-semibold">{report.totalAvoidableKg} kg ({report.avoidablePercentage}%)</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5">
            <button
              id="reset-sample-data-btn"
              onClick={onResetData}
              title="Reset to benchmark 7-day investigation scenario"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-medium text-[#8b9ba8] hover:text-[#e1e7ec] bg-[#141b22] border border-[#26313f] hover:border-[#384658] transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Reset</span> Demo
            </button>

            <button
              id="open-waste-capture-btn"
              onClick={onOpenCapture}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-mono font-semibold text-black bg-pink-400 hover:bg-pink-300 active:scale-[0.98] transition-all shadow-md shadow-pink-950/40"
            >
              <Plus className="w-4 h-4 text-black stroke-[2.5]" />
              Log Waste Event
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 border-t border-[#1c242f] pt-2 pb-2 overflow-x-auto text-xs font-mono">
          <button
            id="nav-tab-dossier"
            onClick={() => setActiveTab("dossier")}
            className={`px-3.5 py-1.5 rounded-md transition-colors flex items-center gap-2 ${
              activeTab === "dossier"
                ? "bg-pink-500/15 text-pink-300 border border-pink-500/30 font-semibold"
                : "text-[#8b9ba8] hover:text-[#d3dde6] hover:bg-[#151c24]"
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Forensic Investigation
          </button>

          <button
            id="nav-tab-timeline"
            onClick={() => setActiveTab("timeline")}
            className={`px-3.5 py-1.5 rounded-md transition-colors flex items-center gap-2 ${
              activeTab === "timeline"
                ? "bg-pink-500/15 text-pink-300 border border-pink-500/30 font-semibold"
                : "text-[#8b9ba8] hover:text-[#d3dde6] hover:bg-[#151c24]"
            }`}
          >
            <span>Waste Timeline</span>
            <span className="px-1.5 py-0.2 rounded bg-[#1e2632] text-[10px] text-[#8b9ba8]">
              Mon → Sun
            </span>
          </button>

          <button
            id="nav-tab-fingerprint"
            onClick={() => setActiveTab("fingerprint")}
            className={`px-3.5 py-1.5 rounded-md transition-colors flex items-center gap-2 ${
              activeTab === "fingerprint"
                ? "bg-pink-500/15 text-pink-300 border border-pink-500/30 font-semibold"
                : "text-[#8b9ba8] hover:text-[#d3dde6] hover:bg-[#151c24]"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Waste Fingerprint & Root Causes</span>
          </button>
        </div>
      </div>
    </header>
  );
};
