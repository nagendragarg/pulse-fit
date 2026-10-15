import React, { useState } from 'react';
import {
  Dumbbell,
  Shield,
  Zap,
  TrendingUp,
  Apple,
  Scale,
  Award,
  ChevronRight,
  CheckCircle,
  MessageSquare,
  Users,
  Flame,
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
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col selection:bg-emerald-500 selection:text-black">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-400 flex items-center justify-center text-black font-extrabold shadow-lg shadow-emerald-500/20">
              <Dumbbell className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-white flex items-center gap-2">
                PulseFit <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">COACHING</span>
              </span>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-zinc-300">
            <a href="#portals" className="hover:text-emerald-400 transition-colors">Portals</a>
            <a href="#features" className="hover:text-emerald-400 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-emerald-400 transition-colors">How It Works</a>
            <a href="#coaches" className="hover:text-emerald-400 transition-colors">Coaches</a>
            <a href="#nutrition-bmi" className="hover:text-emerald-400 transition-colors">BMI & Nutrition</a>
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => onOpenLogin('USER')}
              className="hidden sm:inline-flex px-3 py-1.5 text-xs font-bold text-emerald-400 hover:text-white rounded-lg hover:bg-emerald-500/10 border border-emerald-500/20 transition-colors"
            >
              Athlete Sign In
            </button>
            <button
              onClick={() => onOpenLogin('COACH')}
              className="hidden sm:inline-flex px-3 py-1.5 text-xs font-bold text-cyan-400 hover:text-white rounded-lg hover:bg-cyan-500/10 border border-cyan-500/20 transition-colors"
            >
              Coach Portal
            </button>
            <button
              onClick={() => onOpenLogin('ADMIN')}
              className="hidden md:inline-flex px-2.5 py-1.5 text-xs font-bold text-purple-400 hover:text-white rounded-lg hover:bg-purple-500/10 border border-purple-500/20 transition-colors"
            >
              Admin
            </button>
            <button
              onClick={() => onOpenLogin('USER')}
              className="sm:hidden px-3 py-2 text-xs font-bold text-emerald-400 hover:text-white rounded-lg hover:bg-emerald-500/10 border border-emerald-500/20 transition-colors min-h-[40px]"
            >
              Sign In
            </button>
            <button
              onClick={onOpenRegister}
              className="px-3.5 py-2 sm:px-4 sm:py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-extrabold transition-all shadow-lg shadow-emerald-500/25 flex items-center gap-1 min-h-[40px]"
            >
              Join <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-24 md:pt-28 md:pb-36 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.15),rgba(255,255,255,0))]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-8 animate-fade-in">
            <Zap className="w-3.5 h-3.5" />
            <span>Next-Generation Online Fitness & Athletic Coaching Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] max-w-4xl mx-auto mb-6">
            Elite 1-on-1 Coaching.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              Measurable Physical Mastery.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Personalized periodized training splits, live workout session execution, precision BMI tracking, and comprehensive macronutrient analytics—all guided by certified coaches.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <button
              onClick={onOpenRegister}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-base transition-all shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2"
            >
              Start Your Transformation <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowBmiModal(true)}
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-zinc-900 border border-zinc-700 hover:border-emerald-500/60 text-white font-semibold text-base transition-all flex items-center justify-center gap-2"
            >
              <Scale className="w-5 h-5 text-emerald-400" />
              Check BMI & Health Metrics
            </button>
          </div>

          {/* Quick Demo Preview Buttons for Evaluators */}
          <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 max-w-2xl mx-auto backdrop-blur-sm">
            <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2.5">
              Instant 1-Click Interactive Demo Testing:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                onClick={() => onQuickDemo('USER')}
                className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-emerald-500/20 border border-zinc-800 hover:border-emerald-500/40 text-xs font-semibold text-zinc-200 transition-all flex items-center justify-center gap-1.5"
              >
                <Dumbbell className="w-3.5 h-3.5 text-emerald-400" />
                Athlete Demo (Marcus)
              </button>
              <button
                onClick={() => onQuickDemo('COACH')}
                className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-cyan-500/20 border border-zinc-800 hover:border-cyan-500/40 text-xs font-semibold text-zinc-200 transition-all flex items-center justify-center gap-1.5"
              >
                <Award className="w-3.5 h-3.5 text-cyan-400" />
                Coach Demo (Alex Morgan)
              </button>
              <button
                onClick={() => onQuickDemo('ADMIN')}
                className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-purple-500/20 border border-zinc-800 hover:border-purple-500/40 text-xs font-semibold text-zinc-200 transition-all flex items-center justify-center gap-1.5"
              >
                <Shield className="w-3.5 h-3.5 text-purple-400" />
                Admin Console Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Dedicated Role Portals Section */}
      <section id="portals" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-zinc-900">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-300 mb-3">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Role-Separated Authentication & Workspaces</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Dedicated Portals for Athletes, Coaches & Admins
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-2">
            Each role logs in through its dedicated workspace with tailored permissions, views, and workflows.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Athlete Portal Card */}
          <div className="p-6 sm:p-7 rounded-3xl bg-zinc-950 border border-emerald-500/30 hover:border-emerald-500/60 transition-all flex flex-col justify-between shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold mb-5 shadow-lg shadow-emerald-500/10">
                <Dumbbell className="w-6 h-6" />
              </div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                For Trainees & Athletes
              </span>
              <h3 className="text-xl font-bold text-white mt-3 mb-2">Athlete Portal</h3>
              <p className="text-xs text-zinc-400 leading-relaxed mb-5">
                Execute assigned training routines, auto-calculate food nutrients with AI, log body composition, track BMI, and chat 1-on-1 with your coach.
              </p>
              <ul className="space-y-2 text-xs text-zinc-300 mb-6">
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
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
            >
              <span>Sign In to Athlete Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Coach Portal Card */}
          <div className="p-6 sm:p-7 rounded-3xl bg-zinc-950 border border-cyan-500/30 hover:border-cyan-500/60 transition-all flex flex-col justify-between shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
            <div>
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold mb-5 shadow-lg shadow-cyan-500/10">
                <Award className="w-6 h-6" />
              </div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-400 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">
                For Certified Coaches
              </span>
              <h3 className="text-xl font-bold text-white mt-3 mb-2">Coach Command</h3>
              <p className="text-xs text-zinc-400 leading-relaxed mb-5">
                Build progressive multi-week training plans, review athlete lifting logs, assign routine splits, provide feedback, and program exercise cues.
              </p>
              <ul className="space-y-2 text-xs text-zinc-300 mb-6">
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
              className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
            >
              <span>Sign In to Coach Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Admin Portal Card */}
          <div className="p-6 sm:p-7 rounded-3xl bg-zinc-950 border border-purple-500/30 hover:border-purple-500/60 transition-all flex flex-col justify-between shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 font-bold mb-5 shadow-lg shadow-purple-500/10">
                <Shield className="w-6 h-6" />
              </div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-purple-400 px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20">
                Superuser Console
              </span>
              <h3 className="text-xl font-bold text-white mt-3 mb-2">Admin Portal</h3>
              <p className="text-xs text-zinc-400 leading-relaxed mb-5">
                Oversee platform users, manage coach status and athlete assignments, moderate client feedback, and configure global platform settings.
              </p>
              <ul className="space-y-2 text-xs text-zinc-300 mb-6">
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
              className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs transition-all shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2"
            >
              <span>Sign In to Admin Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* KPI Stats Bar */}
      <section className="border-y border-zinc-900 bg-zinc-950/80 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono">98.4%</div>
            <div className="text-xs sm:text-sm text-zinc-400 mt-1">Client Goal Success Rate</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400 font-mono">15,000+</div>
            <div className="text-xs sm:text-sm text-zinc-400 mt-1">Workouts Completed</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-cyan-400 font-mono">1-on-1</div>
            <div className="text-xs sm:text-sm text-zinc-400 mt-1">Direct Coach Messaging</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono">100%</div>
            <div className="text-xs sm:text-sm text-zinc-400 mt-1">Evidence-Based Programming</div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2">
            The Complete Coaching Ecosystem
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Built for Serious Progression
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 mt-4">
            Everything you need to surpass plateaus, build strength, optimize body composition, and sustain lifelong athletic wellness.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl bg-zinc-950 border border-zinc-800/80 hover:border-emerald-500/40 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
              <Dumbbell className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Custom Workout Architecture</h3>
            <p className="text-sm text-zinc-400 leading-relaxed mb-4">
              Coaches assemble tailored multi-day routines with progressive target weights, set counts, rest intervals, and form notes.
            </p>
            <ul className="text-xs text-zinc-300 space-y-2">
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400" /> Interactive live session runner</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400" /> Real-time weight and rep logging</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400" /> Historical workout logs with filters</li>
            </ul>
          </div>

          <div className="p-8 rounded-3xl bg-zinc-950 border border-zinc-800/80 hover:border-cyan-500/40 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-6 group-hover:scale-110 transition-transform">
              <Apple className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Nutritional & Macro Analytics</h3>
            <p className="text-sm text-zinc-400 leading-relaxed mb-4">
              Log daily meals across Breakfast, Lunch, Dinner, and Snacks. View real-time caloric balance, protein targets, and macro distributions.
            </p>
            <ul className="text-xs text-zinc-300 space-y-2">
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-cyan-400" /> Target calorie tracking based on goal</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-cyan-400" /> Gram & percentage macro breakdown</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-cyan-400" /> 7-day intake trend visualization</li>
            </ul>
          </div>

          <div className="p-8 rounded-3xl bg-zinc-950 border border-zinc-800/80 hover:border-purple-500/40 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-6 group-hover:scale-110 transition-transform">
              <Scale className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Precision BMI & Body Metrics</h3>
            <p className="text-sm text-zinc-400 leading-relaxed mb-4">
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
      <section id="how-it-works" className="py-20 bg-zinc-950/60 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">How PulseFit Works</h2>
            <p className="text-zinc-400 mt-3 text-sm">Three streamlined steps to continuous improvement</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-black text-xl flex items-center justify-center mx-auto mb-5">
                01
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Connect & Assess</h4>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Choose your coach, set your target weight, biometrics, and athletic goal (Hypertrophy, Endurance, Weight Loss, or Mobility).
              </p>
            </div>

            <div className="p-6">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-black text-xl flex items-center justify-center mx-auto mb-5">
                02
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Train & Record</h4>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Follow your structured plan routines. Record actual reps, weights, perceived effort, and nutrition in real-time.
              </p>
            </div>

            <div className="p-6">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 font-black text-xl flex items-center justify-center mx-auto mb-5">
                03
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Review & Adapt</h4>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Your coach evaluates your logs, provides feedback via direct chat, and adjusts volume and intensity for non-stop growth.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Coaches */}
      <section id="coaches" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-2">Certified Faculty</div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Meet Your Dedicated Coaches</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="p-6 sm:p-8 rounded-3xl bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <img
              src="https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=300&auto=format&fit=crop&q=80"
              alt="Alex Morgan"
              className="w-24 h-24 rounded-2xl object-cover border-2 border-emerald-500/30 shrink-0"
            />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-bold text-white">Alex Morgan</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">CSCS</span>
              </div>
              <div className="text-xs text-zinc-400 font-medium mb-3">Head of Strength & Hypertrophy</div>
              <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                Specializes in progressive overload splits, barbell biomechanics, and lean mass accretion with 8+ years coaching collegiate athletes.
              </p>
              <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" /> 18 Active Athletes Currently Coached
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 rounded-3xl bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <img
              src="https://images.unsplash.com/photo-1594381898411-846e7d193883?w=300&auto=format&fit=crop&q=80"
              alt="Elena Vance"
              className="w-24 h-24 rounded-2xl object-cover border-2 border-cyan-500/30 shrink-0"
            />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-bold text-white">Elena Vance</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">CPT, CES</span>
              </div>
              <div className="text-xs text-zinc-400 font-medium mb-3">Mobility & Metabolic Conditioning Specialist</div>
              <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                Expert in joint health, marathon conditioning, and metabolic flexibility. Helping clients maintain endurance without burnout.
              </p>
              <div className="text-[11px] text-cyan-400 font-semibold flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" /> 14 Active Athletes Currently Coached
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-zinc-950/70 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-3xl font-extrabold text-white">Athlete Testimonials</h2>
            <p className="text-zinc-400 text-sm mt-2">Real transformations from members following their assigned plans</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-black border border-zinc-800/80">
              <div className="flex items-center gap-1 text-amber-400 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed mb-4">
                "Coach Alex adjusted my bench press volume and within 4 weeks I went from stuck at 75kg to repping 82.5kg. The workout tracker is so smooth."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-white">MC</div>
                <div>
                  <div className="text-xs font-bold text-white">Marcus Chen</div>
                  <div className="text-[10px] text-zinc-500">Muscle Gain Program</div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-black border border-zinc-800/80">
              <div className="flex items-center gap-1 text-amber-400 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed mb-4">
                "Having the BMI tracker and macro breakdown right next to my workouts keeps me accountable. Elena is always quick to answer my recovery questions."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-white">SJ</div>
                <div>
                  <div className="text-xs font-bold text-white">Sarah Jenkins</div>
                  <div className="text-[10px] text-zinc-500">Endurance & Mobility Program</div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-black border border-zinc-800/80">
              <div className="flex items-center gap-1 text-amber-400 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed mb-4">
                "Lost 9kg over 3 months while increasing my squat. The structured sets, reps, and direct coach interaction make all the difference."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-white">DR</div>
                <div>
                  <div className="text-xs font-bold text-white">David Rodriguez</div>
                  <div className="text-[10px] text-zinc-500">Fat Loss & Conditioning</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 max-w-4xl mx-auto px-4 sm:px-6">
        <h2 className="text-3xl font-extrabold text-white text-center mb-10">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800">
            <h4 className="text-sm font-bold text-white mb-2">How does coach assignment work?</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Upon registering, you are matched with a dedicated coach who creates your periodized plan, monitors your workout logs, answers questions via direct messaging, and fine-tunes your nutritional targets.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800">
            <h4 className="text-sm font-bold text-white mb-2">Can I calculate and track my BMI and nutritional macros?</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Yes! PulseFit features an integrated WHO-standard BMI calculator and tracker alongside a complete nutritional logging dashboard where you track calories, protein, carbohydrates, and fats for every meal.
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

      {/* CTA Footer */}
      <footer className="mt-auto border-t border-zinc-900 bg-black pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-black font-extrabold mx-auto mb-4 shadow-lg shadow-emerald-500/20">
            <Dumbbell className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-extrabold text-white mb-3">Ready to elevate your training?</h3>
          <p className="text-zinc-400 text-sm max-w-md mx-auto mb-8">
            Join PulseFit today and experience elite personalized online coaching.
          </p>
          <button
            onClick={onOpenRegister}
            className="px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-sm transition-all shadow-xl shadow-emerald-500/25"
          >
            Create Your Account Now
          </button>
          <div className="text-xs text-zinc-600 mt-12">
            © {new Date().getFullYear()} PulseFit Coaching SaaS. All rights reserved. Built for high performance.
          </div>
        </div>
      </footer>

      {/* BMI modal on landing page */}
      <BmiCalculatorModal isOpen={showBmiModal} onClose={() => setShowBmiModal(false)} />
    </div>
  );
};
