import React, { useState, useEffect, useMemo } from "react";
import { Header } from "./components/Header";
import { ForensicDossier } from "./components/ForensicDossier";
import { WasteTimeline } from "./components/WasteTimeline";
import { WasteFingerprint } from "./components/WasteFingerprint";
import { WasteCaptureModal } from "./components/WasteCaptureModal";
import { INITIAL_WASTE_EVENTS } from "./data/initialLogs";
import { analyzeWastePatterns } from "./utils/patternEngine";
import { WasteEvent } from "./types";

const STORAGE_KEY = "foodtrace_events_v2";

export default function App() {
  const [events, setEvents] = useState<WasteEvent[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Could not load from localStorage:", e);
    }
    return INITIAL_WASTE_EVENTS;
  });

  const [activeTab, setActiveTab] = useState<"dossier" | "timeline" | "fingerprint">("dossier");
  const [isCaptureOpen, setIsCaptureOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    } catch (e) {
      console.warn("Could not save to localStorage:", e);
    }
  }, [events]);

  // Compute deterministic pattern report
  const report = useMemo(() => analyzeWastePatterns(events), [events]);

  const handleSaveEvent = (newEvent: WasteEvent) => {
    setEvents((prev) => [newEvent, ...prev]);
  };

  const handleDeleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  const handleResetData = () => {
    if (window.confirm("Reset to canonical 7-day canteen investigation scenario?")) {
      setEvents(INITIAL_WASTE_EVENTS);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e13] text-[#e1e7ec] flex flex-col font-sans">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCapture={() => setIsCaptureOpen(true)}
        onResetData={handleResetData}
        report={report}
      />

      {/* Main Body Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === "dossier" && (
          <ForensicDossier
            report={report}
            events={events}
            onOpenCapture={() => setIsCaptureOpen(true)}
            onNavigateToFingerprint={() => setActiveTab("fingerprint")}
            onNavigateToTimeline={() => setActiveTab("timeline")}
          />
        )}

        {activeTab === "timeline" && (
          <WasteTimeline
            events={events}
            onOpenCapture={() => setIsCaptureOpen(true)}
            onDeleteEvent={handleDeleteEvent}
          />
        )}

        {activeTab === "fingerprint" && (
          <WasteFingerprint report={report} events={events} />
        )}
      </main>

      {/* Forensic Waste Capture Modal */}
      <WasteCaptureModal
        isOpen={isCaptureOpen}
        onClose={() => setIsCaptureOpen(false)}
        onSaveEvent={handleSaveEvent}
      />

      {/* Minimal Industrial Footer */}
      <footer className="border-t border-[#18212c] bg-[#0c1015] py-4 text-xs font-mono text-[#6c7d8e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white tracking-wider">FOODTRACE</span>
            <span>•</span>
            <span>Where did the food waste actually come from?</span>
          </div>
          <div>
            <span>Waste → Pattern → Cause → Preventive Action</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
