import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  getDocs,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

/* Firebase layer for v14 stable layout.
   Admin dashboard is private and visible only to window.DYP_ADMIN_EMAIL. */

const DYP_BRANDS_FIREBASE = [
  { name: "Red Bull", change: 10.1 },
  { name: "Nike", change: 12.4 },
  { name: "Ferrari", change: 5.8 },
  { name: "Apple", change: 8.7 },
  { name: "Prada", change: 4.2 },
  { name: "Adidas", change: -4.2 },
  { name: "Coca-Cola", change: 4.6 },
  { name: "Pepsi", change: 1.8 },
  { name: "Heineken", change: -1.2 },
  { name: "Puma", change: 6.2 },
  { name: "New Balance", change: 5.1 },
  { name: "Samsung", change: 3.1 },
  { name: "NVIDIA", change: 9.7 },
  { name: "Sony", change: 2.1 },
  { name: "Tesla", change: 7.2 },
  { name: "BMW", change: 1.4 },
  { name: "Mercedes-Benz", change: 2.3 },
  { name: "Porsche", change: 4.4 },
  { name: "Gucci", change: 3.7 },
  { name: "Louis Vuitton", change: 6.9 },
  { name: "Starbucks", change: -0.8 },
  { name: "McDonald's", change: 5.6 },
  { name: "Netflix", change: 10.2 },
  { name: "Spotify", change: 4.9 },
  { name: "Disney", change: -2.8 },
  { name: "Prime Video", change: 1.9 },
  { name: "Sephora", change: 5.3 },
  { name: "L'Oréal", change: 3.4 },
  { name: "Dyson", change: 6.1 }
];

let app = null;
let auth = null;
let db = null;
let firebaseReady = false;
let currentUser = null;
let currentProfile = null;

const DEMO_KEY = "dyp_v14_firebase_demo_private_admin";

function $(id) { return document.getElementById(id); }

function isAdmin() {
  return !!(currentUser && currentUser.email && currentUser.email.toLowerCase() === (window.DYP_ADMIN_EMAIL || "").toLowerCase());
}

function demoState() {
  try { return JSON.parse(localStorage.getItem(DEMO_KEY)) || { users: [], portfolios: [] }; }
  catch { return { users: [], portfolios: [] }; }
}

function saveDemo(s) { localStorage.setItem(DEMO_KEY, JSON.stringify(s)); }

function cleanUsername(value) {
  return (value || "").trim().replace(/^@/, "") || "marketeye";
}

function getUsername() { return cleanUsername($("usernameInput")?.value); }
function getEmail() { return $("emailInput") ? $("emailInput").value.trim() : ""; }
function getPassword() { return $("passwordInput") ? $("passwordInput").value : ""; }

function msg(id, text, color = "#81ffb0") {
  const el = $(id);
  if (!el) return;
  el.textContent = text;
  el.style.color = color;
}

function readableError(error) {
  const code = error?.code || "";
  if (code.includes("permission-denied")) return "Missing or insufficient permissions. Publish the updated FIREBASE_RULES_PRIVATE_ADMIN.txt.";
  if (code.includes("email-already-in-use")) return "Email already registered. Use Login.";
  if (code.includes("invalid-email")) return "Invalid email.";
  if (code.includes("weak-password")) return "Password too weak. Use at least 8 characters.";
  if (code.includes("invalid-credential") || code.includes("wrong-password")) return "Wrong email or password.";
  return error?.message || "Unexpected error.";
}

function titleFromRating(r) {
  if (r >= 2000) return "DYP Legend";
  if (r >= 1500) return "Market Oracle";
  if (r >= 1000) return "Momentum Hunter";
  if (r >= 700) return "Trend Spotter";
  return "Observer";
}

function initFirebase() {
  try {
    if (window.DYP_FIREBASE?.enabled) {
      app = initializeApp(window.DYP_FIREBASE.firebaseConfig);
      auth = getAuth(app);
      db = getFirestore(app);
      firebaseReady = true;

      onAuthStateChanged(auth, async (user) => {
        currentUser = user;
        if (user) {
          const snap = await getDoc(doc(db, "users", user.uid));
          currentProfile = snap.exists() ? snap.data() : null;
        } else {
          currentProfile = null;
        }
        await refreshFirebaseUI();
      });
    }
  } catch (err) {
    console.error("Firebase init failed:", err);
    firebaseReady = false;
  }
}

window.updateProfilePreview = function updateProfilePreview() {
  const username = getUsername();
  const signupPreview = $("signupPreviewUsername");
  const profileUsername = $("profileUsername");
  if (signupPreview) signupPreview.textContent = "@" + username;
  if (profileUsername && !currentProfile) profileUsername.textContent = "@" + username;
};

window.createProfile = async function createProfile() {
  const username = getUsername();
  const email = getEmail();
  const password = getPassword();

  if (!username || !email || password.length < 8) {
    msg("profileMessage", "Insert username, valid email and password of at least 8 characters.", "#ff7272");
    return;
  }

  try {
    if (firebaseReady) {
      const credentials = await createUserWithEmailAndPassword(auth, email, password);
      currentUser = credentials.user;

      currentProfile = {
        uid: currentUser.uid,
        username,
        email,
        rating: 500,
        title: "Observer",
        publishedPortfolios: 0,
        bestScore: 0,
        streak: 0,
        role: isAdmin() ? "admin" : "user",
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp()
      };

      await setDoc(doc(db, "users", currentUser.uid), currentProfile);

      // Public profile for leaderboard only: no email.
      await setDoc(doc(db, "publicProfiles", currentUser.uid), {
        uid: currentUser.uid,
        username,
        rating: 500,
        title: "Observer",
        publishedPortfolios: 0,
        updatedAt: serverTimestamp()
      });

      // Private admin event log.
      await addDoc(collection(db, "events"), {
        type: "signup",
        userId: currentUser.uid,
        username,
        email,
        createdAt: serverTimestamp()
      });

      msg("profileMessage", "Profile created online. Starting rating: 500.");
    } else {
      const state = demoState();
      currentProfile = {
        uid: "demo_" + Date.now(),
        username,
        email,
        rating: 500,
        title: "Observer",
        publishedPortfolios: 0,
        bestScore: 0,
        streak: 0,
        role: "user",
        createdAt: new Date().toISOString()
      };
      state.users.push(currentProfile);
      saveDemo(state);
      msg("profileMessage", "Demo profile created. Firebase is not active.", "#ffd166");
    }

    await refreshFirebaseUI();
    scrollToSectionSafe("profile");
  } catch (err) {
    console.error(err);
    msg("profileMessage", readableError(err), "#ff7272");
  }
};

window.loginProfile = async function loginProfile() {
  if (!firebaseReady) {
    msg("profileMessage", "Login requires Firebase. Demo mode is active.", "#ffd166");
    return;
  }

  try {
    const credentials = await signInWithEmailAndPassword(auth, getEmail(), getPassword());
    currentUser = credentials.user;

    const snap = await getDoc(doc(db, "users", currentUser.uid));
    currentProfile = snap.exists() ? snap.data() : null;

    if (currentProfile) {
      await setDoc(doc(db, "users", currentUser.uid), {
        lastLoginAt: serverTimestamp(),
        role: isAdmin() ? "admin" : (currentProfile.role || "user")
      }, { merge: true });
    }

    await addDoc(collection(db, "events"), {
      type: "login",
      userId: currentUser.uid,
      username: currentProfile?.username || "",
      email: currentUser.email,
      createdAt: serverTimestamp()
    });

    msg("profileMessage", isAdmin() ? "Admin login successful." : "Logged in.");
    await refreshFirebaseUI();
    scrollToSectionSafe(isAdmin() ? "admin" : "profile");
  } catch (err) {
    console.error(err);
    msg("profileMessage", readableError(err), "#ff7272");
  }
};

window.logoutProfile = async function logoutProfile() {
  if (firebaseReady && auth) await signOut(auth);
  currentUser = null;
  currentProfile = null;
  msg("profileMessage", "Logged out.", "#ffd166");
  await refreshFirebaseUI();
};

window.openAdminPanel = function openAdminPanel() {
  if (!isAdmin()) return;
  scrollToSectionSafe("admin");
};

function scrollToSectionSafe(id) {
  const el = $(id);
  if (el) el.scrollIntoView({ behavior: "smooth" });
}

window.scrollToSection = window.scrollToSection || scrollToSectionSafe;

function getAllocations() {
  let total = 0;
  const allocations = [];
  document.querySelectorAll("#allocationList input").forEach(input => {
    const points = Math.max(0, Number(input.value) || 0);
    total += points;
    if (points > 0) allocations.push({ brand: input.dataset.brand, points });
  });
  return { total, allocations };
}

function score(allocations) {
  const momentum = Object.fromEntries(DYP_BRANDS_FIREBASE.map(b => [b.name, b.change]));
  return Math.round(allocations.reduce((sum, a) => sum + a.points * (momentum[a.brand] || 0), 0));
}

window.publishPortfolio = async function publishPortfolio() {
  const { total, allocations } = getAllocations();

  if (total !== 100) {
    msg("publishMessage", "Allocate exactly 100 points before publishing.", "#ff7272");
    return;
  }

  if (firebaseReady && !currentUser) {
    msg("publishMessage", "Create an account or login before publishing.", "#ff7272");
    scrollToSectionSafe("signup");
    return;
  }

  if (!currentProfile) {
    currentProfile = {
      uid: "demo_guest",
      username: getUsername() || "guest",
      email: "",
      rating: 500,
      title: "Observer",
      publishedPortfolios: 0,
      bestScore: 0,
      streak: 0,
      role: "user"
    };
  }

  const weeklyScore = score(allocations);
  const ratingGain = Math.round(weeklyScore / 25);
  const newRating = Math.max(0, (currentProfile.rating || 500) + ratingGain);
  const newTitle = titleFromRating(newRating);
  const newPublished = (currentProfile.publishedPortfolios || 0) + 1;
  const newBest = Math.max(currentProfile.bestScore || 0, weeklyScore);

  const portfolio = {
    userId: firebaseReady ? currentUser.uid : currentProfile.uid,
    username: currentProfile.username,
    week: "2026-W02",
    allocations,
    total,
    weeklyScore,
    ratingGain,
    createdAt: firebaseReady ? serverTimestamp() : new Date().toISOString()
  };

  try {
    if (firebaseReady) {
      await addDoc(collection(db, "portfolios"), portfolio);

      currentProfile = {
        ...currentProfile,
        rating: newRating,
        title: newTitle,
        publishedPortfolios: newPublished,
        bestScore: newBest
      };

      await setDoc(doc(db, "users", currentUser.uid), currentProfile, { merge: true });

      // Update public leaderboard data only.
      await setDoc(doc(db, "publicProfiles", currentUser.uid), {
        uid: currentUser.uid,
        username: currentProfile.username,
        rating: newRating,
        title: newTitle,
        publishedPortfolios: newPublished,
        updatedAt: serverTimestamp()
      }, { merge: true });

      await addDoc(collection(db, "events"), {
        type: "publish_portfolio",
        userId: currentUser.uid,
        username: currentProfile.username,
        email: currentUser.email,
        weeklyScore,
        ratingGain,
        createdAt: serverTimestamp()
      });
    } else {
      const state = demoState();
      state.portfolios.push(portfolio);
      currentProfile = {
        ...currentProfile,
        rating: newRating,
        title: newTitle,
        publishedPortfolios: newPublished,
        bestScore: newBest
      };
      const idx = state.users.findIndex(u => u.uid === currentProfile.uid);
      if (idx >= 0) state.users[idx] = currentProfile;
      else state.users.push(currentProfile);
      saveDemo(state);
    }

    localStorage.setItem("dyp_published", "true");
    msg("publishMessage", `Portfolio published. Weekly score: ${weeklyScore}. Rating: ${ratingGain >= 0 ? "+" : ""}${ratingGain}.`);
    await refreshFirebaseUI();
    scrollToSectionSafe("profile");
  } catch (err) {
    console.error(err);
    msg("publishMessage", readableError(err), "#ff7272");
  }
};

async function privateAdminData() {
  if (!firebaseReady || !isAdmin()) return { users: [], portfolios: [], events: [] };

  const usersSnap = await getDocs(collection(db, "users"));
  const portfoliosSnap = await getDocs(collection(db, "portfolios"));
  const eventsSnap = await getDocs(collection(db, "events"));

  return {
    users: usersSnap.docs.map(d => d.data()),
    portfolios: portfoliosSnap.docs.map(d => d.data()),
    events: eventsSnap.docs.map(d => d.data())
  };
}

async function publicLeaderboardData() {
  if (!firebaseReady) return demoState().users;
  try {
    const snap = await getDocs(collection(db, "publicProfiles"));
    return snap.docs.map(d => d.data());
  } catch (err) {
    console.error(err);
    return [];
  }
}

function renderProfileFirebase() {
  const p = currentProfile;
  const username = p?.username || getUsername() || "marketeye";

  if ($("profileUsername")) $("profileUsername").textContent = "@" + username;
  if ($("profileSubtitle")) $("profileSubtitle").textContent = `${p?.title || "Observer"} · build your reputation by publishing portfolios`;
  if ($("profileRating")) $("profileRating").textContent = p?.rating || 500;
  if ($("profileTitle")) $("profileTitle").textContent = p?.title || "Observer";
  if ($("profilePublished")) $("profilePublished").textContent = p?.publishedPortfolios || 0;
  if ($("profileStreak")) $("profileStreak").textContent = (p?.streak || 0) + " weeks";
  if ($("profileBestScore")) $("profileBestScore").textContent = p?.bestScore || 0;
  if ($("previewPortfolios")) $("previewPortfolios").textContent = p?.publishedPortfolios || 0;
}

async function renderAdminFirebase() {
  const adminSection = document.querySelector(".admin-private-section");
  const adminButton = $("adminAccessButton");

  if (adminSection) adminSection.classList.toggle("admin-visible", isAdmin());
  if (adminButton) adminButton.style.display = isAdmin() ? "block" : "none";

  if (!isAdmin()) return;

  const { users, portfolios, events } = await privateAdminData();

  if ($("adminUsers")) $("adminUsers").textContent = users.length;
  if ($("adminPortfolios")) $("adminPortfolios").textContent = portfolios.length;

  if ($("adminFirebase")) {
    $("adminFirebase").textContent = "Admin";
    $("adminFirebase").className = "firebase-online";
  }
  if ($("authStatus")) {
    $("authStatus").textContent = "Admin";
    $("authStatus").className = "firebase-online";
  }

  const counts = {};
  portfolios.forEach(p => (p.allocations || []).forEach(a => counts[a.brand] = (counts[a.brand] || 0) + a.points));
  const top = Object.entries(counts).sort((a,b) => b[1] - a[1])[0];
  if ($("adminTopBrand")) $("adminTopBrand").textContent = top ? top[0] : "-";

  const list = $("adminUsersList");
  if (list) {
    const sortedEvents = events.slice().reverse().slice(0, 20);
    const eventHtml = sortedEvents.length ? `
      <h3 style="margin-top:26px;">Latest events</h3>
      ${sortedEvents.map(e => `
        <div class="admin-user-row">
          <strong>${e.type || "-"}</strong>
          <span>${e.email || e.username || "-"}</span>
          <span>${e.weeklyScore ?? ""}</span>
        </div>
      `).join("")}
    ` : "";

    list.innerHTML = users.length ? `
      ${users.slice().sort((a,b) => (b.rating || 500) - (a.rating || 500)).map(u => `
        <div class="admin-user-row">
          <strong>@${u.username || "-"}</strong>
          <span>${u.email || "-"}</span>
          <span>${u.rating || 500}</span>
        </div>
      `).join("")}
      ${eventHtml}
    ` : "<p>No users yet.</p>";
  }
}

async function renderLeaderboardFirebase() {
  const board = $("leaderboardBoard");
  if (!board) return;

  const users = await publicLeaderboardData();
  const sorted = users.slice().sort((a,b) => (b.rating || 500) - (a.rating || 500)).slice(0,10);

  if (!sorted.length) return;

  board.innerHTML = `
    <div class="rank-row head"><span>#</span><span>Player</span><span>Title</span><span>Rating</span></div>
    ${sorted.map((u, idx) => `
      <div class="rank-row">
        <span>${String(idx+1).padStart(2,"0")}</span>
        <span>@${u.username || "-"}</span>
        <span>${u.title || "Observer"}</span>
        <strong>${u.rating || 500}</strong>
      </div>
    `).join("")}
  `;
}

async function refreshFirebaseUI() {
  window.updateProfilePreview();
  renderProfileFirebase();
  await renderAdminFirebase();
  await renderLeaderboardFirebase();
}

function initGA() {
  const id = window.DYP_GA_MEASUREMENT_ID;
  if (!id) return;
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  window.gtag = gtag;
  gtag("js", new Date());
  gtag("config", id);
}

document.addEventListener("DOMContentLoaded", async () => {
  initFirebase();
  initGA();
  await refreshFirebaseUI();
});

setTimeout(refreshFirebaseUI, 500);
