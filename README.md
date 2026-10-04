# jephdev — Portfolio

Personal portfolio for **jephdev** (Jephthah Eluwaokezie), a Mobile & Full-Stack developer and founder specializing in React Native, Next.js, and Node.js.

> "I don't just write code — I build products that generate real revenue."

**Live site:** [jephdev.netlify.app](https://jephdev.netlify.app)

---

## Table of Contents

- [Overview](#overview)
- [Pages](#pages)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Deployment](#deployment)
- [Configuration](#configuration)
- [Customization Guide](#customization-guide)
- [Browser Support](#browser-support)
- [Contact](#contact)

---

## Overview

This is a static, framework-free portfolio site — no build step, no bundler, no dependencies to install. Every page is plain HTML with two shared files, [`styles.css`](styles.css) and [`script.js`](script.js), handling all styling and interactivity. It's built to be opened straight in a browser or deployed as-is to any static host.

## Pages

| Page | Description |
|---|---|
| [`index.html`](index.html) | Hero, stats, tech stack marquee, services overview, selected work, testimonials |
| [`about.html`](about.html) | Bio, location, tech stack breakdown |
| [`projects.html`](projects.html) | Founder project (Connect) + live client projects — Jeloga, Stulovax, Kickgrid |
| [`services.html`](services.html) | Full service breakdown, process timeline, FAQ |
| [`contact.html`](contact.html) | Contact form + direct links (WhatsApp, email, GitHub, LinkedIn) |
| [`jeloga.html`](jeloga.html) | Full case study — Jeloga ride-sharing platform |

## Features

**Navigation**
- Floating glass navbar capsule with a cursor-reactive spotlight, a sliding highlight pill between links, and a letter-roll logo hover effect
- Full-screen overlay menu on mobile/tablet with staggered link entrance
- App-style bottom dock navigation on phones (≤ 839px), built dynamically from the menu links, with a sliding active-tab indicator that persists across page loads
- Header hides gracefully behind the mobile keyboard when a form field is focused

**Hero & motion**
- Cinematic hero entrance with a letter-by-letter name reveal and a cursor-lit background grid
- Subtle parallax that follows the pointer, with a scroll-based fade-out
- Scroll-triggered reveal animations (stats counters, section fades, staggered card grids, word/line text kinetics)
- Cursor-bloom hover effect on every button, scoped per click position
- All motion respects `prefers-reduced-motion`

**Content**
- EN / FR / ES language switching with `localStorage` persistence and animated transitions
- Click-to-play project video previews
- Accordion FAQ, animated stat counters, scroll progress bar
- Founder project card (Connect) with an autoplaying, pause-on-scroll demo video in a browser-chrome frame

**Forms & integrations**
- Contact form wired to [Formspree](https://formspree.io) with an automatic `mailto:` fallback if no form ID is configured
- WhatsApp quick-contact links throughout
- Floating WhatsApp + scroll-to-top buttons on desktop

**Engineering**
- Fully responsive, mobile-first layout
- No horizontal scroll or layout shift at any breakpoint, tested from 360px to 1920px+
- `prefers-reduced-motion` and `prefers-color-scheme` aware
- Zero build step — pure HTML/CSS/JS, deployable as static files

## Tech Stack

- **HTML5 / CSS3 / JavaScript (ES6+)** — no frameworks, no build tooling
- **Fonts:** Bebas Neue, Inter, JetBrains Mono (Google Fonts)
- **Icons:** [Bootstrap Icons](https://icons.getbootstrap.com/)
- **Forms:** [Formspree](https://formspree.io)
- **Hosting:** [Netlify](https://netlify.com)

## Project Structure

```
.
├── index.html           # Home page
├── about.html            # About page
├── projects.html         # Projects listing (founder + client work)
├── services.html         # Services, process, FAQ
├── contact.html          # Contact form + direct links
├── jeloga.html            # Jeloga case study
├── styles.css             # All styles for every page
├── script.js               # All interactivity for every page
├── netlify.toml            # Netlify build config
├── favicon.png / .svg      # Site icon
├── profile.png              # Hero / about photo
├── connect.png / connect.mp4   # Connect (founder project) screenshot + demo clip
├── jeloga.png                   # Jeloga project images
├── stulovax.png / stulovax2.png # Stulovax project images
├── kickgrid.png                  # Kickgrid project image
└── README.md
```

## Getting Started

No installation required.

**Option A — just open it**
Double-click any `.html` file, or open the folder in your browser.

**Option B — serve it locally** (recommended, avoids any `file://` quirks)
```bash
# Python
python -m http.server 8000

# Node
npx serve .
```
Then visit `http://localhost:8000`.

## Deployment

This site deploys to [Netlify](https://netlify.com) as a static site (`publish = "."` in [`netlify.toml`](netlify.toml) — the whole project folder is published as-is).

**Via Netlify CLI:**
```bash
netlify login             # first time only
netlify deploy             # draft preview
netlify deploy --prod       # publish to the live site
```

**Via GitHub:** if the Netlify site is connected to this repository, pushing to `main` triggers an automatic deploy.

> **Note:** Netlify publishes every file in this folder, `.gitignore` does not apply to it. Keep anything you don't want public (raw recordings, drafts, local notes) outside this folder before deploying.

## Configuration

**Contact form** — [`contact.html`](contact.html) posts to Formspree. Replace the placeholder with your own form ID:
```html
<form class="contact-form" id="contactForm" data-formspree-id="YOUR_FORM_ID">
```
Get a form ID at [formspree.io](https://formspree.io). Without one, the form falls back to opening the visitor's email client instead.

**Site verification** — `index.html` includes a `google-site-verification` meta tag for Google Search Console.

## Customization Guide

**Change text/translations** — every translatable string uses a `data-i18n="key"` attribute in the HTML. The English, French, and Spanish copy for every key lives in the `TRANSLATIONS` object near the top of [`script.js`](script.js).

**Add a project** — duplicate a `.work-visual-item` block in `index.html`'s "Selected Work" section and a `.project-card` block in `projects.html`, then add the project's image.

**Colors / theme** — all color tokens are CSS custom properties defined at the top of [`styles.css`](styles.css) under `:root`.

**Social / contact links** — WhatsApp number, email, GitHub, and LinkedIn URLs appear in the header, footer, and `contact.html`; update them in each file (a sitewide find-and-replace is the fastest way).

## Browser Support

Modern evergreen browsers (Chrome, Edge, Safari, Firefox — latest two versions). Built with progressive enhancement: pages remain fully usable and legible without JavaScript or with reduced-motion preferences enabled.

## Contact

- **Email:** jephcoding@gmail.com
- **WhatsApp:** +234 906 706 9213
- **GitHub:** [@jephcoded](https://github.com/jephcoded)
- **LinkedIn:** [jephdev](https://www.linkedin.com/in/jephcoding123)

---

© 2026 jephdev. All rights reserved.
