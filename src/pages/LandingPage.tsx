import React, { useState } from 'react';
import {
  Dumbbell,
  Shield,
  TrendingUp,
  Apple,
  Scale,
  Award,
  ChevronRight,
  CheckCircle,
  MessageSquare,
  Users,
  Star,
  Activity,
  ArrowRight,
} from 'lucide-react';
import { BmiCalculatorModal } from '../components/BmiCalculatorModal.tsx';

interface LandingPageProps {
  onOpenLogin: (portal?: 'USER' | 'COACH' | 'ADMIN') => void;
  onOpenRegister: () => void;
  onQuickDemo: (role: 'ADMIN' | 'COACH' | 'USER') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenLogin,
  onOpenRegister,
  onQuickDemo,
}) => {
  const [showBmiModal, setShowBmiModal] = useState(false);

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col selection:bg-emerald-400 selection:text-black">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-black/85 backdrop-blur-xl border-b border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-400 flex items-center justify-center text-black font-extrabold shadow-md shadow-emerald-400/20">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-extrabold text-lg tracking-tight text-white">
                PulseFit
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 hidden sm:inline">
                Athletic Coaching
              </span>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-8 text-xs font-semibold uppercase tracking-wider text-zinc-400">
            <a href="#portals" className="hover:text-white transition-colors">Portals</a>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#coaches" className="hover:text-white transition-colors">Coaches</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenLogin('USER')}
              className="hidden sm:inline-flex px-3.5 py-2 text-xs font-semibold text-zinc-300 hover:text-white rounded-lg hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => onOpenLogin('COACH')}
              className="hidden md:inline-flex px-3 py-2 text-xs font-semibold text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-900 transition-colors"
            >
              Coach Portal
            </button>
            <button
              onClick={() => onOpenLogin('USER')}
              className="sm:hidden px-3 py-2 text-xs font-semibold text-zinc-300 hover:text-white rounded-lg hover:bg-zinc-900 min-h-[40px]"
            >
              Sign In
            </button>
            <button
              onClick={onOpenRegister}
              className="px-4 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black text-xs font-bold transition-all shadow-md shadow-emerald-400/20 flex items-center gap-1.5 min-h-[40px]"
            >
              Get Started <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-28 md:pb-32 overflow-hidden border-b border-zinc-900">
        {/* Subtle geometric athletic grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:24px_24px] opacity-35" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/60 to-black pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="text-xs font-mono font-semibold uppercase tracking-widest text-emerald-400 mb-4">
            Engineered Strength & Physical Performance
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.08] max-w-4xl mx-auto mb-6">
            Elite 1-on-1 Coaching.<br />
            <span className="text-zinc-400 font-normal">Measurable Physical Mastery.</span>
          </h1>

          <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            Periodized training splits, interactive workout execution, nutritional macro intelligence, and direct guidance from certified coaches.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-14">
            <button
              onClick={onOpenRegister}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black font-bold text-sm transition-all shadow-lg shadow-emerald-400/20 flex items-center justify-center gap-2"
            >
              Start Your Transformation <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowBmiModal(true)}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-750 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2"
            >
              <Scale className="w-4 h-4 text-emerald-400" />
              Check BMI & Health Metrics
            </button>
          </div>

          {/* Quick Demo Preview Row */}
          <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 max-w-2xl mx-auto shadow-xl backdrop-blur-md">
            <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-2.5 font-semibold text-center">
              Quick Interactive Demo Workspaces:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                onClick={() => onQuickDemo('USER')}
                className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-xs font-semibold text-zinc-200 transition-all flex items-center justify-center gap-1.5"
              >
                <Dumbbell className="w-3.5 h-3.5 text-emerald-400" />
                Athlete Demo (Marcus)
              </button>
              <button
                onClick={() => onQuickDemo('COACH')}
                className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-xs font-semibold text-zinc-200 transition-all flex items-center justify-center gap-1.5"
              >
                <Award className="w-3.5 h-3.5 text-cyan-400" />
                Coach Demo (Alex)
              </button>
              <button
                onClick={() => onQuickDemo('ADMIN')}
                className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-xs font-semibold text-zinc-200 transition-all flex items-center justify-center gap-1.5"
              >
                <Shield className="w-3.5 h-3.5 text-purple-400" />
                Admin Console
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* KPI Stats Bar */}
      <section className="border-b border-zinc-900 bg-zinc-950/80 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-y sm:divide-y-0 sm:divide-x divide-zinc-900">
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono tabular-nums">98.4%</div>
            <div className="text-xs text-zinc-400 uppercase tracking-wider mt-1.5 font-medium">Goal Success Rate</div>
          </div>
          <div className="pt-6 sm:pt-0">
            <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400 font-mono tabular-nums">15,000+</div>
            <div className="text-xs text-zinc-400 uppercase tracking-wider mt-1.5 font-medium">Workouts Completed</div>
          </div>
          <div className="pt-6 sm:pt-0">
            <div className="text-3xl sm:text-4xl font-extrabold text-cyan-400 font-mono tabular-nums">1-on-1</div>
            <div className="text-xs text-zinc-400 uppercase tracking-wider mt-1.5 font-medium">Certified Mentorship</div>
          </div>
          <div className="pt-6 sm:pt-0">
            <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono tabular-nums">100%</div>
            <div className="text-xs text-zinc-400 uppercase tracking-wider mt-1.5 font-medium">Evidence-Based Splits</div>
          </div>
        </div>
      </section>

      {/* Dedicated Role Portals Section */}
      <section id="portals" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-zinc-900">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="text-xs font-mono font-semibold uppercase tracking-widest text-emerald-400 mb-2">
            Role-Based Workspaces
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Tailored Portals for Athletes, Coaches & Administrators
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-2">
            Each role interacts through an environment custom-engineered for its workflow and security level.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Athlete Portal Card */}
          <div className="p-7 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col justify-between shadow-xl">
            <div>
              <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-400 mb-2">
                Athlete Workspace
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Athlete Portal</h3>
              <p className="text-xs text-zinc-400 leading-relaxed mb-6">
                Execute assigned training routines, auto-calculate food nutrients with AI, log body composition, track BMI, and chat 1-on-1 with your coach.
              </p>
              <ul className="space-y-2.5 text-xs text-zinc-300 mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Interactive Workout Session Execution</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>AI Food & Macronutrient Scanner</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Personalized 1-on-1 Coach Chat</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => onOpenLogin('USER')}
              className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs border border-zinc-700/80 transition-all flex items-center justify-center gap-2"
            >
              <span>Sign In to Athlete Portal</span>
              <ArrowRight className="w-4 h-4 text-emerald-400" />
            </button>
          </div>

          {/* Coach Portal Card */}
          <div className="p-7 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col justify-between shadow-xl">
            <div>
              <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-cyan-400 mb-2">
                Certified Faculty
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Coach Headquarters</h3>
              <p className="text-xs text-zinc-400 leading-relaxed mb-6">
                Build progressive multi-week training plans, review athlete lifting logs, assign routine splits, provide feedback, and program exercise cues.
              </p>
              <ul className="space-y-2.5 text-xs text-zinc-300 mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Custom Workout Plan Builder</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Athlete Roster & Compliance Tracking</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Direct Athlete Messaging & Notes</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => onOpenLogin('COACH')}
              className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs border border-zinc-700/80 transition-all flex items-center justify-center gap-2"
            >
              <span>Sign In to Coach Portal</span>
              <ArrowRight className="w-4 h-4 text-cyan-400" />
            </button>
          </div>

          {/* Admin Portal Card */}
          <div className="p-7 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col justify-between shadow-xl">
            <div>
              <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-purple-400 mb-2">
                System Governance
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Admin Console</h3>
              <p className="text-xs text-zinc-400 leading-relaxed mb-6">
                Oversee platform users, manage coach status and athlete assignments, moderate client feedback, and configure global platform settings.
              </p>
              <ul className="space-y-2.5 text-xs text-zinc-300 mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>User & Coach Role Governance</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Platform Moderation & Feedback Logs</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Security & System Analytics</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => onOpenLogin('ADMIN')}
              className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs border border-zinc-700/80 transition-all flex items-center justify-center gap-2"
            >
              <span>Sign In to Admin Portal</span>
              <ArrowRight className="w-4 h-4 text-purple-400" />
            </button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-zinc-900">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400 mb-2">
            The Complete Coaching Platform
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Built for Serious Progression
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 mt-3 font-normal">
            Everything you need to break plateaus, build strength, optimize body composition, and sustain lifelong athletic wellness.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400 mb-6">
              <Dumbbell className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Custom Workout Architecture</h3>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-5">
              Coaches assemble tailored multi-day routines with progressive target weights, set counts, rest intervals, and form notes.
            </p>
            <ul className="text-xs text-zinc-300 space-y-2">
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400" /> Interactive live session runner</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400" /> Real-time weight and rep logging</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400" /> Historical workout logs with filters</li>
            </ul>
          </div>

          <div className="p-8 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-cyan-400 mb-6">
              <Apple className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Nutritional & Macro Analytics</h3>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-5">
              Log daily meals across Breakfast, Lunch, Dinner, and Snacks. View real-time caloric balance, protein targets, and macro distributions.
            </p>
            <ul className="text-xs text-zinc-300 space-y-2">
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-cyan-400" /> Target calorie tracking based on goal</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-cyan-400" /> Gram & percentage macro breakdown</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-cyan-400" /> 7-day intake trend visualization</li>
            </ul>
          </div>

          <div className="p-8 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-purple-400 mb-6">
              <Scale className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Precision BMI & Body Metrics</h3>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-5">
              Monitor Body Mass Index with WHO classifications, healthy weight ranges, body fat percentage, and circumferential measurements.
            </p>
            <ul className="text-xs text-zinc-300 space-y-2">
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-purple-400" /> Interactive BMI calculator & visual gauge</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-purple-400" /> Historical trend graphs for weight</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-purple-400" /> Chest, waist, arms, hips tracking</li>
            </ul>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-20 bg-zinc-950/60 border-b border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">How PulseFit Works</h2>
            <p className="text-zinc-400 mt-2 text-sm">Three disciplined steps to continuous improvement</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="w-12 h-12 rounded-xl bg-zinc-900 text-emerald-400 border border-zinc-800 font-mono font-bold text-lg flex items-center justify-center mx-auto mb-4">
                01
              </div>
              <h4 className="text-base font-bold text-white mb-2">Connect & Assess</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Connect with your coach, set your target weight, biometrics, and athletic goal (Hypertrophy, Endurance, Weight Loss, or Mobility).
              </p>
            </div>

            <div className="p-6">
              <div className="w-12 h-12 rounded-xl bg-zinc-900 text-cyan-400 border border-zinc-800 font-mono font-bold text-lg flex items-center justify-center mx-auto mb-4">
                02
              </div>
              <h4 className="text-base font-bold text-white mb-2">Train & Record</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Follow your structured plan routines. Record actual reps, weights, perceived effort, and nutrition in real-time.
              </p>
            </div>

            <div className="p-6">
              <div className="w-12 h-12 rounded-xl bg-zinc-900 text-purple-400 border border-zinc-800 font-mono font-bold text-lg flex items-center justify-center mx-auto mb-4">
                03
              </div>
              <h4 className="text-base font-bold text-white mb-2">Review & Adapt</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Your coach evaluates your logs, provides feedback via direct chat, and adjusts volume and intensity for non-stop growth.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Coaches */}
      <section id="coaches" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-zinc-900">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest mb-2">Certified Faculty</div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Meet Your Dedicated Coaches</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="p-6 sm:p-7 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <img
              src="https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=300&auto=format&fit=crop&q=80"
              alt="Alex Morgan"
              className="w-20 h-20 rounded-xl object-cover border border-zinc-700 shrink-0"
            />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-base font-bold text-white">Alex Morgan</h3>
                <span className="text-[10px] font-mono text-zinc-400">CSCS Certified</span>
              </div>
              <div className="text-xs text-zinc-400 font-medium mb-3">Head of Strength & Hypertrophy</div>
              <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                Specializes in progressive overload splits, barbell biomechanics, and lean mass accretion with 8+ years coaching collegiate athletes.
              </p>
              <div className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" /> 18 Active Athletes Currently Coached
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-7 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <img
              src="https://images.unsplash.com/photo-1594381898411-846e7d193883?w=300&auto=format&fit=crop&q=80"
              alt="Elena Vance"
              className="w-20 h-20 rounded-xl object-cover border border-zinc-700 shrink-0"
            />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-base font-bold text-white">Elena Vance</h3>
                <span className="text-[10px] font-mono text-zinc-400">CPT, CES</span>
              </div>
              <div className="text-xs text-zinc-400 font-medium mb-3">Mobility & Conditioning Specialist</div>
              <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                Expert in joint health, marathon conditioning, and metabolic flexibility. Helping clients maintain endurance without burnout.
              </p>
              <div className="text-xs text-cyan-400 font-medium flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" /> 14 Active Athletes Currently Coached
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-zinc-950/40 border-b border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-3xl font-extrabold text-white">Athlete Testimonials</h2>
            <p className="text-zinc-400 text-xs sm:text-sm mt-2">Real transformations from members following their assigned plans</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800">
              <div className="flex items-center gap-1 text-amber-400 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed mb-5">
                "Coach Alex adjusted my bench press volume and within 4 weeks I went from stuck at 75kg to repping 82.5kg. The workout tracker is so smooth."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-850 flex items-center justify-center text-xs font-bold text-white">MC</div>
                <div>
                  <div className="text-xs font-bold text-white">Marcus Chen</div>
                  <div className="text-[10px] text-zinc-500">Hypertrophy Program</div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800">
              <div className="flex items-center gap-1 text-amber-400 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed mb-5">
                "Having the BMI tracker and macro breakdown right next to my workouts keeps me accountable. Elena is always quick to answer my recovery questions."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-850 flex items-center justify-center text-xs font-bold text-white">SJ</div>
                <div>
                  <div className="text-xs font-bold text-white">Sarah Jenkins</div>
                  <div className="text-[10px] text-zinc-500">Endurance & Mobility</div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800">
              <div className="flex items-center gap-1 text-amber-400 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed mb-5">
                "Lost 9kg over 3 months while increasing my squat. The structured sets, reps, and direct coach interaction make all the difference."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-850 flex items-center justify-center text-xs font-bold text-white">DR</div>
                <div>
                  <div className="text-xs font-bold text-white">David Rodriguez</div>
                  <div className="text-[10px] text-zinc-500">Conditioning Split</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 max-w-4xl mx-auto px-4 sm:px-6">
        <h2 className="text-3xl font-extrabold text-white text-center mb-10">Frequently Asked Questions</h2>
        <div className="space-y-3.5">
          <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800">
            <h4 className="text-sm font-bold text-white mb-2">How does coach assignment work?</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Upon registering, you are matched with a dedicated coach who creates your periodized plan, monitors your workout logs, answers questions via direct messaging, and fine-tunes your nutritional targets.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800">
            <h4 className="text-sm font-bold text-white mb-2">Can I calculate and track my BMI and nutritional macros?</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Yes. PulseFit features an integrated WHO-standard BMI calculator alongside a complete nutritional logging dashboard where you track calories, protein, carbohydrates, and fats for every meal.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800">
            <h4 className="text-sm font-bold text-white mb-2">Can coaches build and modify custom workout plans?</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Coaches have full access to our Workout Plan Builder to configure multiple workout days, exercise movements, target sets, rep ranges, weight goals, rest periods, and coaching notes.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-zinc-900 bg-black pt-14 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-10 h-10 rounded-xl bg-emerald-400 flex items-center justify-center text-black font-extrabold mx-auto mb-4 shadow-md shadow-emerald-400/20">
            <Dumbbell className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-extrabold text-white mb-2">Ready to elevate your training?</h3>
          <p className="text-zinc-400 text-xs sm:text-sm max-w-md mx-auto mb-7">
            Join PulseFit today and experience elite personalized online coaching.
          </p>
          <button
            onClick={onOpenRegister}
            className="px-7 py-3 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black font-bold text-xs transition-all shadow-md shadow-emerald-400/20"
          >
            Create Your Account Now
          </button>
          <div className="text-xs text-zinc-600 mt-10">
            © {new Date().getFullYear()} PulseFit Athletic Coaching. Built for high performance.
          </div>
        </div>
      </footer>

      {/* BMI modal on landing page */}
      <BmiCalculatorModal isOpen={showBmiModal} onClose={() => setShowBmiModal(false)} />
    </div>
  );
};
