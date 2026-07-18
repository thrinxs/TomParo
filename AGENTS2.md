# TOMPARO — AGENTS2.md

# Phase 6+ additions. Read AGENTS.md first for full context.

# This file covers everything built AFTER the last AGENTS.md update.

---

## New Environment Variables (add to .env.local + Vercel)

ELEVENLABS_API_KEY=sk_1dca1050e07343065f93501b65f32915230d99bbb89f89fd
ASSEMBLYAI_API_KEY=your_key_here

---

## New Files Added Since AGENTS.md

app/api/tts/route.ts # UPDATED — ElevenLabs → HuggingFace → Web Speech fallback chain
app/api/assemblyai/token/route.ts # NEW — generates short-lived AssemblyAI token for candidate page
app/api/interview-session/[token]/transcript/route.ts # NEW — candidate sends live transcript chunks to DB
app/api/interview-session/[token]/chat/route.ts # NEW — candidate sends complaint/message/question
app/api/interview-session/[token]/paste-attempt/route.ts # NEW — logs paste attempts from candidate
app/api/recruiter/interviews/[id]/follow-up/route.ts # NEW — AI decides + generates follow-up question
app/api/recruiter/interviews/[id]/recording/route.ts # NEW — POST upload recording + GET signed URL
app/api/recruiter/interviews/[id]/go-live/route.ts # NEW — PATCH isLive + liveMessage
app/api/recruiter/interviews/[id]/live-transcript/route.ts # NEW — GET live transcript + PATCH stealth mode
app/api/recruiter/interviews/[id]/notes/route.ts # NEW — GET/POST/DELETE recruiter notes on interview
app/api/recruiter/interviews/[id]/rate/route.ts # NEW — PATCH per-question recruiter rating + flag (uses Prisma.RecruiterInterviewQuestionUpdateInput)
app/api/recruiter/interview-settings/route.ts # NEW — GET + PATCH global interview message template + defaultVoiceId
components/recruiter/InterviewMonitorModal.tsx # NEW — floating interview monitor modal
components/Footer.tsx # REBUILT — full professional footer with watermark

---

## Schema Changes (already pushed to DB)

### Added to RecruiterInterview:

voiceId String? — ElevenLabs voice ID for this interview
allowFollowUps Boolean @default(true)
followUpCount Int @default(0)
stealthMode Boolean @default(false) — recruiter watches without notifying candidate
liveTranscript String? @db.Text — live transcript from AssemblyAI (updated every second)
liveTranscriptUpdatedAt DateTime? — when transcript was last updated
pasteAttempts Int @default(0) — how many times candidate tried to paste
notes RecruiterInterviewNote[] — relation to notes model
candidateMessages CandidateInterviewMessage[] — relation to candidate messages

### Added to RecruiterInterviewQuestion:

isFollowUp Boolean @default(false)
parentQuestionId String? — ID of the main question this follows up on
followUpReason String? @db.Text — why AI decided to ask this follow-up
recruiterRating Int? — recruiter thumbs up (+1) or thumbs down (-1) per answer
flagged Boolean @default(false) — recruiter flags answer for review
recruiterNote String? @db.Text — recruiter private note per answer

### Added to RecruiterInterviewSettings:

defaultVoiceId String? — recruiter's default ElevenLabs voice ID

### New Model: RecruiterInterviewNote

id String @id @default(cuid())
interviewId String
recruiterId String
note String @db.Text
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
Relations: interview (RecruiterInterview), recruiter (RecruiterProfile)

### New Model: CandidateInterviewMessage

id String @id @default(cuid())
interviewId String
type CandidateMessageType @default(MESSAGE)
category String? — complaint category (technical/unclear/time/audio/other)
content String @db.Text
read Boolean @default(false)
readAt DateTime?
createdAt DateTime @default(now())
Relations: interview (RecruiterInterview)

### New Enum: CandidateMessageType

COMPLAINT
MESSAGE
QUESTION

### Added to RecruiterProfile:

interviewNotes RecruiterInterviewNote[] — back-relation (REQUIRED by Prisma)

---

## TTS Failover Chain (UPDATED)

### Priority Order

1. ElevenLabs (best quality — Business+ plans)
   - Returns audio/mpeg
   - On quota exceeded → 402 response → falls back
2. HuggingFace TTS (decent quality — free, uses existing HUGGINGFACE_API_KEY)
   - Model: microsoft/speecht5_tts
   - Returns audio/flac
3. Web Speech API (robotic — always works, browser built-in)
   - Falls back when /api/tts returns 503

### /api/tts route behaviour

POST body: { text: string, voiceId: string }

- Tries ElevenLabs first (if voiceId + ELEVENLABS_API_KEY set)
- Falls back to HuggingFace (if HUGGINGFACE_API_KEY set)
- Returns 503 { error: "tts_unavailable", fallback: "web-speech" } if both fail
- Client (speakElevenLabs) throws on non-OK → doSpeak .catch() fires Web Speech

### doSpeak() — finish guard (CRITICAL)

Every doSpeak() call uses a `finished` boolean guard:

- Prevents double-fire when ElevenLabs fails partway and fallback also calls finish()
- Pattern: let finished = false; const finish = () => { if (finished) return; finished = true; ... }
- ALWAYS use this pattern in any future speak implementation

---

## AssemblyAI Real-Time Transcription System

### Why AssemblyAI (replaced Web Speech API)

Web Speech API was unreliable:

- Stopped randomly after ~60s
- Clicked between restarts
- Repeated questions infinitely
- Missed answers silently

AssemblyAI WebSocket:

- True continuous streaming
- Sub-300ms transcript latency
- 333 hours free streaming/month
- No credit card required
- Handles Nigerian English well

### How It Works

1. Candidate clicks Begin Interview
2. getUserMedia() → mic stream obtained
3. POST /api/assemblyai/token (sends shareToken → server validates → returns short-lived AAI token)
4. WebSocket opened: wss://api.assemblyai.com/v2/realtime/ws?sample_rate=16000&token=xxx
5. AudioContext + ScriptProcessorNode converts Float32 → Int16 → sends to WebSocket
6. AssemblyAI returns PartialTranscript (shown in real-time) + FinalTranscript (saved)
7. FinalTranscript → POST /api/interview-session/[token]/transcript → saved to DB
8. Recruiter Monitor Modal polls DB every 1s → sees live transcript

### AssemblyAI Token Security

- ASSEMBLYAI_API_KEY is server-side only — never exposed to browser
- /api/assemblyai/token validates shareToken against DB before issuing AAI token
- AAI token expires in 3600 seconds (1 hour)
- Proxy route is public (no auth) — validated by shareToken instead

### Silence Detection (kept from before)

Still uses AudioContext + AnalyserNode alongside AssemblyAI:

- Silence detection runs in parallel with AssemblyAI WebSocket
- When FinalTranscript received → cancel repeat timer + reset isRepeatingRef
- Silence thresholds controlled by pace slider (paceFromSlider)

---

## ElevenLabs Voice System

### Plan-Based Voice Tier (CRITICAL)

STARTER + GROWTH → Web Speech API (browser built-in, robotic, free)
BUSINESS + ENTERPRISE + SCALE + CUSTOM + ADMIN → ElevenLabs (human-like, $5/mo)

Checked in:

- /api/recruiter/interviews/route.ts (on create — resolves voiceId based on plan)
- /api/interview-session/[token]/route.ts (returns voiceTier + voiceId to candidate page)
- /app/(recruiter)/recruiter/interviews/new/page.tsx (shows voice picker only if isElevenLabsPlan)
- /app/(recruiter)/recruiter/settings/page.tsx (shows voice picker only if isElevenLabsPlan)

### ElevenLabs Voice Library (all 21 voices)

Stored in lib/ai/interview-engine.ts as ELEVENLABS_VOICES array
Each entry: { id, name, desc, gender }

DEFAULT_MALE_VOICE_ID = "nPczCjzI2devNBz1zQrb" // Brian
DEFAULT_FEMALE_VOICE_ID = "EXAVITQu4vr4xnSDxMaL" // Sarah
DEFAULT_NEUTRAL_VOICE_ID = "SAz9YHcvj6GT2YYXdXww" // River

Full voice list:
Brian → nPczCjzI2devNBz1zQrb (male) Deep, Resonant and Comforting
Daniel → onwK4e9ZLuTAKqWW03F9 (male) Steady Broadcaster
George → JBFqnCBsd6RMkjVDRZzb (male) Warm, Captivating Storyteller
Eric → cjVigY5qzO86Huf0OWal (male) Smooth, Trustworthy
Chris → iP95p4xoKVk53GoZ742B (male) Charming, Down-to-Earth
Adam → pNInz6obpgDQGcFmaJgB (male) Dominant, Firm
Bill → pqHfZKP75CvOlQylNhV4 (male) Wise, Mature, Balanced
Roger → CwhRBWXzGAHq8TQ4Fs17 (male) Laid-Back, Casual, Resonant
Charlie → IKne3meq5aSn9XLyUdCD (male) Deep, Confident, Energetic
Will → bIHbv24MWmeRgasZH58o (male) Relaxed Optimist
Liam → TX3LPaxmHKxFdv7VOQHJ (male) Energetic, Social Media Creator
Sarah → EXAVITQu4vr4xnSDxMaL (female) Mature, Reassuring, Confident
Matilda → XrExE9yKIg1WjnnlVkGX (female) Knowledgable, Professional
Bella → hpp4J3VqNfWAUOO0d1Us (female) Professional, Bright, Warm
Jessica → cgSgspJ2msm6clMCkdW9 (female) Playful, Bright, Warm
Alice → Xb7hH8MSUJpSbSDYk0k2 (female) Clear, Engaging Educator
Laura → FGY2WhTYpPnrIDTdsKH5 (female) Enthusiast, Quirky Attitude
Lily → pFZP5JQG7iQjIQuC4Bku (female) Velvety Actress
River → SAz9YHcvj6GT2YYXdXww (neutral) Relaxed, Neutral, Informative

---

## Pace Slider System

Candidate sets pace on setup screen before interview starts.
Smooth 0–100 continuous range.

paceFromSlider(value: 0-100):
silenceRepeat: lerp(8000, 1200, t) // 8s (very patient) → 1.2s (very fast)
silenceSkip: lerp(14000, 2000, t) // 14s → 2s
speechRate: 0.72 → 1.15 // AI speech speed

Labels:
0-15 → Very Patient 🐢
16-35 → Relaxed
36-60 → Normal 🚶
61-80 → Brisk
81-100 → Fast 🏃

---

## Interview Setup Screen — 5 Steps (ALL types)

Step 1 — Welcome:

- Company name + role in sticky top bar
- Interview type badge (Text=indigo, Voice=violet, Video=pink)
- Step progress bar with labels
- Greeting + interview overview card (questions, est time, format, mode)
- What to expect section
- Encouragement message

Step 2 — System Check:

- Browser compatibility check
- Internet connection check
- Microphone check (Voice/Video only)
- Camera check (Video only)
- Retry button on failure
- Specific fix guidance per failure type

Step 3 — Your Details:

- Name confirmation with edit button
- Gender selection (auto-detected from name, always overridable)
- Date of birth (min age 16)

Step 4 — Settings (Voice/Video only — skipped for Text):

- Pace slider with live stats
- Voice preview button
- ElevenLabs voice picker (Business+ plans only)

Step 5 — Ready:

- Setup summary
- Numbered interview guidelines (includes: no pasting allowed)
- 3-item ready checklist — all must be checked before Begin activates
- Consent notice

---

## Text Interview Screen — Full Feature List

- Auto-next question — after submit + follow-up handled → next loads in 1.5s automatically
- Sticky progress header — company, role, question X/Y, elapsed timer, estimated remaining, End button
- Word count — live counter with color (red <30, amber <80, green 80+) + quality label
- Autosave draft — saves to localStorage every 3s, "Draft saved" indicator, restored on refresh
- Keyboard shortcut — Cmd/Ctrl+Enter to submit answer
- Question timer — per-question timer resets on each new question
- Paste blocking — onPaste prevented, warning shown, attempt logged to DB (pasteAttempts++)
- Answer quality hint — tip appears between 20-80 words
- Connection status — 🟢 Online / 🔴 Offline indicator in header
- Recruiter watching indicator — shows only when isLive=true AND stealthMode=false
- End Interview button — in sticky header, opens confirmation modal
- Chat box — floating purple button bottom-right, opens panel with 3 tabs

### Candidate Chat Box (all interview types)

3 tabs:

- 🚩 Complaint — 5 categories: Technical (mic/camera), Unclear question, Need more time, Audio issue, Other
- 💬 Message — sends to recruiter (note shown if not live)
- ❓ Question — ask about role/process/company

Stored in CandidateInterviewMessage table.
Recruiter sees on interview detail page.
"Sent" confirmation shown after sending.

### End Interview Confirmation Modal

- Shows questions remaining count
- Warning: unanswered questions marked as skipped
- Cancel / Yes End Interview buttons
- Graceful ending: closing message plays → recording uploads → completion screen

---

## Follow-Up Question System

### How It Works

After candidate submits each MAIN question answer:

1. /api/recruiter/interviews/[id]/follow-up called with { questionId, answer, shareToken }
2. analyzeForFollowUp() — Gemini decides if follow-up is warranted
3. If yes → generateFollowUpQuestion() — Gemini writes natural follow-up
4. Follow-up saved to DB as RecruiterInterviewQuestion (isFollowUp=true, parentQuestionId=mainQ.id)
5. totalQuestions + 1, followUpCount + 1 on interview
6. Candidate sees/hears the follow-up before moving to next main question

### Rules

- Max 3 follow-ups per interview total
- Never follow up on a follow-up question
- Never follow up on a skipped question
- Short answers (<15 words) don't trigger follow-up analysis
- Silently fails — never breaks interview flow

---

## Interview Monitor Modal (components/recruiter/InterviewMonitorModal.tsx)

### Three Size States

- corner — small floating widget, draggable anywhere on screen
- maximized — full screen overlay (two-column layout)
- minimized — thin bar at bottom right (candidate name + timer + progress)

### Features

- Live transcript feed — polls /api/recruiter/interviews/[id]/live-transcript every 1s
- Interview timer — counts up from 0:00 from when modal opened
- Current question display — shows question recruiter is watching
- Questions progress list (full screen mode only)
- Quick message templates (full screen mode only)
- Go Live button — announces presence to candidate
- Stealth mode — watch without notifying candidate
- Announce Presence — exits stealth + goes live + sends announcement message
- End Live Session button
- Send message → AI reads aloud to candidate
- Voice dictation for messages
- Skip question button
- Repeat question button
- Draggable in corner mode
- Pulsing red dot when live, grey when stealth

### Stealth Mode Flow

1. Recruiter opens Monitor Modal → clicks "Go Stealth"
2. PATCH /api/recruiter/interviews/[id]/live-transcript { stealthMode: true }
3. isLive stays FALSE — candidate NOT notified
4. Recruiter watches live transcript in real time
5. When ready → clicks "Announce My Presence"
6. stealthMode=false, isLive=true, liveMessage sent
7. Candidate sees banner + AI reads announcement aloud

---

## Interview Detail Page (app/(recruiter)/recruiter/interviews/[id]/page.tsx)

Full rebuild — see previous AGENTS2.md for full details. Key additions:

- Monitor Interview button → opens InterviewMonitorModal
- Paste attempts shown on interview card
- Candidate messages (complaints/questions) visible to recruiter

---

## Interviews List Page (app/(recruiter)/recruiter/interviews/page.tsx)

Full rebuild with stats, live alert, sort, bulk delete, type badges, time elapsed, etc.
Refresh button has spin animation (refreshing state only shows spinner on manual click).

---

## Logo System

### Logo Component (components/Logo.tsx)

Uses: /images/tomparo_logo.png (white logo)
Sizes: sm=32px, md=40px, lg=48px, xl=56px
No CSS filter needed — tomparo_logo.png is already white.
Used in: Navbar, RecruiterSidebar, DashboardSidebar, auth pages

### Footer Logo

Footer uses a CUSTOM Image directly (not Logo component) at style={{ height: "380px" }}
Source: /images/tomparo_logo.png
This is independent of Logo component — changing Logo sizes does NOT affect footer.

### Footer Watermark

Background watermark uses /images/logo.png (colored logo) at opacity-[0.04]
Positioned absolute, centered, covers full footer, pointer-events-none

### Favicon

public/favicon.ico — root level (auto-detected by Next.js)
All favicon variants in public/images/favicon_io/
Configured in app/layout.tsx metadata.icons

---

## Footer (components/Footer.tsx)

Full professional footer with:

- 4-column link grid: For Job Seekers, For Recruiters, Company, Legal
- 2x2 grid on mobile (NOT stacked) — grid-cols-2 sm:grid-cols-4
- Brand column: custom logo (380px), tagline, social icons, Made in Nigeria badge
- Social icons: Twitter/X (sky), LinkedIn (blue), Instagram (pink), Email (purple) — brand colors on hover
- Gradient top line (purple)
- Watermark logo (logo.png at 4% opacity)
- Bottom bar: copyright + Built by Thrinxs + All systems operational (green pulse)
- Hidden on: dashboard, admin, staff, support, recruiter/_ (not recruiter-pricing), interview/_

---

## Navbar Fix

hideNavbar conditions:

- /signin, /signup, /forgot-password
- /dashboard/\*
- /admin/_, /staff/_, /support/\*
- /interview/\*
- pathname === "/recruiter" (exact — was missing before)
- pathname.startsWith("/recruiter/") && !pathname.startsWith("/recruiter-pricing")

---

## Prisma Schema — Permanent Fix Strategy

### DB Push When Local Network Fails

Local MacBook sometimes can't reach Supabase pooler (port 6543).
Use DIRECT_URL (port 5432) for migrations:
DATABASE_URL="$(grep DIRECT_URL .env.local | cut -d'"' -f2)" DIRECT_URL="$(grep DIRECT_URL .env.local | cut -d'"' -f2)" npx prisma db push

### Vercel DB Push (when local network completely fails)

Change Vercel build command to:
prisma db push --accept-data-loss && npm run build
Redeploy → revert build command back to: npm run build

### Permanent Solution for Prisma TypeScript Errors

ALWAYS use: import { Prisma } from "@prisma/client"
Then type update data as: const data: Prisma.ModelNameUpdateInput = {}
Build data object by assigning fields conditionally — never spread conditionals.

### Adding Schema Fields on macOS

1. grep -n "target_field" prisma/schema.prisma → get line number
2. sed -i '' 'NUMa\ field_name Type' prisma/schema.prisma
3. sed -i '' 's/^field_name/ field_name/' prisma/schema.prisma (fix indentation)
4. Verify with sed -n 'NUM-2,NUM+4p' prisma/schema.prisma

---

## Current Build Status

### Phase 5 ✅ COMPLETE — AI Interviews

TEXT interviews: ✅ Auto-next, paste blocking, word count, autosave, timers, chat box, end interview
VOICE interviews: ✅ AssemblyAI WebSocket replaces Web Speech API
TTS: ✅ ElevenLabs → HuggingFace → Web Speech fallback chain
Setup Screen: ✅ 5-step flow (Welcome, System Check, Details, Settings, Ready)
Monitor Modal: ✅ Stealth mode, live transcript, draggable, 3 sizes
Interview Detail: ✅ Full rebuild with all features
Interviews List: ✅ Full rebuild with all features
Footer: ✅ Full professional footer with watermark
Logo: ✅ White tomparo_logo.png across all pages, correct favicons

### Known Limitations

- Voice interviews require HTTPS — test on tomparo.com not localhost
- AssemblyAI free tier: 333 hours streaming/month
- ElevenLabs free tier: 10,000 credits/month (exhausted — top up $5)
- HuggingFace TTS is slower than ElevenLabs (~2-3s delay)
- Local Supabase connection may fail — use DIRECT_URL workaround
- CandidateInterviewMessage + pasteAttempts schema may need Vercel db push if local network fails

---

## ⏳ Next — Phase 6: AI Autopilot + Documents (Enterprise+)

- [ ] Full 7-stage autonomous pipeline
- [ ] AI employment letter (PDF + DOCX)
- [ ] AI offer letter (PDF + DOCX)
- [ ] AI NDA generation
- [ ] Extra HR documents
- [ ] HR policies generator
- [ ] Employee handbook generator
- [ ] AI performance review
- [ ] Hiring cost dashboard
- [ ] Culture fit score
- [ ] Featured job badge
- [ ] Pipeline action buttons wired to actual API (Shortlist/Reject/Send Offer)
- [ ] Video interview candidate page UI
- [ ] Password reset emails (Resend — route exists, email not wired)
- [ ] Candidate messages panel on interview detail page (read/reply)
- [ ] Paste attempts displayed on interview detail page

---

## Notes for Future Development

- **ASSEMBLYAI_API_KEY:** Server-side only. Proxy via /api/assemblyai/token. Never expose to browser.
- **AssemblyAI token route:** Public — no session auth. Validates by shareToken instead.
- **Live transcript flow:** FinalTranscript → POST /api/interview-session/[token]/transcript → DB → recruiter modal polls every 1s
- **Stealth mode:** isLive stays false. Recruiter watches liveTranscript. Candidate unaware.
- **Paste blocking:** onPaste preventDefault + toast warning + POST /api/interview-session/[token]/paste-attempt
- **pasteAttempts:** Stored on RecruiterInterview. Recruiter can see count. Candidate doesn't know it's logged.
- **CandidateInterviewMessage:** type = COMPLAINT | MESSAGE | QUESTION. category only for COMPLAINT.
- **Auto-next text interview:** After submitAnswer + checkFollowUp resolves → setTimeout 1500ms → proceedToNext()
- **Draft autosave:** localStorage key = tomparo-draft-${token}-${currentIndex}. Cleared on submit + completion.
- **Keyboard shortcut:** Cmd/Ctrl+Enter — added via window.addEventListener("keydown")
- **Word count threshold:** <30 red, <80 amber, 80+ green. Quality hint shows at 20-80 words.
- **Recruiter watching:** Only shows when isLive=true AND stealthMode=false — never in stealth
- **Logo component:** sm=32px, md=40px, lg=48px, xl=56px — these are sidebar/navbar sizes ONLY
- **Footer logo:** Custom Image at height 380px — independent of Logo component
- **Footer watermark:** logo.png at opacity-[0.04] — colored logo behind footer content
- **Favicon:** public/favicon.ico at root — Next.js auto-detects. Also in metadata.icons.
- **RecruiterSidebar logo:** size="md" with px-4 py-3 container
- **DashboardSidebar logo:** size="md" with px-4 py-3 container
- **Vercel Google Fonts error:** Local network sometimes blocks fonts.gstatic.com. Use git push directly — Vercel builds fine.
- **Pipeline actions:** Currently UI only. Wire to actual candidate status API in Phase 6.
- **Monitor modal dragging:** Only in corner mode. mousedown/mousemove/mouseup on window.
- **RecruiterInterviewNote:** Always add back-relation on RecruiterProfile or Prisma rejects schema.
- **Prisma update types:** Always import { Prisma } from "@prisma/client" and use Prisma.ModelUpdateInput.
- **ElevenLabs quota:** 10K credits/month free. Top up $5 for 30K credits.
- **HuggingFace TTS model:** microsoft/speecht5_tts with bdl speaker embedding.
- **TTS Content-Type:** ElevenLabs=audio/mpeg, HuggingFace=audio/flac. Both play via Audio element.
