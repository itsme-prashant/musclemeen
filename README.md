# MuscularMen

A mobile-first daily workout guide for a 12-week body transformation (fat loss, muscle gain, recomposition or strength), with Indian nutrition, progress tracking, anatomy demos and an optional AI coach.

## Run it

| Option | What works |
|---|---|
| **Open `index.html`** in a browser | Everything except install/offline mode, the AI coach and cloud sync |
| **Any static web server** (e.g. `python -m http.server 8765` in this folder) | + Install as an app, offline mode |
| **MuscularMen server** (`cd server && npm install && npm start`, then open http://localhost:8080) | + AI coach (needs `ANTHROPIC_API_KEY`) and accounts & cloud sync |

## Features

- **Personal 12-week program**: split by training days, emphasis by gender (overridable), reps/rest by goal, progressive overload, deloads in weeks 4, 8 and 12.
- **Smart coaching**:
  - Log effort (RPE) per set. Next-session weights adjust automatically: easy sets go up; grinders, missed reps and stalls come down. Deload weeks are ignored when judging progress.
  - Fatigue check offers an extra deload week.
  - Missed a workout? "Do it today" pushes the plan back instead of skipping it.
  - Injury-friendly mode (knee, lower back, shoulder, wrist) swaps out exercises that load that area.
  - Supersets on fat-loss and 45-minute sessions.
- **At the gym**:
  - Big rest timer with a voice coach (English/Hindi), sound, vibration and a background notification.
  - Plate calculator and warm-up sets.
  - Personal-record alerts 🏆.
  - Animations that follow your prescribed rep tempo.
- **Exercise library**: 78 exercises, each with original anatomy-style artwork:
  - an animated demo, a PNG illustration and an MP4 video
  - a muscle chart, form cues and easier/harder alternatives
- **Progress**:
  - Body weight, measurements and a US-Navy body-fat estimate.
  - Estimated-1RM charts and weekly sets per muscle (10–20 set target zone).
  - PR list, streak, calendar, and private progress photos with before/after compare.
- **Nutrition**:
  - Mifflin-St Jeor calorie/protein targets with safe floors.
  - Food log with 85 Indian foods plus your own custom foods.
  - Auto meal plans (veg / egg / non-veg) that hit your targets, and a 7-day grocery list.
- **More**:
  - AI coach (Claude) that knows your program and logs.
  - Trainer dashboard (import client backups, send program files).
  - Accounts & cloud sync, Hindi interface, installable offline app.

## Folders

```
index.html            app (HTML/CSS/JS, single page)
js/foods.js           Indian food database + meal templates
js/features.js        food log, meal plan, tools, photos, coach, trainer, account pages
sw.js, manifest.webmanifest, icons/   installable offline app
images/, videos/      generated exercise illustrations (PNG) and demos (MP4)
tools/make_media.py   regenerate images/videos (uses installed Edge/Chrome via Playwright)
server/               optional Node server: AI coach + accounts & sync
```

## Regenerate exercise media

```bash
python tools/make_media.py all            # every exercise (≈13 min)
python tools/make_media.py back-squat     # specific exercises
python tools/make_media.py --sync         # register files you added yourself
```

Drop your own clips or licensed artwork into `videos/<exercise-id>.mp4` or `images/<exercise-id>.png` and run `--sync`.

## Brand

The **Barbell M** logo is original artwork: the M's two legs are weight plates on a barbell. Files are in `brand/`:

| File | Use |
|---|---|
| `logo-horizontal.svg` / `.png` | Website header, documents, banners |
| `logo-mark.svg` (lime) / `logo-mark-dark.svg` | The mark on its own, on dark or light backgrounds |
| `logo-icon.svg`, `apple-touch-icon.png`, `icons/` | Favicon and app icons |
| `social-banner.png` (1200×630) | Link previews and social posts |

Colours: lime `#C6FF00`, near-black `#0A0C0F`, white `#F3F5F7`. Font: Barlow Condensed ExtraBold.

## Data & privacy

All data lives in the browser (localStorage; photos in IndexedDB) unless you sign in to your own MuscularMen server. Use **Profile → Export backup** to move between phones or share with a trainer.

MuscularMen gives general fitness guidance, not medical advice.
