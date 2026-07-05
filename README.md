<div align="center">

# TomParo

**AI-Powered Career Intelligence Platform**

Get hired faster with AI CV analysis, job matching, cover letter generation, and career coaching.

[🌐 Live Site](https://www.tomparo.com) • [📖 Documentation](./docs) • [🐛 Report Bug](https://github.com/thrinxs/tomparo/issues)

</div>

---

## ✨ Features

### For Job Seekers

- 📄 **AI Resume Analysis** — ATS scoring, keyword optimization, and improvement suggestions
- 🎯 **Job Match Analysis** — Compare your CV against any job description
- ✉️ **Cover Letter Generator** — AI-crafted, personalized cover letters
- 📧 **Application Email Generator** — 3 styles (Formal, Modern, Concise)
- 📊 **Skill Gap Analysis** — Discover missing skills with learning roadmaps
- 🎤 **Interview Coaching** — AI-generated practice questions with feedback (Premium)
- 🧠 **Career AI Chat** — Personalized career advice (Premium)
- 🔍 **Auto Job Discovery** — Find jobs matching 85%+ of your CV (Premium)

### For Recruiters

- 📁 **Bulk CV Upload** — Analyze multiple CVs at once
- 🏆 **AI Candidate Ranking** — Get the best fits automatically
- 💼 **Job Posting** — Included with subscription
- 👥 **Team Collaboration** — Work together on hiring
- 📊 **Analytics Dashboard** — Hiring insights and metrics

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Language:** TypeScript
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Database:** PostgreSQL via [Supabase](https://supabase.com/)
- **ORM:** [Prisma 7](https://www.prisma.io/)
- **AI:** [Google Gemini 2.5 Flash](https://ai.google.dev/)
- **Auth:** [NextAuth.js](https://next-auth.js.org/)
- **Payments:** [Paystack](https://paystack.com/)
- **Deployment:** [Vercel](https://vercel.com/)

---

## 💰 Pricing

### For Job Seekers

- **Free:** 5 CV analyses/day, basic features
- **Premium:** ₦5,000/month or ₦50,000/year (Unlimited, no ads)

### For Recruiters

- **Starter:** ₦5,000/mo (20 CVs, 3 job posts)
- **Growth:** ₦10,000/mo (50 CVs, 10 job posts)
- **Business:** ₦30,000/mo (200 CVs, unlimited posts)
- **Enterprise:** ₦80,000/mo (500 CVs, featured)
- **Scale:** ₦150,000/mo (1,000 CVs, priority)

---

## 🚀 Getting Started

```bash
# Clone the repository
git clone https://github.com/thrinxs/tomparo.git
cd tomparo

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Fill in your keys

# Run migrations
npx prisma db push

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## 📁 Project Structure

```
tomparo/
├── app/                    # Next.js App Router pages
├── components/             # React components
├── lib/                    # Core logic (AI, DB, auth)
│   └── ai/                 # AI service modules
├── prisma/                 # Database schema
├── types/                  # TypeScript types
├── hooks/                  # Custom React hooks
└── docs/                   # Business documentation
```

---

## 🌍 Built for Nigeria, Ready for the World

TomParo is Nigeria's first AI-native career platform, designed to serve the African market while scaling globally. Prices in Naira. Payments via Paystack. Built with love in Port Harcourt.

---

## 📝 License

Proprietary — All rights reserved.

---

## 👤 Author

**Built by [Thrinxs](https://thrinxs.com)**

Made with ❤️ in Nigeria 🇳🇬
