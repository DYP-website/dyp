# DYP v17 Clean Working App

Clean rebuild. No duplicated old functions, no avatars, no broken legacy code.

## Included
- Firebase Authentication
- Firestore user saving
- Firestore portfolio saving
- Demo fallback with localStorage
- Portfolio allocation: exactly 100 points
- Weekly score calculation
- Rating update
- Leaderboard
- Admin dashboard
- Google Analytics loader
- Legal brand disclaimer

## IMPORTANT: Firestore rules

If you see `Missing or insufficient permissions`, go to:

Firebase Console → Firestore Database → Rules

Paste the content of `FIREBASE_RULES.txt` and publish.

## Files to upload to GitHub

Upload all files:
- index.html
- styles.css
- app.js
- firebase-config.js
- FIREBASE_RULES.txt
- README.md

## Test flow
1. Open the website in incognito.
2. Create a profile with email/password.
3. Check Firebase → Authentication → Users.
4. Publish a portfolio with exactly 100 points.
5. Check Firebase → Firestore Database.
6. You should see collections: users and portfolios.

## Scoring MVP
Weekly Score = sum(allocation points × brand Week 01 momentum)

Rating gain = Weekly Score / 25 rounded.
