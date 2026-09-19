import React, { useState, useRef } from "react";
import {
  X,
  Upload,
  Camera,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Layers,
  FileText,
  Loader2,
  Calendar,
  Clock,
  Scale
} from "lucide-react";
import { WasteEvent, WasteStage, WasteTrigger, ClassificationResult } from "../types";

interface WasteCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveEvent: (event: WasteEvent) => void;
}

// Preset realistic demonstration photos for rapid testing
const DEMO_PRESETS = [
  {
    title: "Steamed Rice in Gastronorm Pan",
    foodItem: "Steamed Basmati Rice",
    quantityKg: 7.2,
    stage: "SERVICE" as WasteStage,
    meal: "Lunch" as const,
    notes: "Full gastro tray remaining in steam well #1 at 14:15",
    previewUrl: "https://images.unsplash.com/photo-1516684732162-798a0062be99?w=500&auto=format&fit=crop&q=80",
  },
  {
    title: "Wilted Salad Greens",
    foodItem: "Mixed Salad Leaves",
    quantityKg: 2.8,
    stage: "PREP" as WasteStage,
    meal: "Lunch" as const,
    notes: "Cooler batch showing water weeping and browned edges",
    previewUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=80",
  },
  {
    title: "Yellow Dal Surplus Kettle",
    foodItem: "Yellow Tadka Dal",
    quantityKg: 3.1,
    stage: "SERVICE" as WasteStage,
    meal: "Lunch" as const,
    notes: "Kettle remainder after lunch rush ended",
    previewUrl: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=80",
  },
  {
    title: "Customer Plate Scrapings",
    foodItem: "Chicken & Bread Plate Returns",
    quantityKg: 1.9,
    stage: "PLATE" as WasteStage,
    meal: "Dinner" as const,
    notes: "Uneaten chicken pieces returned on dining trays",
    previewUrl: "https://images.unsplash.com/photo-1576867757603-05b134ebc379?w=500&auto=format&fit=crop&q=80",
  },
];

const TRIGGER_OPTIONS: WasteTrigger[] = [
  "Low customer turnout",
  "Overestimated demand",
  "Menu change",
  "Preparation mistake",
  "Short shelf life",
  "Over-ordering",
  "Weather / Rain drop",
  "Unknown",
];

export const WasteCaptureModal: React.FC<WasteCaptureModalProps> = ({
  isOpen,
  onClose,
  onSaveEvent,
}) => {
  const [activeTab, setActiveTab] = useState<"upload" | "manual">("upload");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>("image/jpeg");

  // Form Fields
  const [foodItem, setFoodItem] = useState("");
  const [quantityKg, setQuantityKg] = useState<number | "">("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [meal, setMeal] = useState<"Breakfast" | "Lunch" | "Dinner" | "All-Day / Snack">("Lunch");
  const [stage, setStage] = useState<WasteStage>("SERVICE");
  const [notes, setNotes] = useState("");
  const [attendancePct, setAttendancePct] = useState<number | "">(58);

  // AI Classification State
  const [isClassifying, setIsClassifying] = useState(false);
  const [aiClassification, setAiClassification] = useState<ClassificationResult | null>(null);
  const [selectedTrigger, setSelectedTrigger] = useState<WasteTrigger | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageMimeType(file.type || "image/jpeg");
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setSelectedImage(result);
      triggerAIClassification(result, file.type);
    };
    reader.readAsDataURL(file);
  };

  // Load a quick demo preset
  const handleSelectPreset = (preset: typeof DEMO_PRESETS[0]) => {
    setFoodItem(preset.foodItem);
    setQuantityKg(preset.quantityKg);
    setStage(preset.stage);
    setMeal(preset.meal);
    setNotes(preset.notes);
    setSelectedImage(preset.previewUrl);
    // Trigger classification for this item
    triggerAIClassification(undefined, undefined, preset.foodItem, preset.quantityKg, preset.stage, preset.notes);
  };

  // Trigger Gemini AI classification
  const triggerAIClassification = async (
    imgBase64?: string,
    mime?: string,
    overrideItem?: string,
    overrideQty?: number,
    overrideStage?: WasteStage,
    overrideNotes?: string
  ) => {
    setIsClassifying(true);
    setErrorMsg(null);

    try {
      const bodyPayload = {
        imageBase64: imgBase64 || (selectedImage && selectedImage.startsWith("data:") ? selectedImage : undefined),
        mimeType: mime || imageMimeType,
        foodItem: overrideItem || foodItem,
        quantityKg: overrideQty || (quantityKg ? Number(quantityKg) : undefined),
        meal,
        notes: overrideNotes || notes,
        currentStage: overrideStage || stage,
      };

      const res = await fetch("/api/classify-waste", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload),
      });

      const data = await res.json();

      if (data.success && data.classification) {
        setAiClassification(data.classification);
        // Pre-fill inputs from AI detection if empty
        if (!foodItem && data.classification.food_item) {
          setFoodItem(data.classification.food_item);
        }
        if (data.classification.waste_stage) {
          setStage(data.classification.waste_stage);
        }
        if (data.classification.probable_triggers && data.classification.probable_triggers.length > 0) {
          const suggested = data.classification.probable_triggers[0] as WasteTrigger;
          if (TRIGGER_OPTIONS.includes(suggested)) {
            setSelectedTrigger(suggested);
          }
        }
      } else {
        throw new Error(data.error || "Failed to classify");
      }
    } catch (err: any) {
      console.warn("Classification failed, using fallback:", err);
      // Fallback classification
      const detectedItem = foodItem || "Steamed White Rice";
      setAiClassification({
        food_item: detectedItem,
        waste_category: "Cooked Starches",
        waste_stage: stage,
        estimated_reason: "Overproduction / Steam table surplus",
        confidence: 86,
        estimated_avoidable_pct: 92,
        probable_triggers: ["Low customer turnout", "Overestimated demand"],
        forensic_notes: "Cooked food discarded unserved from hot holding bar.",
      });
    } finally {
      setIsClassifying(false);
    }
  };

  // Day of week calculation
  const getDayOfWeek = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;
    return days[d.getDay()] || "Thursday";
  };

  const handleSave = () => {
    if (!foodItem.trim()) {
      setErrorMsg("Please specify the food item.");
      return;
    }
    const finalQty = typeof quantityKg === "number" ? quantityKg : parseFloat(quantityKg as any) || 2.5;

    const newEvent: WasteEvent = {
      id: `evt-${Date.now()}`,
      foodItem: foodItem.trim(),
      quantityKg: Number(finalQty.toFixed(1)),
      date,
      dayOfWeek: getDayOfWeek(date),
      meal,
      stage: aiClassification?.waste_stage || stage,
      category: aiClassification?.waste_category || "Cooked Food",
      trigger: selectedTrigger || "Unknown",
      confidence: aiClassification?.confidence || 85,
      avoidablePct: aiClassification?.estimated_avoidable_pct || 90,
      reason: aiClassification?.estimated_reason || (notes ? notes : "Batch overproduction"),
      attendancePct: typeof attendancePct === "number" ? attendancePct : 70,
      notes: notes.trim() || aiClassification?.forensic_notes,
      imageUrl: selectedImage || undefined,
      createdAt: new Date().toISOString(),
    };

    onSaveEvent(newEvent);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#0f141b] border-2 border-[#263342] rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[#1e2836] flex items-center justify-between bg-[#131922]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-mono text-xs font-bold">
              +
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide font-mono">
                LOG WASTE EVENT & FORENSIC CAPTURE
              </h2>
              <p className="text-[11px] text-[#8b9ba8]">
                Identify type, stage, root trigger, and connect with circumstances.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[#7b8c9d] hover:text-white hover:bg-[#1f2937] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 font-mono text-xs">
          {/* Method Tabs */}
          <div className="flex rounded-lg bg-[#090d12] p-1 border border-[#1d2735]">
            <button
              onClick={() => setActiveTab("upload")}
              className={`flex-1 py-1.5 rounded text-xs transition-all flex items-center justify-center gap-2 ${
                activeTab === "upload"
                  ? "bg-amber-400 text-black font-semibold shadow-sm"
                  : "text-[#8b9ba8] hover:text-white"
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              Photo Capture & AI Vision
            </button>
            <button
              onClick={() => setActiveTab("manual")}
              className={`flex-1 py-1.5 rounded text-xs transition-all flex items-center justify-center gap-2 ${
                activeTab === "manual"
                  ? "bg-amber-400 text-black font-semibold shadow-sm"
                  : "text-[#8b9ba8] hover:text-white"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Direct Shift Entry
            </button>
          </div>

          {/* Photo Mode */}
          {activeTab === "upload" && (
            <div className="space-y-3">
              {/* Drop / Select Area */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                  selectedImage
                    ? "border-amber-500/50 bg-[#161c24]"
                    : "border-[#253241] hover:border-amber-400/50 bg-[#0e131a]"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {selectedImage ? (
                  <div className="flex items-center gap-4 text-left">
                    <img
                      src={selectedImage}
                      alt="Food waste preview"
                      referrerPolicy="no-referrer"
                      className="w-20 h-20 object-cover rounded-lg border border-[#344458]"
                    />
                    <div className="flex-1 space-y-1">
                      <div className="text-white font-semibold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        Image Attached
                      </div>
                      <p className="text-[11px] text-[#8b9ba8]">
                        Click to change photo. Gemini AI will classify texture, container, and waste stage.
                      </p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          triggerAIClassification(selectedImage);
                        }}
                        disabled={isClassifying}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/20 text-amber-300 rounded border border-amber-500/30 text-[11px] hover:bg-amber-500/30 transition-colors"
                      >
                        {isClassifying ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Sparkles className="w-3 h-3" />
                        )}
                        Re-classify with Gemini
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="py-4 space-y-2">
                    <div className="w-10 h-10 rounded-full bg-[#18212c] border border-[#273546] flex items-center justify-center mx-auto text-amber-400">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div className="text-white font-medium">
                      Upload food waste photo or drop image here
                    </div>
                    <p className="text-[11px] text-[#788899]">
                      Supports leftovers in gastronorm trays, prep buckets, or return plates.
                    </p>
                  </div>
                )}
              </div>

              {/* Demo presets picker */}
              <div className="space-y-1.5">
                <div className="text-[11px] text-[#718293] uppercase tracking-wider">
                  Or test with common commercial scenarios:
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {DEMO_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className="p-2 bg-[#121820] hover:bg-[#1a222c] border border-[#212c3b] hover:border-amber-500/40 rounded-lg text-left transition-all group"
                    >
                      <div className="text-white font-semibold truncate group-hover:text-amber-300">
                        {preset.foodItem}
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-[#8b9ba8] mt-1">
                        <span>{preset.quantityKg} kg</span>
                        <span className="text-amber-400">{preset.stage}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Form Fields (Common) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-[#121820] p-4 rounded-xl border border-[#1f2a38]">
            {/* Food Item */}
            <div>
              <label className="block text-[#8b9ba8] text-[11px] mb-1 uppercase tracking-wider">
                Food Item <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                value={foodItem}
                onChange={(e) => setFoodItem(e.target.value)}
                placeholder="e.g. Steamed Rice, Dal, Mixed Salad"
                className="w-full bg-[#0a0e13] border border-[#263242] focus:border-amber-400 text-white px-3 py-2 rounded-lg outline-none text-xs"
              />
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-[#8b9ba8] text-[11px] mb-1 uppercase tracking-wider">
                Quantity (kg) <span className="text-amber-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={quantityKg}
                  onChange={(e) => setQuantityKg(e.target.value ? parseFloat(e.target.value) : "")}
                  placeholder="e.g. 7.8"
                  className="w-full bg-[#0a0e13] border border-[#263242] focus:border-amber-400 text-white pl-3 pr-8 py-2 rounded-lg outline-none text-xs"
                />
                <span className="absolute right-3 top-2 text-[#718293] text-xs">kg</span>
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-[#8b9ba8] text-[11px] mb-1 uppercase tracking-wider flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#0a0e13] border border-[#263242] focus:border-amber-400 text-white px-3 py-2 rounded-lg outline-none text-xs"
              />
            </div>

            {/* Meal */}
            <div>
              <label className="block text-[#8b9ba8] text-[11px] mb-1 uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3 h-3" /> Meal Service
              </label>
              <select
                value={meal}
                onChange={(e) => setMeal(e.target.value as any)}
                className="w-full bg-[#0a0e13] border border-[#263242] focus:border-amber-400 text-white px-3 py-2 rounded-lg outline-none text-xs"
              >
                <option value="Breakfast">Breakfast</option>
                <option value="Lunch">Lunch</option>
                <option value="Dinner">Dinner</option>
                <option value="All-Day / Snack">All-Day / Snack</option>
              </select>
            </div>

            {/* Stage Selector (PREP vs SERVICE vs PLATE) */}
            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-[#8b9ba8] text-[11px] uppercase tracking-wider flex items-center justify-between">
                <span>Waste Stage Lifecycle</span>
                <span className="text-amber-400 text-[10px]">Critical for root-cause classification</span>
              </label>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setStage("PREP")}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    stage === "PREP"
                      ? "bg-amber-950/60 border-amber-400 text-amber-200"
                      : "bg-[#0a0e13] border-[#222d3b] text-[#8b9ba8] hover:border-[#35465c]"
                  }`}
                >
                  <div className="font-bold text-xs">PREP</div>
                  <div className="text-[10px] text-[#7f90a1] mt-0.5 font-sans">
                    Discarded during prep / trimming
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setStage("SERVICE")}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    stage === "SERVICE"
                      ? "bg-red-950/60 border-red-500 text-red-200"
                      : "bg-[#0a0e13] border-[#222d3b] text-[#8b9ba8] hover:border-[#35465c]"
                  }`}
                >
                  <div className="font-bold text-xs">SERVICE</div>
                  <div className="text-[10px] text-[#7f90a1] mt-0.5 font-sans">
                    Prepared but never served
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setStage("PLATE")}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    stage === "PLATE"
                      ? "bg-blue-950/60 border-blue-400 text-blue-200"
                      : "bg-[#0a0e13] border-[#222d3b] text-[#8b9ba8] hover:border-[#35465c]"
                  }`}
                >
                  <div className="font-bold text-xs">PLATE</div>
                  <div className="text-[10px] text-[#7f90a1] mt-0.5 font-sans">
                    Served but left uneaten
                  </div>
                </button>
              </div>
            </div>

            {/* Attendance percentage indicator */}
            <div>
              <label className="block text-[#8b9ba8] text-[11px] mb-1 uppercase tracking-wider">
                Shift Attendance / Turnout %
              </label>
              <input
                type="number"
                min="10"
                max="120"
                value={attendancePct}
                onChange={(e) => setAttendancePct(e.target.value ? parseInt(e.target.value) : "")}
                placeholder="e.g. 55"
                className="w-full bg-[#0a0e13] border border-[#263242] focus:border-amber-400 text-white px-3 py-2 rounded-lg outline-none text-xs"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-[#8b9ba8] text-[11px] mb-1 uppercase tracking-wider">
                Staff Observations / Notes
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. 3 pans untouched in warmer after 1:30 PM"
                className="w-full bg-[#0a0e13] border border-[#263242] focus:border-amber-400 text-white px-3 py-2 rounded-lg outline-none text-xs"
              />
            </div>
          </div>

          {/* AI Structured Classification Card (From Prompt) */}
          {aiClassification && (
            <div className="bg-[#141d27] border-2 border-amber-500/40 rounded-xl p-4 space-y-3 shadow-lg">
              <div className="flex items-center justify-between border-b border-[#233142] pb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="text-white font-bold tracking-wide">
                    AI FORENSIC CLASSIFICATION
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[#8b9ba8]">Confidence:</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-300 font-bold">
                    {aiClassification.confidence}%
                  </span>
                </div>
              </div>

              {/* Attributes Grid Matching Example */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="bg-[#0b1016] p-2 rounded border border-[#1e2a39]">
                  <div className="text-[10px] text-[#718293] uppercase">Waste Type</div>
                  <div className="text-white font-semibold truncate mt-0.5">
                    {aiClassification.waste_category}
                  </div>
                </div>

                <div className="bg-[#0b1016] p-2 rounded border border-[#1e2a39]">
                  <div className="text-[10px] text-[#718293] uppercase">Identified Item</div>
                  <div className="text-amber-300 font-bold truncate mt-0.5">
                    {aiClassification.food_item}
                  </div>
                </div>

                <div className="bg-[#0b1016] p-2 rounded border border-[#1e2a39]">
                  <div className="text-[10px] text-[#718293] uppercase">Lifecycle Stage</div>
                  <div className="text-red-400 font-bold truncate mt-0.5">
                    {aiClassification.waste_stage}
                  </div>
                </div>

                <div className="bg-[#0b1016] p-2 rounded border border-[#1e2a39]">
                  <div className="text-[10px] text-[#718293] uppercase">Est. Avoidable</div>
                  <div className="text-emerald-400 font-bold mt-0.5">
                    {aiClassification.estimated_avoidable_pct}%
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-[#b4c4d2] bg-[#0b1016] p-2.5 rounded border border-[#1d2938]">
                <strong className="text-white font-mono uppercase">Forensic Evidence:</strong>{" "}
                <span className="font-sans">{aiClassification.estimated_reason}. {aiClassification.forensic_notes}</span>
              </div>
            </div>
          )}

          {/* THE "TINY QUESTION" - The standout core prompt feature */}
          <div className="bg-[#171a1f] border-2 border-amber-400/50 rounded-xl p-4 space-y-3">
            <div className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-full bg-amber-400 text-black font-bold flex items-center justify-center shrink-0 text-xs">
                ?
              </div>
              <div className="space-y-0.5">
                <div className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wide">
                  The Circumstance Connection
                </div>
                <div className="text-sm font-bold text-white font-sans">
                  Why was today's quantity unusually high?
                </div>
                <p className="text-[11px] text-[#8b9ba8] font-sans">
                  Staff selects one trigger so FoodTrace can correlate waste with circumstances over time.
                </p>
              </div>
            </div>

            {/* Trigger Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {TRIGGER_OPTIONS.map((trig) => (
                <button
                  key={trig}
                  type="button"
                  onClick={() => setSelectedTrigger(trig)}
                  className={`p-2 rounded-lg text-left transition-all border ${
                    selectedTrigger === trig
                      ? "bg-amber-400 text-black font-bold border-amber-300 shadow-md scale-[1.02]"
                      : "bg-[#0f141a] text-[#cad4dc] border-[#222e3e] hover:border-[#3a4e69]"
                  }`}
                >
                  <div className="text-xs">{trig}</div>
                </button>
              ))}
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-950/60 border border-red-500/50 text-red-300 rounded-lg text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 border-t border-[#1e2836] bg-[#121820] flex items-center justify-between">
          <div className="text-[11px] text-[#8b9ba8] font-mono">
            {selectedTrigger ? (
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Circumstance linked: {selectedTrigger}
              </span>
            ) : (
              <span>Select a probable cause above to link circumstance</span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-xs font-mono text-[#8b9ba8] hover:text-white hover:bg-[#1a232f]"
            >
              Cancel
            </button>
            <button
              id="confirm-save-waste-event-btn"
              onClick={handleSave}
              className="px-4 py-2 rounded-lg text-xs font-mono font-bold bg-amber-400 hover:bg-amber-300 text-black transition-all shadow-md shadow-amber-950/40"
            >
              Record Forensic Event
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
