# 🩺 AI Medical Voice Agent Doctors

An AI-powered telemedicine platform built with **Next.js 15** that combines real-time video consultations, AI-driven medical triage via voice/text, appointment management, and a credit-based payment system — all within a sleek, dark-themed UI.

---

## 🌟 Features

### 🤖 AI Voice Consultation
- **Speech-to-Text** — Patient speaks into the mic; audio is transcribed via **AssemblyAI**.
- **LLM Medical Triage** — Transcribed text is sent to **OpenRouter (GPT-3.5 Turbo)** with a comprehensive medical triage system prompt that collects symptoms, assesses severity, identifies possible causes, and recommends specialists.
- **Text-to-Speech** — AI doctor's response is spoken aloud using **Murf AI** TTS (with browser `speechSynthesis` fallback).
- **Text Chat Fallback** — Patients can also type their responses instead of using the microphone.
- **Consultation Summary** — At the end of a session, patients receive a structured summary with severity, recommended specialist, and a direct "Book Now" button.

### 📹 Video Consultations
- Real-time doctor–patient video calls powered by **Vonage Video API (OpenTok)**.
- Session creation and token generation handled server-side.

### 📅 Appointment Booking
- Browse verified doctors by specialty.
- View doctor availability slots and book appointments.
- Appointment lifecycle management (Scheduled → Completed / Cancelled).

### 👥 Role-Based Access Control
| Role | Capabilities |
|------|-------------|
| **Patient** | Book appointments, purchase credits, AI consultation, video calls |
| **Doctor** | Set availability, manage appointments, view earnings, request payouts |
| **Admin** | Verify/reject doctors, process payouts, manage platform |

### 💳 Credit System
- Patients purchase credit packages via **Clerk Billing**.
- Each consultation costs **2 credits**.
- Credits never expire; subscriptions provide monthly credit refresh.
- Full transaction history tracking.

### 💰 Doctor Payouts
- Doctors earn **$8 per credit** (platform keeps $2 fee per credit).
- PayPal-based payout requests, processed by admin.

### 🔐 Authentication
- Powered by **Clerk** with dark theme.
- Protected routes via middleware for `/doctors`, `/appointments`, `/video-call`, `/ai-consultation`, `/admin`, etc.
- Automatic post-signup redirection to onboarding.

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 15 (App Router, Turbopack) |
| **Language** | JavaScript (JSX) |
| **Styling** | Tailwind CSS 4 + Radix UI primitives |
| **Authentication** | Clerk (with dark theme) |
| **Database** | PostgreSQL (Neon) via Prisma ORM |
| **Video Calls** | Vonage Video API / OpenTok |
| **Speech-to-Text** | AssemblyAI |
| **LLM / AI** | OpenRouter (GPT-3.5 Turbo) |
| **Text-to-Speech** | Murf AI |
| **UI Components** | shadcn/ui (Button, Card, Dialog, Select, Tabs, etc.) |
| **Forms** | React Hook Form + Zod validation |
| **Notifications** | Sonner toast |
| **Icons** | Lucide React |

---

## 📁 Project Structure

```
AI-MEDICAL-VOICE-AGENT/
├── app/
│   ├── (auth)/                  # Auth pages (sign-in, sign-up)
│   ├── (main)/                  # Protected app pages
│   │   ├── admin/               # Admin dashboard
│   │   ├── ai-consultation/     # AI voice consultation page
│   │   ├── appointments/        # Patient/Doctor appointments
│   │   ├── doctor/              # Doctor dashboard & management
│   │   ├── doctors/             # Doctor listing & booking
│   │   ├── onboarding/          # Role selection & profile setup
│   │   ├── pricing/             # Credit purchase packages
│   │   └── video-call/          # Vonage video call page
│   ├── api/
│   │   └── ai/
│   │       ├── speak/route.js   # TTS endpoint (Murf AI)
│   │       └── transcript/route.js  # STT + LLM endpoint
│   ├── layout.js                # Root layout (Clerk, theme, header)
│   ├── page.js                  # Landing page (hero, features, pricing, testimonials)
│   └── globals.css              # Global styles
├── actions/                     # Server Actions
│   ├── admin.js                 # Admin operations (verify doctors, stats)
│   ├── appointments.js          # Appointment CRUD & video session management
│   ├── credits.js               # Credit purchase & balance management
│   ├── doctor.js                # Doctor profile, availability, dashboard
│   ├── doctors-listing.js       # Public doctor search/listing
│   ├── onboarding.js            # User role assignment & profile creation
│   ├── patient.js               # Patient-specific operations
│   └── payout.js                # Doctor payout requests & processing
├── components/
│   ├── ai/
│   │   └── AIConsultationCard.jsx  # Full AI consultation UI (mic, chat, summary)
│   ├── ui/                      # shadcn/ui components
│   ├── appointment-card.jsx     # Appointment display card
│   ├── header.jsx               # Navigation header
│   └── pricing.jsx              # Clerk pricing table
├── hooks/
│   └── use-fetch.js             # Custom data-fetching hook
├── lib/
│   ├── services/
│   │   └── ai-service.js        # STT, LLM, and TTS service integrations
│   ├── checkUser.js             # User session verification
│   ├── data.js                  # Static data (features, testimonials)
│   ├── prisma.js                # Prisma client singleton
│   ├── schema.js                # Zod validation schemas
│   ├── specialities.js          # Medical specialty definitions
│   └── utils.js                 # Utility functions
├── prisma/
│   ├── schema.prisma            # Database schema (User, Appointment, Availability, etc.)
│   └── migrations/              # Database migrations
├── scripts/                     # Test/utility scripts
├── middleware.js                 # Clerk auth middleware & route protection
├── next.config.mjs              # Next.js configuration
├── package.json                 # Dependencies & scripts
└── .env                         # Environment variables (not committed)
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** (comes with Node.js)
- **PostgreSQL** database (or a [Neon](https://neon.tech) serverless Postgres instance)
- Accounts & API keys for the following services:

| Service | Purpose | Sign Up |
|---------|---------|---------|
| [Clerk](https://clerk.com) | Authentication & user management | https://dashboard.clerk.com |
| [Neon](https://neon.tech) | Serverless PostgreSQL | https://console.neon.tech |
| [Vonage](https://www.vonage.com/communications-apis/video/) | Video call API | https://dashboard.nexmo.com |
| [AssemblyAI](https://www.assemblyai.com) | Speech-to-Text | https://www.assemblyai.com/dashboard |
| [OpenRouter](https://openrouter.ai) | LLM API (GPT-3.5 Turbo) | https://openrouter.ai/keys |
| [Murf AI](https://murf.ai) | Text-to-Speech | https://murf.ai/resources/api |

---

### 1. Clone the Repository

```bash
git clone https://github.com/SrijaVuppala295/AI_MEDICAL_AGENT.git
cd AI_MEDICAL_AGENT
```

### 2. Install Dependencies

```bash
npm install
```

This also automatically runs `prisma generate` (via the `postinstall` script) to generate the Prisma Client.

### 3. Set Up Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# ─── Clerk Authentication ────────────────────────────────────────
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key

# ─── Clerk Routes ────────────────────────────────────────────────
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL=/onboarding
NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=/onboarding

# ─── Database (PostgreSQL / Neon) ────────────────────────────────
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require

# ─── Vonage Video API ───────────────────────────────────────────
VONAGE_API_KEY=your_vonage_api_key
NEXT_PUBLIC_VONAGE_APPLICATION_ID=your_vonage_application_id
VONAGE_PRIVATE_KEY=lib/private.key

# ─── AssemblyAI (Speech-to-Text) ────────────────────────────────
NEXT_PUBLIC_ASSEMBLYAI_API_KEY=your_assemblyai_api_key

# ─── Murf AI (Text-to-Speech) ───────────────────────────────────
MURF_API_KEY=your_murf_api_key

# ─── OpenRouter (LLM) ───────────────────────────────────────────
OPEN_ROUTER_API_KEY=your_openrouter_api_key
```

#### Vonage Private Key

Place your Vonage application private key file at `lib/private.key`. This file is used for server-side JWT generation for video sessions.

### 4. Set Up the Database

```bash
# Push the Prisma schema to your database (creates tables)
npx prisma db push

# (Optional) Open Prisma Studio to inspect your data
npx prisma studio
```

If you prefer using migrations:

```bash
npx prisma migrate dev --name init
```

### 5. Configure Clerk

1. Go to [Clerk Dashboard](https://dashboard.clerk.com) → create an application.
2. Copy the **Publishable Key** and **Secret Key** into your `.env`.
3. Under **Paths**, set:
   - Sign-in URL: `/sign-in`
   - Sign-up URL: `/sign-up`
   - After sign-in redirect: `/onboarding`
   - After sign-up redirect: `/onboarding`

### 6. Run the Development Server

```bash
npm run dev
```

The app will start at **http://localhost:3000** with Turbopack for fast reload.

---

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with Turbopack |
| `npm run build` | Create production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npx prisma studio` | Open Prisma Studio GUI |
| `npx prisma db push` | Sync schema to database |
| `npx prisma migrate dev` | Run database migrations |

---

## 🔄 AI Consultation Pipeline

The AI medical consultation follows a three-stage pipeline:

```
┌──────────────┐     ┌───────────────────┐     ┌─────────────┐
│  Patient      │     │   Server (API)     │     │  AI Services │
│  (Browser)    │     │   /api/ai/*        │     │              │
└──────┬───────┘     └────────┬──────────┘     └──────┬──────┘
       │                      │                        │
       │  1. Record audio     │                        │
       │  ──────────────────> │                        │
       │                      │  2. Upload to          │
       │                      │     AssemblyAI  ────── │──> STT
       │                      │                        │
       │                      │  3. Transcript         │
       │                      │  <──────────────────── │
       │                      │                        │
       │                      │  4. Send transcript +  │
       │                      │     history to         │
       │                      │     OpenRouter  ────── │──> LLM
       │                      │                        │
       │                      │  5. JSON response      │
       │                      │  <──────────────────── │
       │                      │                        │
       │  6. Display AI reply │                        │
       │  <────────────────── │                        │
       │                      │                        │
       │  7. Request TTS      │                        │
       │  ──────────────────> │  8. Murf AI ────────── │──> TTS
       │                      │                        │
       │  9. Play audio       │                        │
       │  <────────────────── │                        │
       │                      │                        │
```

### LLM System Prompt Highlights

The AI doctor is configured with a comprehensive medical triage prompt that:

- **Collects** patient name, age, symptoms, duration, severity (1–10), related symptoms, medical history, and medications — one question at a time.
- **Classifies** into 16 medical departments (Cardiology, Neurology, Orthopedics, etc.).
- **Assigns severity**: Low / Medium / High / Emergency.
- **Provides** possible causes, safe health guidance, and specialist recommendations.
- **Emergency detection**: Automatically flags emergencies (chest pain, stroke symptoms, etc.) and advises immediate medical attention.
- **Never ends early**: Continues the consultation until the patient confirms they are done.
- **Returns structured JSON** with `displayText`, `status`, `userName`, `department`, `severity`, `summary`, `possibleCauses`, `suggestedSpecialist`, `report`, `feedback`, and `isComplete`.

---

## 🗄️ Database Schema

The PostgreSQL database (managed via Prisma) includes:

| Model | Purpose |
|-------|---------|
| **User** | Unified user model with role (Patient / Doctor / Admin), patient credits, doctor profile fields (specialty, experience, verification status) |
| **Availability** | Doctor time slots (start/end time, status: Available / Booked / Blocked) |
| **Appointment** | Booking records linking patient ↔ doctor with video session IDs, status, and notes |
| **CreditTransaction** | Ledger of credit purchases, appointment deductions, and admin adjustments |
| **Payout** | Doctor payout requests with platform fee calculation ($2/credit fee, $8/credit to doctor) |

---

## 🌐 Deployment

### Vercel (Recommended)

1. Push your code to GitHub.
2. Import the repository on [Vercel](https://vercel.com).
3. Add all environment variables from `.env` to Vercel's project settings.
4. Ensure `VONAGE_PRIVATE_KEY` path is correct or use an environment variable for the key content.
5. Vercel will auto-detect Next.js and deploy.

### Other Platforms

The app can also be deployed on **Railway**, **Render**, or any platform supporting Node.js:

```bash
npm run build
npm run start
```

Make sure the `DATABASE_URL` is accessible from the deployment environment and all API keys are configured as environment variables.

---

## 🛡️ Security Notes

- **Never commit `.env`** — it's included in `.gitignore`.
- **`lib/private.key`** (Vonage) is also gitignored.
- API keys prefixed with `NEXT_PUBLIC_` are exposed to the browser — only use this for keys designed for client-side use (Clerk publishable key, AssemblyAI, Vonage app ID).
- Server-side keys (`CLERK_SECRET_KEY`, `VONAGE_API_KEY`, `MURF_API_KEY`, `OPEN_ROUTER_API_KEY`) are never exposed to the client.

---

## 🤝 Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature`.
3. Commit your changes: `git commit -m "Add your feature"`.
4. Push to the branch: `git push origin feature/your-feature`.
5. Open a Pull Request.

---

## 📄 License

This project is private and maintained by **SaiSanjuSush**.

---

## 👩‍💻 Authors

Made with 💗 by **SaiSanjuSush**
