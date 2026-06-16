# DYP World Cup 2026 — Free Edition v26

## What works immediately

- Light Apple-style World Cup theme
- Top-right language menu
- Matchday center with pre-filled data
- Teams section with selectable teams
- Squads and group tables
- Prediction daily card
- Badges section
- Ranking section
- Analytics charts
- Admin odds section
- Firebase Auth / Firestore ready
- API connector placeholders

## Publish for free

1. Extract the ZIP.
2. Upload all files to GitHub repository root.
3. GitHub → Settings → Pages.
4. Source: Deploy from branch.
5. Branch: main.
6. Folder: /root.
7. Save.

## Firebase setup

1. Firebase → Authentication → Sign-in method.
2. Enable Email/Password.
3. Firebase → Firestore Database → Rules.
4. Paste `FIREBASE_RULES.txt`.
5. Click Publish.

## Admin account

Configured admin email:

`yogesh.bokhoree@gmail.com`

Only this email can see the Admin section.

## Free API strategy

The site works without APIs using local fallback data.

Later:
1. Create a free football API account.
2. Paste the key in `api-connectors.js`.
3. Turn `enabled` to `true`.
4. We connect the API functions to Firebase cache.

This avoids costs and prevents the website from appearing empty if APIs fail.

## v27 Corrections
- Language menu reduced to EN/ES/FR/DE/IT/PT/NL/JA and all active.
- Avatar choices now use all 48 World Cup participant flags.
- Badge collection now includes all 48 teams.
- Match scorers split into home/away scorer columns.
- Odds labels are now explicit: Home win / Draw / Away win.
- Analytics charts changed to Apple-style win/draw/loss bar charts around a median line.

## v28 Corrections
- Charts now show opponent and score under each bar.
- Result trend uses green upward win bars, grey draw bars, red downward loss bars.
- Expected path chart shows expected favorite/even/underdog state.
- Performance vs expectations now explains whether result confirmed or beat/missed expectations.
- Placeholder squads replaced with more complete realistic-style rosters for all 48 teams.

## v29 Corrections
- Top button text changed to “Publish”.
- Squad section now has clickable role tabs: Goalkeepers, Defenders, Midfielders, Forwards.
- Coach line added to each team profile.
- Data now includes structured squadSections ready for official/API roster replacement.

## v30 Mobile Responsive
- Same link works for desktop and mobile.
- Desktop layout remains unchanged.
- Mobile gets hamburger menu.
- Mobile gets fixed bottom bar: Matches / Publish / Teams / Profile.
- Cards, matchday, teams, prediction, analytics and badges adapt to one-column layout.
- Squad tabs become horizontally scrollable on phone.
- Charts are horizontally scrollable for readability on mobile.


## v31 API Config Ready

New file added:

`config.js`

Open it and replace:

`PASTE_YOUR_TOKEN_HERE`

with your football-data.org API token.

Then open the site and use browser console:

`DYP_API.testFootballData()`

If it returns match data, the API connection works.
If it shows a CORS error, we will use a free Cloudflare Worker proxy.

## v32 Logo + Private Leagues
- Top-left logo changed to one unified World Cup-style rectangular lockup.
- Navbar replaces Profile with Leagues.
- Profile section still exists lower in the page for login/account.
- New Leagues section:
  - create private league
  - choose league password
  - choose emoji logo
  - participant limit from 2 to 20
  - join by league name + password
  - internal ranking by badges
  - local fallback works immediately
  - Firestore collection `wcLeagues` prepared for online persistence

## v33 Points + Public Profiles
Scoring model:
- +1 DYP Point for each correct match prediction.
- +3 extra DYP Points when a new national badge is unlocked.
- Example: first correct France win = 1 + 3 = 4 points.
- Second correct France win = 1 point only, because the France badge is already owned.
- Draw prediction unlocks both national badges if not already owned.
- Global ranking and private league ranking are based on DYP Points.
- Public profile viewer added: users can click a player and inspect earned badges.


## v34 Ready To Deploy
Final pre-live adjustments:
- Top-left logo kept as one rectangular lockup, but tuned to a World Cup 2026-inspired navy/blue/green style.
- Top-right button now says only “Publish”.
- `config.js` is ready: paste your football-data.org API token where it says `PASTE_YOUR_TOKEN_HERE`.

## v35 Rules + Scorers
- Logo refined again: modern rounded rectangle with football icon, no broken rainbow underline.
- Added Rules section.
- User-facing copy changed from “schedina” to “card/scheda”.
- Each match card now supports “Add scorer”.
- Scorer picker shows both teams and role tabs: Goalkeepers, Defenders, Midfielders, Forwards.
- Scoring model now includes:
  - +1 for correct result
  - +3 for new national badge
  - +5 for correct scorer
  - scorer badges at 1, 5, 10, 20 correct scorers
- Published cards now store selected scorer per match.
- Final automatic settlement will compare stored picks with API/final match scorers.

## v36 Logo + Full i18n foundation
- Logo updated: no football icon, vivid World Cup-inspired gradient, no broken underline.
- Default language set to Italian.
- Supported languages: IT, EN, ES, FR, DE, PT, NL, JA.
- Main navigation, hero, key section titles and core copy now use data-i18n translation keys.
- Translation system now applies all marked interface text and stores language in localStorage.
- Next step: progressively mark every remaining microcopy/button/message with data-i18n keys.

## v37 Live Card Status
- Rankings update after the full matchday is complete, not during live matches.
- Added global card live status area.
- Added private league card live status area, separated from global ranking.
- Live card rows show:
  - scheduled / live / finished status
  - selected 1/X/2 prediction
  - current/final score
  - selected scorer
  - green when correct, red when wrong, blue when live/pending
- Added preview buttons for local testing before Firebase/API settlement.
- Published cards now include `settlementStatus: pending_matchday_completion`.

## v38 Live API Bridge
- Added football-data.org live API bridge.
- If `config.js` contains a valid token, the site attempts to load:
  - World Cup matches
  - teams
  - standings endpoint prepared
- If API fails, fallback/demo data remains visible.
- Added Matchday API status chip.
- Added Refresh live data button.
- Console test still available:
  `DYP_API.testFootballData()`

Important:
If direct browser API calls hit CORS or expose the token publicly, next step is a free Cloudflare Worker proxy.
