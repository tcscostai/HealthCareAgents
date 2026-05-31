# Healthcare AI Agent Marketplace

A single-page React marketplace showcasing **40 healthcare AI agents** from the Healthcare AI Agent Portfolio, organized by business category with an Apple-inspired UI (per `ui.md`).

## Live site

**https://tcscostai.github.io/HealthCareAgents/**

Deployed from [github.com/tcscostai/HealthCareAgents](https://github.com/tcscostai/HealthCareAgents) via GitHub Actions on every push to `main`.

### Enable GitHub Pages (one-time)

1. Open the repo **Settings → Pages**
2. Under **Build and deployment**, set **Source** to **GitHub Actions**
3. After the first workflow run completes, the site URL above will be live

## Quick start

**Important:** The project folder is named `HealthCareAgents ` (with a **trailing space**). Use quotes in Terminal:

```bash
cd "/Users/saurabhdubey/HealthCareAgents "
npm install
npm run dev
```

Or run:

```bash
"/Users/saurabhdubey/HealthCareAgents /start.sh"
```

Open the URL from the terminal output (usually **http://localhost:5173**). Do not open `index.html` directly in the browser.

If port 5173 is busy, Vite uses the next port (e.g. **5174**) — use the URL Vite prints.

## Features

- **11 category sections** — Cost Management, Population Health, Utilization, Clinical, Government Programs, Quality & Risk, Claims & Payment Integrity, FWA, Member Experience, Provider & Network, NSA/IDR
- **Collapsible categories** — expand/collapse per section or all at once
- **Agent cards** — status chips, capability tags, hover lift, click for detail dialog
- **Search** — filter agents across names, descriptions, and features
- **Portfolio hero** — stats aligned with the Excel portfolio

## Stack

- React 18 + Vite
- MUI 6 + Emotion
- Framer Motion

## Source files

| File | Purpose |
|------|---------|
| `src/pages/AgentMarketplace.jsx` | Main marketplace page |
| `src/data/agents.js` | Agent catalog from portfolio |
| `src/components/Layout.jsx` | App shell |
| `ui.md` | UI design reference |
