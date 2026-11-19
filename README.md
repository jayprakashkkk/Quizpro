# Quiz Pro

Responsive React + Vite quiz app with 401 MCQs in 16 subjects.

## Run
1. Install Node.js 18+.
2. In Terminal, enter the extracted project folder.
3. Run:
   ```bash
   npm install
   npm run dev
   ```
4. Open the local URL shown by Vite (usually http://localhost:5173).

Production build:
```bash
npm run build
npm run preview
```

## Add questions
Edit `src/data/questions.json`. Each object must have `id`, `subject`, `difficulty` (`easy`, `medium`, `hard`), `question`, `options` (four strings), `correctIndex` (zero-based), and `explanation`. Use unique IDs. The subject selector is generated from this file.

## Included
- Exactly 20 questions per attempt
- Fisher–Yates shuffle for question and option order, with correct answers tracked after shuffling
- Per-subject and mixed quizzes; recently used IDs stored in localStorage
- Optional 15-minute timer, previous/next, question jump dots, review flags
- Submit confirmation with answered / unanswered counts
- Result percentage, animated score ring, subject performance bars
- Wrong and skipped answer review with explanations
- Dark/light toggle, keyboard arrows and keys 1–4, last 10 attempts saved locally
- No backend or API key required

Educational note: review the question bank before using it for formal grading.


## Authentication (Supabase) + Netlify deploy

Signup, login aur forgot-password (email OTP) Supabase Auth se chalte hain, isliye Netlify par bina alag server ke kaam karta hai.

### 1. Supabase setup (free)
1. supabase.com par project banayein.
2. Project Settings -> API se **Project URL** aur **anon public key** copy karein.
3. Authentication -> Sign In / Providers -> Email: enabled rakhein. "Confirm email" ON rakhein agar email verify karwana hai (recommended).
4. Authentication -> Email Templates -> **Reset Password** me body replace karein:
   `<h2>Reset your password</h2><p>Your OTP is: <b>{{ .Token }}</b></p>`
5. Authentication -> Providers -> Email me OTP length **6** rakhein.
6. Authentication -> URL Configuration: **Site URL** = aapka Netlify link (https://xxxx.netlify.app). Local testing ke liye Redirect URLs me http://localhost:5173 bhi add karein.
7. **Zaroori (sabke liye emails):** Supabase ka default email service bahut kam emails/ghanta bhejta hai. Authentication -> SMTP Settings me Brevo/Resend jaisa SMTP configure karein, warna sab users ko mail nahi pahunchegi.

### 1b. Attempts table (per-account score history)
Supabase -> SQL Editor -> New query me `supabase-setup.sql` ka content paste karke Run karein. Isse har user ke attempts, personal best, streak aur average uske apne account me save hote hain (kisi aur ko nahi dikhte).

### 2. Local run
```bash
cp .env.example .env   # Supabase URL + anon key bharein
npm install
npm run dev
```

### 3. Netlify deploy
1. Project GitHub par push karein (`.env` push NAHI karna).
2. Netlify -> Add new site -> Import from Git.
3. Build command `npm run build`, publish directory `dist` (netlify.toml me already set hai).
4. Site settings -> Environment variables me `VITE_SUPABASE_URL` aur `VITE_SUPABASE_ANON_KEY` add karein, phir redeploy karein.
