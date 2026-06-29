# HC-UFPE Imaging Exam Assistant

An AI-powered assistant that helps patients and healthcare professionals at the **Diagnostic Imaging Unit (UDI)** of **Hospital das Clínicas — UFPE** find out exactly how to prepare for imaging exams (CT, MRI, ultrasound, mammography, X-ray, and more).

The assistant answers questions about fasting, contrast, required documents, scheduling, and operational flow — grounded **strictly** in the official UDI documentation, never on external or invented medical knowledge.

![Home page](home.png)

![Chat screen](chat.png)

## Objective

Patients and clinical teams often don't know how to prepare for an imaging exam, which leads to cancellations, repeated visits, and overloaded phone lines at the unit. This project provides a focused conversational assistant that:

- Gives **safe, source-grounded** preparation guidance — it answers *only* with what is written in the official UDI knowledge base, refusing to hallucinate fasting times, dosages, contraindications, or contacts.
- Adapts tone to two profiles:
  - **Patient** — simple, warm, step-by-step language.
  - **Professional** — technical, operational language (protocols, contraindications, request flow).
- Handles special cases: the **X-ray request flow** (via AGHU system), the **list of contrast X-ray exams** that require preparation, and a **fallback** when a specific preparation isn't registered yet (it tells the user to contact the sector instead of guessing).
- Always cites the **sources** (exams) used to build each answer.
- Degrades gracefully: if the AI key is missing or the model is unavailable, a **deterministic mock response** built from the same knowledge base is returned, so the app never goes dark.

## How it works

1. The user picks a profile (patient or professional) on the home page.
2. Each question is normalized and matched against the exam database (`searchExames`) by acronym, name, common name, and synonyms.
3. The matched exams, general guidance, contacts, and any special layers (X-ray flow / list) are assembled into a **strict context** prompt.
4. The context plus a profile-specific system prompt (with hard anti-hallucination rules) is sent to Claude.
5. The reply is returned with the cited sources.

### Knowledge base

| Data | Count |
|------|-------|
| Exams (`data/exames.json`) | 19 |
| Modalities | radiology, CT, MRI, ultrasound, mammography, bone densitometry, nuclear medicine |
| Preparation entries (`data/preparos.json`) | 14 confirmed (`ok`), 1 partial, 4 pending |

## Technologies

**Framework & language**
- [Next.js](https://nextjs.org) 16 (App Router)
- [React](https://react.dev) 19
- [TypeScript](https://www.typescriptlang.org) 5.7

**AI**
- [Vercel AI SDK](https://sdk.vercel.ai) (`ai`)
- [`@ai-sdk/anthropic`](https://sdk.vercel.ai/providers/ai-sdk-providers/anthropic) — Claude (`claude-sonnet-4-5`)

**UI & styling**
- [Tailwind CSS](https://tailwindcss.com) 4
- [shadcn/ui](https://ui.shadcn.com) + [@base-ui/react](https://base-ui.com)
- [Lucide React](https://lucide.dev) — icons
- [react-markdown](https://github.com/remarkjs/react-markdown) — render assistant replies
- `class-variance-authority`, `clsx`, `tailwind-merge`, `tw-animate-css`

**Tooling & platform**
- [Vercel Analytics](https://vercel.com/analytics)
- ESLint
- Deployed on [Vercel](https://vercel.com), built/managed with [v0](https://v0.app)

## Project structure

```
app/
  page.tsx              # Home — profile selection
  chat/
    page.tsx
    chat-client.tsx     # Chat UI
  api/chat/route.ts     # Chat endpoint: search → context → Claude (+ fallback)
lib/
  search.ts             # Normalized text search over the exam base
  mock-response.ts      # Deterministic fallback when AI is unavailable
  types.ts              # Shared types
data/
  exames.json           # Exam catalog
  preparos.json         # Preparation guidance + general info + X-ray flow
components/ui/          # shadcn/ui components
```

## Getting Started

Set the Claude API key (optional — without it the app falls back to deterministic responses):

```bash
# .env.local
CLAUDE_API_KEY=your_key_here
```

Run the development server:

```bash
npm run dev
# or pnpm dev / yarn dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run lint` | Run ESLint |

## Disclaimer

This assistant provides **support guidance only** and does **not** replace the orientation of the healthcare team.

---

Built with [v0](https://v0.app). This repository is linked to a [v0 project](https://v0.app/chat/projects/prj_HlYN3UAL7PZ831ukC4wteYW0l12L) — every merge to `main` auto-deploys.
