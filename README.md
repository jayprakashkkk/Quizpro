<div align="center">

# 🧠 QUIZ PRO — Full-Stack Examination & Assessment Engine
### *Next-Gen Interactive Quiz Platform with Adaptive Question Engine & Cloud Analytics*

[![React](https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5+-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4+-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20Database-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Lucide](https://img.shields.io/badge/Lucide_Icons-Latest-F05032?style=for-the-badge&logo=lucide&logoColor=white)](https://lucide.dev/)
[![Netlify](https://img.shields.io/badge/Deploy-Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)](https://netlify.com/)
[![License](https://img.shields.io/badge/License-MIT-purple.svg?style=for-the-badge)](LICENSE)

<br/>

**Quiz Pro** is a high-performance, full-stack examination and trivia platform engineered for competitive exams, classroom training, and self-paced mastery. Features **401+ curated MCQs across 16 subjects**, Fisher–Yates randomization, 15-minute exam timer, animated score gauge analytics, and cloud account synchronization backed by Supabase.

[Key Features](#-key-features) • [Exam Engine](#-examination-engine-mechanics) • [Tech Architecture](#-system-architecture) • [Supabase Setup](#-cloud-backend--supabase-setup) • [Quick Start](#-quick-start) • [Netlify Deployment](#-deployment-guide-netlify)

---

</div>

## 📑 Table of Contents

- [About The Project](#-about-the-project)
- [✨ Key Features](#-key-features)
- [⚙️ Examination Engine Mechanics](#-examination-engine-mechanics)
- [🏗️ System Architecture](#-system-architecture)
- [📂 Question Bank & Schema](#-question-bank--schema)
- [⌨️ Keyboard Navigation Shortcuts](#-keyboard-navigation-shortcuts)
- [🛠️ Technology Stack](#-technology-stack)
- [🚀 Quick Start (Local Development)](#-quick-start)
- [🗄️ Cloud Backend & Supabase Setup](#-cloud-backend--supabase-setup)
- [🌐 Deployment Guide (Netlify)](#-deployment-guide-netlify)
- [📁 Project Structure](#-project-structure)
- [📄 License & Author](#-license--author)

---

## 🌟 About The Project

Traditional online testing apps are either too cumbersome, slow, or tied down by heavyweight backends. **Quiz Pro** provides a lightning-fast single-page web application offering the best of both worlds:
1. **Instant Offline-First Quizzing**: Take full quizzes immediately without any login or network requirement.
2. **Seamless Cloud Sync**: Sign in with Supabase Authentication to unlock lifetime test attempts tracking, personal best streaks, and performance analytics across all your devices.

---

## ✨ Key Features

- **📚 401+ Curated MCQs across 16 Subjects**: Broad curriculum covering Computer Science, Web Technologies, General Knowledge, Quantitative Aptitude, Logical Reasoning, Science, and more.
- **🎲 Double Fisher–Yates Randomization**: Both question sequence and option orders ($A, B, C, D$) are mathematically shuffled per attempt while perfectly preserving correct answer mapping.
- **⏱️ Timed Examination Mode**: Optional 15-minute countdown clock with visual urgency warnings.
- **🎯 Navigation Palette & Jump Dots**: Interactive question dot grid to jump directly to any question, monitor answered vs. unanswered status, and flag tricky questions for review.
- **📊 Real-time Score Ring & Analytics**:
  - Animated SVG circular score meter showing overall percentage.
  - Per-subject breakdown bar charts highlighting strengths and areas for improvement.
  - In-depth review panel for missed and skipped questions with comprehensive conceptual explanations.
- **🔐 Cloud Authentication with Supabase**:
  - Secure email signup, OTP login, and password reset flows.
  - Dedicated PostgreSQL `attempts` table tracking scores, time spent, streaks, and personal bests.
- **🌙 Sleek Dual Theme**: Instant toggle between Dark Cyber Mode and crisp Light Mode with persistent browser caching.
- **⌨️ Fluid Keyboard Accessibility**: Take entire exams without ever touching the mouse.

---

## ⚙️ Examination Engine Mechanics

```
                       ┌───────────────────────────────┐
                       │   401+ Curated MCQ Library    │
                       └──────────────┬────────────────┘
                                      │
                                      ▼
                       ┌───────────────────────────────┐
                       │  Fisher-Yates Question &     │
                       │     Option Randomizer         │
                       └──────────────┬────────────────┘
                                      │
                                      ▼
                       ┌───────────────────────────────┐
                       │   20-Question Active Exam     │
                       │  Timer + Flagging + Jump Dots │
                       └──────────────┬────────────────┘
                                      │
                                      ▼
                       ┌───────────────────────────────┐
                       │   Instant Analytics & Scores  │
                       │ Score Ring | Explanations     │
                       └──────────────┬────────────────┘
                                      │
                                      ▼
                       ┌───────────────────────────────┐
                       │ Supabase Cloud History Sync   │
                       └───────────────────────────────┘
```

- **Quota & Balance**: Each test session dynamically draws exactly **20 balanced questions**.
- **Anti-Repetition Algorithm**: Recently answered question IDs are cached locally to ensure high variety in subsequent test attempts.
- **Submission Shield**: Confirmation modal prevents accidental submissions by displaying real-time counts of answered vs. unanswered questions.

---

## 📂 Question Bank & Schema

All questions are maintained in `src/data/questions.json`. Each entry adheres to a strict, validated JSON schema:

```json
{
  "id": 101,
  "subject": "Web Development",
  "difficulty": "medium",
  "question": "Which HTTP status code signifies that a resource was permanently moved?",
  "options": [
    "301 Moved Permanently",
    "302 Found",
    "404 Not Found",
    "500 Internal Server Error"
  ],
  "correctIndex": 0,
  "explanation": "301 indicates that the requested resource has been assigned a new permanent URI."
}
```

---

## ⌨️ Keyboard Navigation Shortcuts

| Key | Action |
| :---: | :--- |
| `1` / `2` / `3` / `4` | Select option A, B, C, or D directly |
| `←` (Left Arrow) | Navigate to Previous Question |
| `→` (Right Arrow) | Navigate to Next Question |
| `F` | Toggle Review Flag on current question |
| `Enter` | Confirm and advance |

---

## 🛠️ Technology Stack

- **Core Framework**: [React 18](https://react.dev/) + [Vite](https://vitejs.dev/) for blazing-fast HMR and bundle compilation.
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with custom dark/light theme extensions.
- **Icons**: [Lucide React](https://lucide.dev/) for clean, consistent iconography.
- **Backend & Cloud Auth**: [Supabase](https://supabase.com/) (PostgreSQL Database, GoTrue Auth, Row Level Security).
- **Deployment & Edge Proxy**: [Netlify](https://www.netlify.com/) with automated continuous integration.

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **pnpm** / **yarn**

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/jayprakashkkk/Quizpro.git
cd Quizpro

# Install dependencies
npm install
```

### 3. Environment Configuration
Create a `.env` file in the project root:
```bash
cp .env.example .env
```
Fill in your Supabase project credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```
*(Note: If left empty, the application gracefully functions in 100% offline standalone mode!)*

### 4. Run Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

### 5. Production Build
```bash
npm run build
npm run preview
```

---

## 🗄️ Cloud Backend & Supabase Setup

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com/) and create a free project.
2. In **Project Settings** → **API**, copy the **Project URL** and **anon public key**.

### 2. Configure Authentication
1. Go to **Authentication** → **Providers** → **Email**: Ensure it is enabled.
2. Go to **URL Configuration**:
   - Set **Site URL** to your Netlify URL (`https://your-site.netlify.app`).
   - Add `http://localhost:5173` to **Redirect URLs** for local testing.

### 3. Create Attempts Table (Personal Score History)
Run the following SQL in your Supabase **SQL Editor** (`supabase-setup.sql`):

```sql
create table if not exists public.quiz_attempts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  subject text not null,
  score integer not null,
  total integer not null,
  percentage numeric not null,
  time_spent integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.quiz_attempts enable row level security;

-- Users can only see and insert their own attempts
create policy "Users can view own quiz attempts" 
  on public.quiz_attempts for select 
  using (auth.uid() = user_id);

create policy "Users can insert own quiz attempts" 
  on public.quiz_attempts for insert 
  with check (auth.uid() = user_id);
```

---

## 🌐 Deployment Guide (Netlify)

This project is pre-configured with `netlify.toml` and `_redirects` for single-page routing:

1. Push your repository to GitHub.
2. Log in to [Netlify](https://app.netlify.com/) and click **"Add new site"** → **"Import an existing project"**.
3. Select your `Quizpro` repository.
4. Set Build Settings:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
5. In **Site Configuration** → **Environment Variables**, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Click **Deploy Site**!

---

## 📁 Project Structure

```
Quizpro/
├── src/
│   ├── App.jsx                 # Core application controller & view routers
│   ├── main.jsx                # React root bootstrap
│   ├── supabaseClient.js       # Supabase client singleton & auth helpers
│   ├── styles.css              # Custom Tailwind directives & theme styles
│   ├── data/
│   │   └── questions.json      # 401+ curated MCQs across 16 subjects
│   └── utils/                  # Shuffle algorithms & storage handlers
├── supabase-setup.sql          # Database table & RLS policies script
├── netlify.toml                # Netlify build & redirect configuration
├── package.json                # Project dependencies and npm scripts
├── tailwind.config.js          # Tailwind CSS theme configurations
├── vite.config.js              # Vite bundler configurations
└── README.md                   # Comprehensive project documentation
```

---

## 📄 License & Author

Engineered by **[Jay Prakash](https://github.com/jayprakashkkk)**.

Licensed under the **MIT License**. Contributions and forks are welcome!
