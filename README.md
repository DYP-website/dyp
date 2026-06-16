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
