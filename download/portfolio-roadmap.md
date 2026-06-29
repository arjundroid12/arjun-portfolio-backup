# 📅 Daily Portfolio Roadmap · arjundroid12

> **Goal:** Ship one portfolio project every day, increasing in difficulty, to build an impressive GitHub profile over the next 2 weeks.

## ✅ Completed

| Day | Date       | Project              | Difficulty   | Tech              | Status |
|-----|------------|----------------------|--------------|-------------------|--------|
| 1   | 2026-06-29 | Calculator App       | Beginner     | Vanilla JS        | ✅     |
| 1   | 2026-06-29 | Notes App            | Beginner+    | Vanilla JS + MD   | ✅     |
| 1   | 2026-06-29 | Realtime Chat        | Intermediate | Node + Socket.io  | ✅     |

---

## 🗓️ Upcoming Projects (Day 2 → Day 14)

Each project ramps up difficulty and introduces new concepts. All projects get: README, LICENSE, CI workflow, live demo (GitHub Pages or backend host), MIT license.

### Week 1 — Frontend Mastery (Vanilla → React)

#### 📦 Day 2 — Weather App (Beginner-Intermediate)
- **Tech:** Vanilla JS + OpenWeather API (free)
- **Difficulty:** ⭐⭐
- **Features:** City search, current weather, 5-day forecast, recent searches, geolocation, °C/°F toggle
- **New skills:** Fetch API, async/await, working with third-party APIs, error handling
- **Live on:** GitHub Pages

#### 📦 Day 3 — Todo List with Drag & Drop (Intermediate)
- **Tech:** Vanilla JS + HTML5 Drag and Drop API
- **Difficulty:** ⭐⭐
- **Features:** Drag tasks between columns (To Do / In Progress / Done), priorities, due dates, filters, dark mode
- **New skills:** Drag and Drop API, complex state management, localStorage
- **Live on:** GitHub Pages

#### 📦 Day 4 — Movie Explorer (Intermediate)
- **Tech:** Vanilla JS + TMDB API
- **Difficulty:** ⭐⭐⭐
- **Features:** Trending movies, search, genre filters, favorites (localStorage), movie detail modal with trailer
- **New skills:** Modal dialogs, infinite scroll, debounce, lazy loading images
- **Live on:** GitHub Pages

#### 📦 Day 5 — Pomodoro Timer + Stats (Intermediate)
- **Tech:** Vanilla JS + Chart.js (CDN)
- **Difficulty:** ⭐⭐⭐
- **Features:** 25/5 timer, custom durations, daily/weekly stats chart, notifications, sound
- **New skills:** Chart.js integration, Web Notifications API, Web Audio API, setInterval patterns
- **Live on:** GitHub Pages

#### 📦 Day 6 — GitHub User Search (Intermediate-Advanced)
- **Tech:** Vanilla JS + GitHub REST API
- **Difficulty:** ⭐⭐⭐
- **Features:** Search users, view profile (repos, followers, bio), repo list with stars/forks, compare two users side-by-side
- **New skills:** API rate limiting handling, pagination, complex data shaping
- **Live on:** GitHub Pages

#### 📦 Day 7 — React Migration: Todo in React (Advanced)
- **Tech:** React 18 + Vite
- **Difficulty:** ⭐⭐⭐⭐
- **Features:** Rebuild Day 3's todo app in React with components, hooks, context
- **New skills:** React fundamentals, JSX, useState/useEffect/useContext, Vite build tooling
- **Live on:** GitHub Pages (with build step in CI)

---

### Week 2 — Backend & Full-Stack

#### 📦 Day 8 — URL Shortener API (Intermediate-Advanced)
- **Tech:** Node.js + Express + LowDB (JSON storage)
- **Difficulty:** ⭐⭐⭐⭐
- **Features:** Create short URLs, redirect endpoint, click analytics, custom aliases, expiry
- **New skills:** REST API design, persistent storage (LowDB), URL routing, rate limiting
- **Live on:** Render

#### 📦 Day 9 — Markdown Blog (Full-stack)
- **Tech:** Next.js 14 + Prisma + SQLite
- **Difficulty:** ⭐⭐⭐⭐
- **Features:** Markdown posts, tags, draft/publish, simple admin (no auth), RSS feed
- **New skills:** Next.js App Router, Prisma ORM, server components, dynamic routes
- **Live on:** Vercel

#### 📦 Day 10 — Expense Tracker with Charts (Full-stack)
- **Tech:** Next.js + Prisma + Chart.js
- **Difficulty:** ⭐⭐⭐⭐
- **Features:** Add expenses (amount, category, date), monthly chart, category breakdown, export CSV
- **New skills:** Database schema design, aggregations, CSV generation
- **Live on:** Vercel

#### 📦 Day 11 — Real-time Whiteboard (Advanced)
- **Tech:** Node.js + Socket.io + Canvas API
- **Difficulty:** ⭐⭐⭐⭐⭐
- **Features:** Multi-user drawing on shared canvas, color picker, brush size, undo, clear
- **New skills:** HTML5 Canvas, real-time sync, broadcast drawing events
- **Live on:** Render

#### 📦 Day 12 — JWT Auth Demo (Advanced)
- **Tech:** Node.js + Express + JWT + bcrypt
- **Difficulty:** ⭐⭐⭐⭐⭐
- **Features:** Signup/login with hashed passwords, JWT tokens, protected routes, refresh tokens
- **New skills:** Password hashing, JWT, middleware, security best practices
- **Live on:** Render

#### 📦 Day 13 — AI Chatbot UI (Advanced)
- **Tech:** Next.js + z-ai-web-dev-sdk (LLM)
- **Difficulty:** ⭐⭐⭐⭐⭐
- **Features:** Chat UI with streaming responses, conversation history, model selection, dark mode
- **New skills:** LLM integration, streaming responses, chat UI patterns
- **Live on:** Vercel

#### 📦 Day 14 — Portfolio Dashboard (Capstone)
- **Tech:** Next.js + Recharts + GitHub API
- **Difficulty:** ⭐⭐⭐⭐⭐
- **Features:** Aggregates all your repos, shows contribution graph, top languages, recent activity, links to all portfolio projects
- **New skills:** Combining APIs, data visualization, complex layouts
- **Live on:** Vercel — this becomes the centerpiece of your portfolio

---

## 📊 Progression Chart

```
Difficulty
5 ⭐                                ┌─────┬─────┬─────┐
                                   │     │     │     │
4 ⭐                  ┌─────┬─────┐│     │     │     │
                     │     │     ││     │     │     │
3 ⭐      ┌─────┬─────┐│     │     ││     │     │     │
          │     │     ││     │     ││     │     │     │
2 ⭐ ┌─────┐│     │     ││     │     ││     │     │     │
    │     ││     │     ││     │     ││     │     │     │
1 ⭐ │     ││     │     ││     │     ││     │     │     │
    D1   D2   D3   D4   D5   D6   D7   D8   D9  D10  D11  D12  D13  D14
   ├─────────Week 1: Frontend─────────┤├────────Week 2: Full-stack────────┤
```

---

## 🎯 Skills Coverage

By the end of Day 14, you'll have demonstrated:

| Skill Area              | Projects                          |
|-------------------------|------------------------------------|
| Vanilla JS fundamentals | Calculator, Notes, Weather, Todo   |
| API integration         | Weather, Movie, GitHub Search      |
| Async patterns          | All API projects                   |
| State management        | Notes, Todo, Expense Tracker       |
| Drag and Drop           | Todo                               |
| Charts / Visualization  | Pomodoro, Expense, Dashboard       |
| React fundamentals      | React Todo                         |
| Next.js / SSR           | Blog, Expense, Chatbot, Dashboard  |
| Database / ORM          | Blog, Expense                      |
| REST API design         | URL Shortener, Auth Demo           |
| WebSockets / Real-time  | Realtime Chat, Whiteboard          |
| Authentication          | JWT Auth Demo                      |
| AI / LLM integration    | AI Chatbot                         |
| Canvas / Drawing        | Whiteboard                         |
| CI/CD                   | All projects (GitHub Actions)      |
| Deployment              | GitHub Pages, Vercel, Render       |

---

## 🚀 How Each Day Works

1. **Morning:** Tell me which project to build today (or just say "today's project")
2. **I build it:** Complete code, README, LICENSE, CI workflow, .gitignore
3. **I push it:** Create repo, push code, enable Pages/CI
4. **I report back:** Repo URL + live demo URL + screenshot
5. **You review:** Test the demo, suggest tweaks if needed
6. **Iterate:** I commit fixes as separate commits (shows real development on GitHub)

---

## 💡 Pro Tips for Maximum Portfolio Impact

1. **Commit daily** — green squares matter; even small commits count
2. **Write good commit messages** — `feat: add weather search` beats `update`
3. **Star your own repos** so they appear in your stars tab
4. **Add topics/tags** to each repo (e.g., `react`, `socket-io`, `websockets`)
5. **Pin your top 6 repos** to your profile
6. **Update your profile README** weekly to link the latest projects
7. **Write a short LinkedIn post** when you ship each project — recruiters notice
8. **Don't skip the README** — recruiters read READMEs more than code
