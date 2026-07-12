# 🚛 TransitOps — Smart Transport Operations Platform

**TransitOps** is a smart logistics, fleet telemetry tracking, and eco-friendly sustainable transport operations platform built with a modern, high-performance frontend stack. It gives fleet operators a single dashboard to monitor vehicles, track sustainability metrics, and manage transport operations in real time.

🔗 **Live Demo:** [transitops-fleet-ebon.vercel.app](https://transitops-fleet-ebon.vercel.app)

---

## 📋 Table of Contents

- [About the Project](#about-the-project)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Deployment](#deployment)
- [License](#license)

---

## 📖 About the Project

TransitOps is a single-page application (SPA) designed for logistics and fleet management teams. It combines fleet telemetry visualization, operational dashboards, and eco-friendly transport metrics into one responsive interface, with a built-in contact/inquiry flow powered by EmailJS for lead generation and support requests.

## ✨ Features

- 📊 **Fleet Telemetry Dashboards** — interactive charts and data visualizations for vehicle and operations data
- 🌱 **Sustainability Metrics** — insights into eco-friendly, low-emission transport operations
- 🧭 **Modern, Responsive UI** — mobile-first design built with Tailwind CSS
- 🧩 **Accessible UI Components** — accordions, dialogs, dropdown menus, popovers, and tabs via Radix UI primitives
- 🎞️ **Smooth Animations** — page and component transitions powered by Framer Motion
- 📧 **Contact / Inquiry Form** — serverless email delivery via EmailJS, no backend required
- ⚡ **Fast Dev & Build Pipeline** — powered by Vite 8 with instant HMR
- 🔍 **Type-Safe Codebase** — written entirely in TypeScript with strict project references
- 🧹 **Modern Linting** — Oxlint for fast, Rust-based linting

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [React 19](https://react.dev/) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Build Tool** | [Vite 8](https://vite.dev/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) (via `@tailwindcss/vite`) |
| **UI Primitives** | [Radix UI](https://www.radix-ui.com/) — Accordion, Dialog, Dropdown Menu, Popover, Tabs |
| **Animation** | [Framer Motion](https://www.framer.com/motion/) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Data Visualization** | [Recharts](https://recharts.org/) |
| **Email Service** | [EmailJS](https://www.emailjs.com/) (`@emailjs/browser`) |
| **Linting** | [Oxlint](https://oxc.rs/) |
| **Hosting / Deployment** | [Vercel](https://vercel.com/) |

## 🏗️ Architecture

TransitOps is architected as a **fully static, client-rendered SPA** — there is no custom backend server; all dynamic behavior happens in the browser or through third-party APIs.

```
┌─────────────────────────────────────────────────────────────┐
│                        Client (Browser)                      │
│                                                                │
│   ┌───────────────┐   ┌────────────────┐   ┌──────────────┐  │
│   │   React 19 UI  │   │  Radix UI +    │   │  Framer      │  │
│   │  (Components,  │   │  Tailwind CSS  │   │  Motion      │  │
│   │   Routing/     │   │   (Styling &   │   │ (Animations) │  │
│   │    Views)      │   │  Accessibility)│   │              │  │
│   └───────┬────────┘   └────────────────┘   └──────────────┘  │
│           │                                                    │
│   ┌───────▼────────┐   ┌────────────────┐                     │
│   │    Recharts     │   │  Lucide Icons  │                     │
│   │ (Fleet/telemetry│   │                │                     │
│   │   dashboards)   │   │                │                     │
│   └────────────────┘   └────────────────┘                     │
│                                                                 │
│   ┌────────────────────────────────────────────────────────┐  │
│   │              Contact / Inquiry Form Module              │  │
│   └───────────────────────┬──────────────────────────────┘   │
└───────────────────────────┼───────────────────────────────────┘
                             │  HTTPS request (client-side SDK)
                             ▼
                 ┌───────────────────────┐
                 │   EmailJS Cloud API    │
                 │ (Service/Template/Key) │
                 └───────────┬───────────┘
                             ▼
                    Recipient Inbox (Email)

  Build & Delivery:
  Vite (bundling/HMR) ──► Static assets (JS/CSS/HTML) ──► Vercel Edge/CDN
```

**Key architectural points:**
- **No custom backend / database** — the app is a static bundle served from Vercel's CDN; all "operations" data currently rendered on dashboards is handled client-side.
- **EmailJS as the only external integration** — the contact/inquiry form sends form data directly from the browser to EmailJS using a Service ID, Template ID, and Public Key, which in turn delivers an email to the configured inbox. This removes the need for a mail server.
- **Component-driven UI** — Radix UI supplies unstyled, accessible primitives (dialogs, dropdowns, tabs, accordions, popovers) that are styled with Tailwind CSS utility classes.
- **SPA routing/rewrite** — `vercel.json` rewrites all routes to `/`, so client-side routing works correctly on refresh/deep-links.
- **TypeScript project references** — `tsconfig.json` splits configuration into `tsconfig.app.json` (browser/app code) and `tsconfig.node.json` (Vite config/tooling), enabling isolated, fast type-checking.

## 📁 Project Structure

```
transitops/
├── public/                  # Static assets (favicon, icons)
│   ├── favicon.svg
│   └── icons.svg
├── src/                     # Application source (components, views, hooks)
│   └── main.tsx             # App entry point
├── index.html                # HTML entry point
├── vite.config.ts            # Vite + React + Tailwind plugin config
├── vercel.json                # Vercel SPA rewrite rules
├── tsconfig.json               # TS project references root
├── tsconfig.app.json            # TS config for app/browser code
├── tsconfig.node.json            # TS config for Vite/tooling code
├── package.json                   # Dependencies & scripts
└── .env.local                      # Environment variables (EmailJS keys)
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v20 or later recommended)
- **npm**

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/transitops.git
cd transitops

# 2. Install dependencies
npm install

# 3. Configure environment variables (see below)
cp .env.local.example .env.local

# 4. Start the development server
npm run dev
```

The app will be available at `http://localhost:5173` by default.

## 🔐 Environment Variables

Create a `.env.local` file in the project root with the following keys (used by EmailJS to send messages from the contact form):

```env
VITE_EMAILJS_SERVICE_ID=your_emailjs_service_id
VITE_EMAILJS_TEMPLATE_ID=your_emailjs_template_id
VITE_EMAILJS_PUBLIC_KEY=your_emailjs_public_key
```

> Get these values from your [EmailJS dashboard](https://dashboard.emailjs.com/) under **Email Services**, **Email Templates**, and **Account → API Keys**.

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts the Vite development server with HMR |
| `npm run build` | Type-checks (`tsc -b`) and builds the production bundle |
| `npm run lint` | Runs Oxlint across the codebase |
| `npm run preview` | Serves the production build locally for preview |

## ☁️ Deployment

TransitOps is deployed on **Vercel**. The `vercel.json` config enables clean URLs and rewrites all paths to `index.html` so client-side routing works on direct navigation and refresh:

```json
{
  "cleanUrls": true,
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

To deploy your own instance:

```bash
npm install -g vercel
vercel
```

Then add the `VITE_EMAILJS_*` environment variables in your Vercel project settings (**Project → Settings → Environment Variables**).

## 📄 License

All rights reserved © TransitOps. Unauthorized use or reproduction of this code is prohibited unless a license is explicitly granted by the project owner.

---

<p align="center">Built with ❤️ using React, TypeScript, and Vite</p>
