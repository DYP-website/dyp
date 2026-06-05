# DYP Free Firebase Setup

This version is ready for free Firebase integration.

## Included
- Email/password registration
- Login/logout
- Firestore user saving
- Firestore portfolio saving
- Demo weekly score calculation
- Leaderboard
- Admin dashboard
- Google Analytics placeholder
- Local demo fallback if Firebase is not configured

## Firebase setup

1. Go to Firebase Console:
https://console.firebase.google.com/

2. Create project:
DYP

3. Enable Authentication:
Build → Authentication → Sign-in method → Email/Password → Enable

4. Create Firestore:
Build → Firestore Database → Create database → Start in test mode

5. Get web app config:
Project settings → General → Your apps → Web app

6. Edit firebase-config.js:
Set enabled: true and paste your config.

7. Upload all files to GitHub.
GitHub Pages will redeploy automatically.

## Check registrations

Firebase Console → Authentication → Users

## Check saved portfolios

Firebase Console → Firestore Database → portfolios
