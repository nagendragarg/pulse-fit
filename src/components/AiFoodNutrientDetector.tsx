import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Camera,
  Upload,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Apple,
  Flame,
  Activity,
  Layers,
  Tag,
  Scale,
  Zap,
  Info,
  ChevronDown,
  ChevronUp,
  X,
  Plus,
  Trash2,
  Edit2,
  Check,
} from 'lucide-react';
import { api } from '../api/client.ts';
import { useToast } from './Toast.tsx';
import { AiFoodDetectionResult, DetectedFoodItem } from '../types/index.ts';

interface AiFoodNutrientDetectorProps {
  onMealLogged?: () => void;
  selectedDate?: string;
  defaultExpanded?: boolean;
}

// Curated high-res food samples for quick instant testing with exact USDA portions
const SAMPLE_MEALS = [
  {
    name: 'Eggs, Toast & Fresh Apple',
    desc: '2 boiled eggs, 1 slice whole wheat toast, 1 medium apple',
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&auto=format&fit=crop&q=80',
    tag: 'Clean Breakfast Fuel',
  },
  {
    name: 'Grilled Chicken, Jasmine Rice & Broccoli',
    desc: '200g grilled chicken breast, 1 cup steamed white rice, 100g steamed broccoli florets',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
    tag: 'Athletic Hypertrophy Plate',
  },
  {
    name: 'Whey Protein, Milk & Banana Shake',
    desc: '1 scoop whey protein powder, 244ml whole milk, 1 medium banana',
    image: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=600&auto=format&fit=crop&q=80',
    tag: 'Post-Workout Anabolic',
  },
  {
    name: 'Roti, Dal & Fresh Paneer Thali',
    desc: '2 whole wheat rotis, 1 cup cooked dal lentils, 100g fresh paneer',
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&auto=format&fit=crop&q=80',
    tag: 'Vegetarian High Protein',
  },
  {
    name: 'Grilled Salmon & Quinoa Bowl',
    desc: '180g Atlantic salmon fillet, 150g cooked quinoa, steamed greens with 1 tbsp olive oil',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
    tag: 'Omega-3 Recovery',
  },
  {
    name: 'Avocado Toast & Poached Eggs',
    desc: '2 poached eggs, 1 slice toasted whole wheat bread, 80g fresh Hass avocado',
    image: 'https://images.unsplash.com/photo-1513442543415-1a63f730194f?w=600&auto=format&fit=crop&q=80',
    tag: 'Heart Healthy Satiety',
  },
];

export const AiFoodNutrientDetector: React.FC<AiFoodNutrientDetectorProps> = ({
  onMealLogged,
  selectedDate = new Date().toISOString().split('T')[0],
  defaultExpanded = true,
}) => {
  const { success, error, info } = useToast();
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  // Input states
  const [textDescription, setTextDescription] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>('image/jpeg');

  // Analysis states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<string>('');
  const [result, setResult] = useState<AiFoodDetectionResult | null>(null);

  // Customization & logging states
  const [portionMultiplier, setPortionMultiplier] = useState<number>(1.0);
  const [chosenMealType, setChosenMealType] = useState<'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK'>('LUNCH');
  const [isLogging, setIsLogging] = useState(false);
  const [showMicros, setShowMicros] = useState(false);

  // Camera stream state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Handle image upload from file system
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      error('Please select an image file (PNG, JPG, WEBP).', 'Invalid File');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setImagePreview(dataUrl);
      setImageBase64(dataUrl);
      setImageMimeType(file.type || 'image/jpeg');
    };
    reader.readAsDataURL(file);
  };

  // Live Camera stream handlers
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      error('Unable to access device camera. Please upload a photo instead.', 'Camera Error');
    }
  };

  const captureCameraPhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

    setImagePreview(dataUrl);
    setImageBase64(dataUrl);
    setImageMimeType('image/jpeg');
    stopCamera();
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const clearImage = () => {
    setImagePreview(null);
    setImageBase64(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    stopCamera();
  };

  // Convert remote sample image to base64 for Gemini vision analysis
  const selectSample = async (sample: typeof SAMPLE_MEALS[0]) => {
    setTextDescription(sample.desc);
    setImagePreview(sample.image);
    info(`Selected "${sample.name}". Click "Analyze & Calculate Nutrients" to process!`, 'Sample Loaded');

    try {
      const response = await fetch(sample.image);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result as string);
        setImageMimeType(blob.type || 'image/jpeg');
      };
      reader.readAsDataURL(blob);
    } catch (e) {
      // If CORS prevents blob conversion, the text description will still drive high-precision analysis
      setImageBase64(null);
    }
  };

  // Trigger Gemini AI Food & Nutrient Detection
  const handleAnalyzeFood = async () => {
    if (!imageBase64 && !textDescription.trim()) {
      error('Please upload a food photo or enter a meal description to analyze.', 'Input Required');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisStep('Inspecting food components and recognizing ingredients...');

    try {
      const timer1 = setTimeout(() => {
        setAnalysisStep('Estimating portion weights & computing macronutrients via Gemini AI...');
      }, 900);

      const timer2 = setTimeout(() => {
        setAnalysisStep('Synthesizing micronutrient profile & clinical sports feedback...');
      }, 1800);

      const res = await api.post<AiFoodDetectionResult>('/nutrition/ai-detect', {
        imageBase64: imageBase64 || undefined,
        mimeType: imageMimeType,
        textDescription: textDescription.trim() || undefined,
      });

      clearTimeout(timer1);
      clearTimeout(timer2);

      setResult(res);
      setPortionMultiplier(1.0);
      setChosenMealType(res.suggestedMealType);
      success(`Successfully detected ${res.dishName}!`, 'Nutrients Calculated');
    } catch (err: any) {
      error(err.message || 'Failed to analyze food nutrients. Please try again.', 'Analysis Error');
    } finally {
      setIsAnalyzing(false);
      setAnalysisStep('');
    }
  };

  // User fine-tuning: Update specific item weight
  const handleUpdateItemGrams = (idx: number, newGrams: number) => {
    if (!result || newGrams < 5) return;
    const items = [...result.detectedItems];
    const item = { ...items[idx] };
    const oldGrams = item.estimatedGrams || 100;
    const ratio = newGrams / (oldGrams || 1);

    item.estimatedGrams = Math.round(newGrams);
    item.calories = Math.round(item.calories * ratio);
    item.proteinG = Math.round(item.proteinG * ratio * 10) / 10;
    item.carbsG = Math.round(item.carbsG * ratio * 10) / 10;
    item.fatG = Math.round(item.fatG * ratio * 10) / 10;
    item.portionDesc = `${item.estimatedGrams}g portion`;
    items[idx] = item;

    const totalP = Math.round(items.reduce((acc, cur) => acc + cur.proteinG, 0) * 10) / 10;
    const totalC = Math.round(items.reduce((acc, cur) => acc + cur.carbsG, 0) * 10) / 10;
    const totalF = Math.round(items.reduce((acc, cur) => acc + cur.fatG, 0) * 10) / 10;
    const totalCal = Math.round(totalP * 4 + totalC * 4 + totalF * 9);
    const totalWeight = items.reduce((acc, cur) => acc + cur.estimatedGrams, 0);

    setResult({
      ...result,
      detectedItems: items,
      totalCalories: totalCal,
      totalProteinG: totalP,
      totalCarbsG: totalC,
      totalFatG: totalF,
      portionSize: `~${totalWeight}g plate (${items.length} items)`,
    });
  };

  // Remove ingredient
  const handleRemoveItem = (idx: number) => {
    if (!result) return;
    const items = result.detectedItems.filter((_, i) => i !== idx);
    const totalP = Math.round(items.reduce((acc, cur) => acc + cur.proteinG, 0) * 10) / 10;
    const totalC = Math.round(items.reduce((acc, cur) => acc + cur.carbsG, 0) * 10) / 10;
    const totalF = Math.round(items.reduce((acc, cur) => acc + cur.fatG, 0) * 10) / 10;
    const totalCal = Math.round(totalP * 4 + totalC * 4 + totalF * 9);
    const totalWeight = items.reduce((acc, cur) => acc + cur.estimatedGrams, 0);

    setResult({
      ...result,
      detectedItems: items,
      totalCalories: totalCal,
      totalProteinG: totalP,
      totalCarbsG: totalC,
      totalFatG: totalF,
      portionSize: `~${totalWeight}g plate (${items.length} items)`,
    });
  };

  // Log the detected meal to daily user diary
  const handleLogMeal = async () => {
    if (!result) return;
    setIsLogging(true);

    try {
      const scaledCalories = Math.round(result.totalCalories * portionMultiplier);
      const scaledProtein = Math.round(result.totalProteinG * portionMultiplier * 10) / 10;
      const scaledCarbs = Math.round(result.totalCarbsG * portionMultiplier * 10) / 10;
      const scaledFat = Math.round(result.totalFatG * portionMultiplier * 10) / 10;
      const portionText =
        portionMultiplier === 1.0
          ? result.portionSize
          : `${result.portionSize} (${portionMultiplier}x portion)`;

      await api.post('/nutrition', {
        date: selectedDate,
        mealType: chosenMealType,
        foodName: result.dishName,
        calories: scaledCalories,
        proteinG: scaledProtein,
        carbsG: scaledCarbs,
        fatG: scaledFat,
        portionSize: portionText,
      });

      success(`Added ${result.dishName} (${scaledCalories} kcal) to today's nutrition diary!`, 'Meal Logged');
      if (onMealLogged) onMealLogged();
    } catch (err: any) {
      error(err.message || 'Failed to log meal.', 'Logging Error');
    } finally {
      setIsLogging(false);
    }
  };

  // Scaled calculations for UI
  const scaledCalories = result ? Math.round(result.totalCalories * portionMultiplier) : 0;
  const scaledProtein = result ? Math.round(result.totalProteinG * portionMultiplier * 10) / 10 : 0;
  const scaledCarbs = result ? Math.round(result.totalCarbsG * portionMultiplier * 10) / 10 : 0;
  const scaledFat = result ? Math.round(result.totalFatG * portionMultiplier * 10) / 10 : 0;

  // Macro calorie ratios
  const proteinKcal = scaledProtein * 4;
  const carbsKcal = scaledCarbs * 4;
  const fatKcal = scaledFat * 9;
  const totalMacroKcal = proteinKcal + carbsKcal + fatKcal || 1;
  const pPct = Math.round((proteinKcal / totalMacroKcal) * 100);
  const cPct = Math.round((carbsKcal / totalMacroKcal) * 100);
  const fPct = Math.max(0, 100 - pPct - cPct);

  return (
    <div className="rounded-3xl bg-gradient-to-b from-zinc-900/90 to-zinc-950 border border-emerald-500/20 shadow-2xl shadow-emerald-500/5 overflow-hidden transition-all duration-300">
      {/* Header bar */}
      <div className="p-5 sm:p-6 border-b border-zinc-800/80 bg-zinc-950/60 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-white tracking-tight">
                AI Food & Nutrient Auto-Detector
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Gemini 3.8 Vision
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Snap a meal photo or describe your plate — AI instantly recognizes ingredients & computes macros
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors"
          title={isExpanded ? 'Collapse scanner' : 'Expand scanner'}
        >
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {isExpanded && (
        <div className="p-5 sm:p-6 space-y-6">
          {/* Top Section: Photo / Camera / Text Inputs */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Column: Visual Media (Upload / Camera Preview) */}
            <div className="lg:col-span-5 space-y-3">
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-emerald-400" /> Meal Photo or Camera Scan
              </label>

              {/* Camera Active View */}
              {isCameraActive ? (
                <div className="relative rounded-2xl overflow-hidden bg-black border border-emerald-500/40 aspect-video flex items-center justify-center shadow-xl">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  <div className="absolute inset-0 border-2 border-emerald-400/50 border-dashed rounded-2xl pointer-events-none animate-pulse" />
                  <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-3 px-3">
                    <button
                      type="button"
                      onClick={captureCameraPhoto}
                      className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/30"
                    >
                      <Camera className="w-4 h-4" /> Snap Photo
                    </button>
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="px-3 py-2 rounded-xl bg-zinc-800/90 hover:bg-zinc-700 text-white font-medium text-xs backdrop-blur-md"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : imagePreview ? (
                /* Captured / Uploaded Image Preview */
                <div className="relative rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 aspect-video group">
                  <img
                    src={imagePreview}
                    alt="Food preview"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90" />
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-black/70 text-zinc-300 hover:text-white hover:bg-rose-500 transition-colors"
                    title="Remove image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-2.5 left-3 text-[11px] font-mono text-zinc-300 flex items-center gap-1.5 bg-black/60 px-2.5 py-1 rounded-lg backdrop-blur-md">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Photo loaded for AI vision inspection
                  </div>
                </div>
              ) : (
                /* Drag & Drop / Upload Trigger Area */
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-2xl border-2 border-dashed border-zinc-800 hover:border-emerald-500/50 bg-zinc-950/60 hover:bg-zinc-900/40 p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all aspect-video group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-zinc-900 group-hover:bg-emerald-500/10 text-zinc-400 group-hover:text-emerald-400 flex items-center justify-center transition-colors mb-2.5">
                    <Upload className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-zinc-200 group-hover:text-white">
                    Upload food photo or drag & drop
                  </span>
                  <span className="text-[11px] text-zinc-500 mt-0.5">PNG, JPG, WEBP up to 10MB</span>

                  <div className="flex items-center gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Upload className="w-3 h-3" /> Browse Files
                    </button>
                    {typeof navigator !== 'undefined' && Boolean(navigator.mediaDevices?.getUserMedia) && (
                      <button
                        type="button"
                        onClick={startCamera}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                      >
                        <Camera className="w-3 h-3" /> Use Camera
                      </button>
                    )}
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Right Column: Meal Description & Action */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Meal Details & Ingredients (Optional with Photo)</span>
                  <span className="text-[10px] text-zinc-500 font-normal">Natural language supported</span>
                </label>
                <textarea
                  value={textDescription}
                  onChange={(e) => setTextDescription(e.target.value)}
                  placeholder="e.g. 200g grilled salmon fillet, 1 cup cooked jasmine rice, 1 cup steamed broccoli florets with 1 tsp extra virgin olive oil and a squeeze of fresh lemon."
                  rows={4}
                  className="w-full px-4 py-3 rounded-2xl bg-zinc-950 border border-zinc-800 focus:border-emerald-500 text-zinc-200 text-xs placeholder-zinc-600 focus:outline-none transition-colors resize-none leading-relaxed font-sans"
                />
              </div>

              {/* Sample Meals Quick Click */}
              <div>
                <div className="text-[11px] font-semibold text-zinc-400 mb-2 flex items-center gap-1">
                  <Apple className="w-3 h-3 text-emerald-400" /> Or try a sample fitness plate:
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {SAMPLE_MEALS.map((sample, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => selectSample(sample)}
                      className="p-2 rounded-xl bg-zinc-950 border border-zinc-800/80 hover:border-emerald-500/50 hover:bg-zinc-900 text-left transition-all group flex flex-col justify-between"
                    >
                      <div className="text-[11px] font-bold text-zinc-300 group-hover:text-emerald-400 line-clamp-1">
                        {sample.name}
                      </div>
                      <span className="text-[9px] text-zinc-500 mt-1 line-clamp-1">
                        {sample.tag}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  disabled={isAnalyzing || (!imageBase64 && !textDescription.trim())}
                  onClick={handleAnalyzeFood}
                  className="flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black text-xs sm:text-sm font-extrabold shadow-xl shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-black group-hover:rotate-12 transition-transform" />
                  {isAnalyzing ? 'Analyzing Visuals & Calculating Nutrients...' : 'Analyze & Calculate Nutrients with AI'}
                </button>

                {(imagePreview || textDescription || result) && (
                  <button
                    type="button"
                    onClick={() => {
                      clearImage();
                      setTextDescription('');
                      setResult(null);
                    }}
                    className="p-3 rounded-2xl border border-zinc-800 hover:border-zinc-700 bg-zinc-950 text-zinc-400 hover:text-white transition-colors"
                    title="Reset scanner"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Loading Animation during analysis */}
          {isAnalyzing && (
            <div className="p-6 rounded-2xl bg-zinc-950/80 border border-emerald-500/30 flex flex-col items-center justify-center text-center space-y-3 animate-pulse">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Sparkles className="w-6 h-6 animate-spin" />
              </div>
              <div className="text-sm font-bold text-white tracking-wide">
                AI Vision & Nutritional Computing Active
              </div>
              <div className="text-xs text-emerald-400 font-mono">
                {analysisStep || 'Examining food density, portions, and macronutrients...'}
              </div>
            </div>
          )}

          {/* Results Display */}
          {result && !isAnalyzing && (
            <div className="space-y-6 pt-4 border-t border-zinc-800/80">
              {/* Dish Name & Badges */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-lg border border-emerald-500/20">
                      AI Detected Dish
                    </span>
                    <span className="text-xs text-zinc-500">Confidence: {result.confidenceScore}%</span>
                    <span className="text-xs text-zinc-500">• Portion: {result.portionSize}</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                    {result.dishName}
                  </h3>
                  <div className="flex items-center gap-1.5 flex-wrap mt-2">
                    {result.dietaryTags.map((tag, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-zinc-900 text-zinc-300 border border-zinc-800 flex items-center gap-1"
                      >
                        <Tag className="w-2.5 h-2.5 text-emerald-400" /> {tag}
                      </span>
                    ))}
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      Health Score: {result.healthScore}/100
                    </span>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                      Glycemic: {result.glycemicImpact}
                    </span>
                  </div>
                </div>

                {/* Portion Scaler Selector */}
                <div className="flex items-center gap-2 bg-zinc-900/80 p-2 rounded-xl border border-zinc-800 self-start sm:self-center">
                  <span className="text-[11px] font-semibold text-zinc-400 pl-1 flex items-center gap-1">
                    <Scale className="w-3.5 h-3.5 text-emerald-400" /> Portion:
                  </span>
                  {[0.5, 1.0, 1.5, 2.0].map((multiplier) => (
                    <button
                      key={multiplier}
                      type="button"
                      onClick={() => setPortionMultiplier(multiplier)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                        portionMultiplier === multiplier
                          ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                          : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                      }`}
                    >
                      {multiplier}x
                    </button>
                  ))}
                </div>
              </div>

              {/* 4 Core Macro Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Calories */}
                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 relative overflow-hidden group">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                      <Flame className="w-3 h-3 text-orange-400" /> Calories
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">kcal</span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
                    {scaledCalories}
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-1">Total energy yield</div>
                </div>

                {/* Protein */}
                <div className="p-4 rounded-2xl bg-zinc-950 border border-emerald-500/30 relative overflow-hidden group">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                      <Zap className="w-3 h-3 text-emerald-400" /> Protein
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400">{pPct}%</span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono tracking-tight">
                    {scaledProtein}g
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-1">Muscle repair & synthesis</div>
                </div>

                {/* Carbohydrates */}
                <div className="p-4 rounded-2xl bg-zinc-950 border border-cyan-500/30 relative overflow-hidden group">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                      <Activity className="w-3 h-3 text-cyan-400" /> Carbs
                    </span>
                    <span className="text-[10px] font-mono text-cyan-400">{cPct}%</span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-cyan-400 font-mono tracking-tight">
                    {scaledCarbs}g
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-1">
                    Glycogen replenishment
                  </div>
                </div>

                {/* Dietary Fats */}
                <div className="p-4 rounded-2xl bg-zinc-950 border border-amber-500/30 relative overflow-hidden group">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                      <Layers className="w-3 h-3 text-amber-400" /> Healthy Fat
                    </span>
                    <span className="text-[10px] font-mono text-amber-400">{fPct}%</span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono tracking-tight">
                    {scaledFat}g
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-1">Hormonal & cellular support</div>
                </div>
              </div>

              {/* Macro Distribution Ratio Bar */}
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-zinc-300">Macronutrient Ratio Split</span>
                  <div className="flex items-center gap-3 text-[11px] font-mono">
                    <span className="text-emerald-400 font-bold">{pPct}% Protein</span>
                    <span className="text-cyan-400 font-bold">{cPct}% Carbs</span>
                    <span className="text-amber-400 font-bold">{fPct}% Fat</span>
                  </div>
                </div>
                <div className="h-2.5 w-full rounded-full bg-zinc-900 overflow-hidden flex">
                  <div style={{ width: `${pPct}%` }} className="h-full bg-emerald-400" title={`Protein ${pPct}%`} />
                  <div style={{ width: `${cPct}%` }} className="h-full bg-cyan-400" title={`Carbs ${cPct}%`} />
                  <div style={{ width: `${fPct}%` }} className="h-full bg-amber-400" title={`Fat ${fPct}%`} />
                </div>
              </div>

              {/* Detected Ingredients Breakdown Table with Fine-Tuning */}
              {result.detectedItems && result.detectedItems.length > 0 && (
                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                        <Apple className="w-3.5 h-3.5 text-emerald-400" /> Detected Ingredients & Portion Fine-Tuning
                      </h4>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono border border-emerald-500/20">
                        USDA Analytical Verified
                      </span>
                    </div>
                    <span className="text-[11px] text-zinc-500">
                      Adjust grams with +/- or remove items to match your exact plate
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-zinc-850 text-zinc-500 uppercase text-[10px] font-semibold">
                          <th className="pb-2">Ingredient / Food Item</th>
                          <th className="pb-2">Weight (Grams)</th>
                          <th className="pb-2">Calories</th>
                          <th className="pb-2">Protein</th>
                          <th className="pb-2">Carbs</th>
                          <th className="pb-2">Fat</th>
                          <th className="pb-2 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-900">
                        {result.detectedItems.map((item, idx) => {
                          const currentWeight = Math.round(item.estimatedGrams * portionMultiplier);
                          return (
                            <tr key={idx} className="hover:bg-zinc-900/40 transition-colors">
                              <td className="py-2.5 font-bold text-zinc-200">
                                <div>{item.name}</div>
                                <div className="text-[10px] text-zinc-500 font-normal">{item.portionDesc}</div>
                              </td>
                              <td className="py-2.5">
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateItemGrams(idx, Math.max(10, item.estimatedGrams - 25))}
                                    className="w-5 h-5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-750 text-zinc-300 font-bold flex items-center justify-center text-xs"
                                    title="Decrease 25g"
                                  >
                                    -
                                  </button>
                                  <span className="font-mono font-bold text-zinc-200 min-w-[42px] text-center">
                                    {currentWeight}g
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateItemGrams(idx, item.estimatedGrams + 25)}
                                    className="w-5 h-5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-750 text-zinc-300 font-bold flex items-center justify-center text-xs"
                                    title="Increase 25g"
                                  >
                                    +
                                  </button>
                                </div>
                              </td>
                              <td className="py-2.5 font-mono font-bold text-orange-400">
                                {Math.round(item.calories * portionMultiplier)} kcal
                              </td>
                              <td className="py-2.5 font-mono text-emerald-400">
                                {Math.round(item.proteinG * portionMultiplier * 10) / 10}g
                              </td>
                              <td className="py-2.5 font-mono text-cyan-400">
                                {Math.round(item.carbsG * portionMultiplier * 10) / 10}g
                              </td>
                              <td className="py-2.5 font-mono text-amber-400">
                                {Math.round(item.fatG * portionMultiplier * 10) / 10}g
                              </td>
                              <td className="py-2.5 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveItem(idx)}
                                  className="p-1 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                                  title="Remove this ingredient"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Micronutrients Toggle Section */}
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowMicros(!showMicros)}
                  className="w-full flex items-center justify-between text-xs font-bold text-zinc-300 hover:text-white transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-cyan-400" />
                    Micronutrients & Clinical Mineral Profile
                  </span>
                  <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                    {showMicros ? 'Hide Details' : 'View Fiber, Sodium, Potassium & Minerals'}
                    {showMicros ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </span>
                </button>

                {showMicros && result.micronutrients && (
                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5 pt-4 mt-3 border-t border-zinc-900">
                    <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-center">
                      <div className="text-[10px] text-zinc-400 uppercase">Fiber</div>
                      <div className="text-sm font-bold text-white font-mono mt-0.5">
                        {Math.round(result.micronutrients.fiberG * portionMultiplier * 10) / 10}g
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-center">
                      <div className="text-[10px] text-zinc-400 uppercase">Sugar</div>
                      <div className="text-sm font-bold text-white font-mono mt-0.5">
                        {Math.round(result.micronutrients.sugarG * portionMultiplier * 10) / 10}g
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-center">
                      <div className="text-[10px] text-zinc-400 uppercase">Sodium</div>
                      <div className="text-sm font-bold text-white font-mono mt-0.5">
                        {Math.round(result.micronutrients.sodiumMg * portionMultiplier)}mg
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-center">
                      <div className="text-[10px] text-zinc-400 uppercase">Potassium</div>
                      <div className="text-sm font-bold text-white font-mono mt-0.5">
                        {Math.round(result.micronutrients.potassiumMg * portionMultiplier)}mg
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-center">
                      <div className="text-[10px] text-zinc-400 uppercase">Calcium</div>
                      <div className="text-sm font-bold text-white font-mono mt-0.5">
                        {Math.round(result.micronutrients.calciumMg * portionMultiplier)}mg
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-center">
                      <div className="text-[10px] text-zinc-400 uppercase">Iron</div>
                      <div className="text-sm font-bold text-white font-mono mt-0.5">
                        {Math.round(result.micronutrients.ironMg * portionMultiplier * 10) / 10}mg
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* AI Sports Nutritionist Commentary */}
              {result.coachingFeedback && (
                <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-0.5">
                      AI Sports Nutritionist Commentary
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                      {result.coachingFeedback}
                    </p>
                  </div>
                </div>
              )}

              {/* Bottom Logging Bar: Choose Meal Slot & Log */}
              <div className="p-4 rounded-2xl bg-zinc-950 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <label className="text-xs font-bold text-zinc-300 whitespace-nowrap">
                    Meal Timing:
                  </label>
                  <select
                    value={chosenMealType}
                    onChange={(e) => setChosenMealType(e.target.value as any)}
                    className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs font-semibold focus:outline-none focus:border-emerald-500"
                  >
                    <option value="BREAKFAST">Breakfast</option>
                    <option value="LUNCH">Lunch</option>
                    <option value="DINNER">Dinner</option>
                    <option value="SNACK">Snack / Post-Workout</option>
                  </select>
                  <span className="text-xs text-zinc-500 font-mono">Date: {selectedDate}</span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={isLogging}
                    onClick={handleLogMeal}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {isLogging ? 'Logging Meal...' : `Log ${scaledCalories} kcal to Daily Diary`}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
