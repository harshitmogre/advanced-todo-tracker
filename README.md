# FocusFlow — Productivity Tracker

A task manager that shows how you're actually doing: completion rings, streaks,
day/week/month/year comparisons, a colour-coded calendar, and messages that
respond to your real progress.

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · Recharts

## Run it

```bash
npm install
npm run dev
```

Open **http://localhost:3000**. That's it — no database or `.env` needed.

The app starts with ~5 weeks of demo history so the charts have something to
show. When you're ready to use it for real: **Settings → Danger zone → Delete all data**.

## Pages

| Page | What it does |
|---|---|
| Dashboard | Today's completion ring, stat cards, 7-day trend, live motivation banner, today's tasks |
| Tasks | Create / edit / delete / complete. Priority, category, deadline, estimate, notes, recurrence. Filter + search |
| Analytics | Day / Week / Month / Year comparison with charts, table, and change vs the previous period. Insights: best day, best month, averages, longest streak |
| Calendar | Month heatmap coloured by completion rate. Click a day to see its tasks |
| History | Past days grouped by date with completion % |
| Settings | Daily goal, categories, export/import JSON backup, reset data |

## How the numbers work

- **Completion rate** for a day = completed ÷ tasks due that day.
- **Productivity score** weights by priority (high = 3, medium = 2, low = 1), so finishing the hard task counts for more than the easy one.
- **Streak** = consecutive days where every task due was completed. Days with *no* tasks don't break it. Today doesn't break it either until it's finished — but completing everything today extends it.
- **Overdue** = not completed and the deadline is before today.
- **Recurring tasks** — completing one automatically creates the next occurrence (daily / weekly / monthly).

## Project structure

```
app/                  pages (dashboard, tasks, analytics, calendar, history, settings)
components/           UI (layout, ui primitives, per-page components)
hooks/                useTasks, useSettings, useTheme
lib/
  analytics.ts        ALL calculations (streaks, comparisons, insights) — pure functions
  motivation.ts       message rules driven by progress
  storage.ts          data layer (currently localStorage)
  types.ts            shared types
  seed.ts             demo data
```

## Adding a real database later (Supabase / Postgres)

Your data currently lives in the browser's localStorage, which means it's
per-browser and lost if browser data is cleared (use Settings → Export backup).

The app is built so this is a one-file change: every function in
`lib/storage.ts` is already `async` and returns the same shapes an API would.
To move to Supabase, replace the bodies of `repo.getTasks / createTask /
updateTask / deleteTask` with Supabase calls — no page or component needs to change.
Add Supabase Auth when you want multiple users.

## Adding AI features later

`lib/analytics.ts` is pure functions over a `Task[]`, so it's easy to feed to a
model. Natural next steps: suggest a realistic daily plan from your history,
predict tasks likely to go overdue, or explain a dip in your weekly completion.
