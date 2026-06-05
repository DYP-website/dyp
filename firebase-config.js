// DYP Firebase configuration
// Free setup:
// 1) Create Firebase project
// 2) Enable Authentication -> Email/Password
// 3) Create Firestore Database
// 4) Paste your web app config below
// 5) Set enabled: true

window.DYP_FIREBASE = {
  enabled: false,

  firebaseConfig: {
    apiKey: "PASTE_API_KEY_HERE",
    authDomain: "PASTE_PROJECT_ID.firebaseapp.com",
    projectId: "PASTE_PROJECT_ID",
    storageBucket: "PASTE_PROJECT_ID.appspot.com",
    messagingSenderId: "PASTE_SENDER_ID",
    appId: "PASTE_APP_ID"
  }
};

// Optional Google Analytics ID, example: "G-XXXXXXXXXX"
window.DYP_GA_MEASUREMENT_ID = "";
