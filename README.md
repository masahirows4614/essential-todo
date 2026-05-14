# Essential — A rich, fluid ToDo

A personal ToDo app built around two ideas:

1. **Rich & fluid** UI — glassmorphism dashboard, springy/"squishy" Framer Motion
   interactions, satisfying "pop" animation on completion, drag-to-jiggle cards.
2. **Essentialism logic** — tasks labelled `Assignment (課題)` are auto‑set to
   high priority. Anything else still open after **3 days** gets a gentle
   "Is this truly essential?" indicator.

Built with **Next.js 14 (App Router)**, **Tailwind CSS**, **Framer Motion**, and
TypeScript. Persists tasks to **localStorage** — no backend required.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Deploy to Vercel

The project is plain Next.js with no custom server, env vars, or external
dependencies, so it deploys to Vercel out of the box:

```bash
# from this directory, after `npm i -g vercel`
vercel
```

Or push to a Git repo and import it on [vercel.com/new](https://vercel.com/new) —
Vercel auto-detects Next.js and uses `npm run build`.

## Project structure

```
app/
  layout.tsx        Root layout + ambient background
  page.tsx          Renders <Dashboard />
  globals.css       Tailwind base + glass utility classes
components/
  Dashboard.tsx     Top-level layout, stats, filtering, responsive views
  TaskCard.tsx      Springy card with checkbox pop + stale chip
  AddTaskForm.tsx   Expanding glass form with label picker
  LabelFilter.tsx   Animated label chips with counts
lib/
  types.ts          Task / LabelKey / Priority types
  labels.ts         Label config (color, emoji, gradient)
  storage.ts        useLocalStorage hook + uid()
  essentialism.ts   isStale() and daysOld() helpers
```

## Swapping localStorage for Supabase

`lib/storage.ts` exposes a single `useLocalStorage<Task[]>` hook used only by
`Dashboard.tsx`. To switch to Supabase, replace that hook with one that
subscribes to a `tasks` table (e.g. via `@supabase/supabase-js` realtime) and
keep the same return shape `[tasks, setTasks, hydrated]` — no other component
needs to change.
