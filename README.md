# PulseFit — Online Fitness Coaching Platform

PulseFit is a full-stack, commercial-grade SaaS platform engineered for personal trainers, athletes, and fitness organizations. It delivers periodized workout programming, interactive session logging, precision WHO-standard BMI calculation and tracking, daily macronutrient analytics, real-time messaging, and administrator governance.

---

##  Core Features & Modules

### 1.  Role-Based Access Control (RBAC)
- **ADMIN**: Platform overview, user account management (activate/deactivate, role promotion, account deletion), content moderation queue, feedback reviews, and global system configuration.
- **COACH**: Dedicated dashboard, athlete roster oversight, custom Workout Plan Builder (multi-day routines, exercises, target sets, reps, weights, rest intervals), direct messaging, and plan effectiveness analytics.
- **USER (Athlete)**: Live workout session runner with set-by-set logging and rest interval countdown, workout history, body weight & circumference progress tracker, WHO BMI calculator & health gauge, and macronutrient logging (breakfast, lunch, dinner, snacks).

### 2.  Interactive Workout Experience
- Live session runner with real-time checkbox set completion
- Rest interval timer with visual and audio countdown cues
- Perceived effort (RPE 1-10) scoring and post-session athlete notes
- Confetti celebration upon session completion
- Automatic synchronization with athlete's workout history and coach dashboard

### 3.  Precision BMI Calculator & Biometric Tracker
- Live BMI computation according to WHO standard classifications (Underweight, Normal, Overweight, Obese)
- Visual colored meter gauge and healthy target weight benchmark
- Save reading directly to health profile and historical timeline
- Track weight and circumference metrics (chest, waist, arms, hips) over weeks

### 4.  Nutritional & Macronutrient Analytics
- Dynamic daily calorie targets based on athlete goal (Hypertrophy, Fat Loss, Endurance)
- Real-time macro breakdown (Protein, Carbohydrates, Dietary Fats) in grams and percentages
- Meal logger by category (Breakfast, Lunch, Dinner, Snacks) with portion sizes
- 7-day intake trend visualization via Recharts

### 5.  Real-Time Messaging & Direct Coach Interaction
- Persistent database chat conversations between athletes and coaches
- Unread message counters, timestamps, and conversation threads

### 6.  Content Moderation & Community Guidelines
- User-generated transformations, training tips, and recipe guides
- Dedicated admin approval/rejection queue with moderator notes

---

##  Demo Credentials

The platform is pre-seeded with realistic production data. You can log in using these accounts or use the **1-Click Quick Role Switcher** in the navigation bar:

| Role | Name | Email | Password |
|---|---|---|---|
| **ADMIN** | Jane Sterling | `admin@pulsefit.com` | `admin123` |
| **COACH** | Alex Morgan, CSCS | `coach.alex@pulsefit.com` | `coach123` |
| **COACH** | Elena Vance, CPT | `coach.elena@pulsefit.com` | `coach123` |
| **ATHLETE** | Marcus Chen | `marcus@pulsefit.com` | `user123` |
| **ATHLETE** | Sarah Jenkins | `sarah@pulsefit.com` | `user123` |
| **ATHLETE** | David Rodriguez | `david@pulsefit.com` | `user123` |

---

##  Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Recharts, Canvas-Confetti
- **Backend**: Node.js, Express, TypeScript, tsx
- **Authentication**: JWT (JSON Web Tokens), bcryptjs password hashing
- **Database & Storage**: Atomic persistent JSON store with relational integrity and automatic schema seeding (`.data/pulsefit_db.json`)
- **Build & Dev Server**: Vite 6 / tsx server integration on port 3000

---

##  API Overview

### Authentication & Profiles
- `POST /api/auth/login` — Sign in and issue JWT token
- `POST /api/auth/register` — Register new athlete or coach
- `GET /api/auth/me` — Verify session and load authenticated user
- `POST /api/auth/forgot-password` — Password reset request
- `POST /api/auth/reset-password` — Update account password
- `GET /api/users/profile` — Fetch profile details and assigned coach
- `PUT /api/users/profile` — Update biometrics and goals
- `PUT /api/users/assign-coach` — Assign or switch personal coach

### Workouts & Sessions
- `GET /api/workouts/plans` — List available workout programs
- `POST /api/workouts/plans` — Create plan with multi-day routines (Coach/Admin)
- `GET /api/workouts/my-assigned` — Get athlete's active scheduled routine
- `POST /api/workouts/assign` — Assign program to athlete
- `POST /api/workouts/log-completion` — Record completed workout session
- `GET /api/workouts/history` — Fetch historical workout logs

### Health, BMI & Nutrition
- `POST /api/bmi/calculate` — Calculate BMI, WHO category, and save record
- `GET /api/bmi/history` — Get BMI assessment logs
- `GET /api/progress` — Get weight trajectory and circumference records
- `POST /api/progress` — Add new biometric measurement
- `GET /api/nutrition` — Daily nutrition summary and 7-day intake trend
- `POST /api/nutrition` — Log food item with calories & macros
- `DELETE /api/nutrition/:id` — Delete meal log

### Coach & Admin Operations
- `GET /api/coach/dashboard` — Coach KPIs and recent athlete submissions
- `GET /api/coach/clients` — Athlete roster with progress inspect endpoints
- `GET /api/admin/stats` — Platform health and user registration telemetry
- `GET /api/admin/users` — Search and filter user accounts
- `PUT /api/admin/users/:id/status` — Activate or deactivate account
- `PUT /api/admin/users/:id/role` — Promote or adjust user permissions
- `DELETE /api/admin/users/:id` — Delete account
- `GET /api/content/all` — Content submissions queue
- `PUT /api/content/:id/moderate` — Approve or reject community submission
- `GET /api/feedback` & `PUT /api/feedback/:id/status` — User feedback workflow
- `GET /api/settings` & `PUT /api/settings` — System-wide configuration

---

##  Development & Production Commands

```bash
# Start development server (Full-stack Express + Vite on port 3000)
npm run dev

# Compile and check TypeScript types
npm run lint

# Build production bundle
npm run build

# Start production server
npm run start
```
