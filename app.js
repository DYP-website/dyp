import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, getDocs, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const brands = [
  { name: "Nike", badge: "N", sector: "Sportswear", momentum: 12.4 },
  { name: "Adidas", badge: "AD", sector: "Sportswear", momentum: -4.2 },
  { name: "Apple", badge: "A", sector: "Tech", momentum: 8.7 },
  { name: "Samsung", badge: "S", sector: "Tech", momentum: 3.1 },
  { name: "Netflix", badge: "N", sector: "Entertainment", momentum: 10.2 },
  { name: "Disney", badge: "D", sector: "Entertainment", momentum: -2.8 },
  { name: "Tesla", badge: "T", sector: "Automotive", momentum: 7.2 },
  { name: "BYD", badge: "BYD", sector: "Automotive", momentum: -6.3 },
  { name: "Red Bull", badge: "RB", sector: "Beverage", momentum: 10.1 },
  { name: "Coca-Cola", badge: "CC", sector: "Beverage", momentum: 4.6 },
  { name: "Pepsi", badge: "P", sector: "Beverage", momentum: 1.8 },
  { name: "Ferrari", badge: "F", sector: "Luxury / Auto", momentum: 5.8 },
  { name: "Porsche", badge: "PR", sector: "Automotive", momentum: 4.4 },
  { name: "NVIDIA", badge: "NV", sector: "Tech", momentum: 9.7 },
  { name: "Spotify", badge: "SP", sector: "Entertainment", momentum: 4.9 }
];

let firebaseReady = false;
let auth = null;
let db = null;
let currentUser = null;
let currentProfile = null;
const DEMO_KEY = "dyp_v17_demo_state";

function demoState() { try { return JSON.parse(localStorage.getItem(DEMO_KEY)) || { users: [], portfolios: [] }; } catch { return { users: [], portfolios: [] }; } }
function saveDemo(state) { localStorage.setItem(DEMO_KEY, JSON.stringify(state)); }
function scrollToSection(id) { const el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: "smooth" }); }
window.scrollToSection = scrollToSection;
window.goToPublish = () => scrollToSection("portfolio");
function message(id, text, color = "#81ffb0") { const el = document.getElementById(id); if (el) { el.textContent = text; el.style.color = color; } }
function getInput(id) { const el = document.getElementById(id); return el ? el.value.trim() : ""; }
function getPassword() { const el = document.getElementById("passwordInput"); return el ? el.value : ""; }
function cleanUsername(value) { return (value || "marketeye").trim().replace("@", "") || "marketeye"; }
function setText(id, value) { const el = document.getElementById(id); if (el) el.textContent = value; }

function updateBackendStatus() {
  const status = firebaseReady ? (currentUser ? "Online" : "Firebase") : "Demo";
  setText("firebaseStatus", status);
  setText("adminBackend", status);
}

function readableFirebaseError(error) {
  const code = error && error.code ? error.code : "";
  if (code.includes("permission-denied")) return "Firestore rules are blocking the request. Paste the rules from FIREBASE_RULES.txt.";
  if (code.includes("email-already-in-use")) return "This email is already registered. Use Login.";
  if (code.includes("invalid-email")) return "Invalid email.";
  if (code.includes("weak-password")) return "Password too weak. Use at least 8 characters.";
  if (code.includes("wrong-password") || code.includes("invalid-credential")) return "Wrong email or password.";
  return error.message || "Unexpected error.";
}

function initFirebase() {
  try {
    if (window.DYP_FIREBASE && window.DYP_FIREBASE.enabled) {
      const app = initializeApp(window.DYP_FIREBASE.firebaseConfig);
      auth = getAuth(app);
      db = getFirestore(app);
      firebaseReady = true;
      onAuthStateChanged(auth, async user => {
        currentUser = user;
        if (user) {
          const snap = await getDoc(doc(db, "users", user.uid));
          currentProfile = snap.exists() ? snap.data() : null;
        } else currentProfile = null;
        await refreshAll();
      });
    }
  } catch (error) { console.error("Firebase failed:", error); firebaseReady = false; }
}

window.previewUsername = function() {
  const username = cleanUsername(getInput("usernameInput"));
  setText("signupUsernamePreview", "@" + username);
  if (!currentProfile) setText("profileUsername", "@" + username);
};

window.createAccount = async function() {
  const username = cleanUsername(getInput("usernameInput"));
  const email = getInput("emailInput");
  const password = getPassword();
  if (!username || !email || password.length < 8) { message("authMessage", "Insert username, valid email and password of at least 8 characters.", "#ff6767"); return; }
  if (!firebaseReady) {
    const state = demoState();
    currentProfile = { uid: "demo_" + Date.now(), username, email, rating: 500, title: "Observer", publishedPortfolios: 0, bestScore: 0, createdAt: new Date().toISOString() };
    state.users.push(currentProfile); saveDemo(state);
    message("authMessage", "Demo profile created. Firebase is not active.", "#ffd166"); await refreshAll(); scrollToSection("profile"); return;
  }
  try {
    const credentials = await createUserWithEmailAndPassword(auth, email, password);
    currentUser = credentials.user;
    currentProfile = { uid: currentUser.uid, username, email, rating: 500, title: "Observer", publishedPortfolios: 0, bestScore: 0, createdAt: serverTimestamp() };
    await setDoc(doc(db, "users", currentUser.uid), currentProfile);
    message("authMessage", "Profile created online. Starting rating: 500."); await refreshAll(); scrollToSection("profile");
  } catch (error) { console.error(error); message("authMessage", readableFirebaseError(error), "#ff6767"); }
};

window.loginAccount = async function() {
  if (!firebaseReady) { message("authMessage", "Login requires Firebase. Demo mode is active.", "#ffd166"); return; }
  try {
    const credentials = await signInWithEmailAndPassword(auth, getInput("emailInput"), getPassword());
    currentUser = credentials.user;
    const snap = await getDoc(doc(db, "users", currentUser.uid));
    currentProfile = snap.exists() ? snap.data() : null;
    message("authMessage", "Logged in."); await refreshAll(); scrollToSection("profile");
  } catch (error) { console.error(error); message("authMessage", readableFirebaseError(error), "#ff6767"); }
};

window.logoutAccount = async function() {
  if (firebaseReady && auth) await signOut(auth);
  currentUser = null; currentProfile = null;
  message("authMessage", "Logged out.", "#ffd166"); await refreshAll();
};

function renderMarket() {
  const grid = document.getElementById("marketGrid"); if (!grid) return;
  grid.innerHTML = brands.map(b => `<article class="brand-card"><div class="brand-top"><div class="brand-id"><div class="brand-badge">${b.badge}</div><div><div class="brand-name">${b.name}</div><div class="brand-sector">${b.sector}</div></div></div><div class="brand-score"><strong>${b.momentum >= 0 ? "+" : ""}${b.momentum}%</strong><div class="${b.momentum >= 0 ? "positive" : "negative"}">Momentum</div></div></div></article>`).join("");
}
function renderAllocations() {
  const box = document.getElementById("allocationList"); if (!box) return;
  box.innerHTML = brands.slice(0, 10).map(b => `<div class="allocation-row"><div class="brand-id"><div class="brand-badge">${b.badge}</div><div><div class="brand-name">${b.name}</div><div class="brand-sector ${b.momentum >= 0 ? "positive" : "negative"}">${b.momentum >= 0 ? "+" : ""}${b.momentum}% Week 01 momentum</div></div></div><input type="number" min="0" max="100" value="0" data-brand="${b.name}" oninput="updateAllocationTotal()" /></div>`).join("");
}
window.updateAllocationTotal = function() {
  const total = getAllocations().total; const el = document.getElementById("allocationTotal");
  if (el) { el.textContent = total; el.style.color = total === 100 ? "#81ffb0" : total > 100 ? "#ff6767" : "#ffd166"; }
};
function getAllocations() { let total = 0; const allocations = []; document.querySelectorAll("#allocationList input").forEach(input => { const points = Math.max(0, Number(input.value) || 0); total += points; if (points > 0) allocations.push({ brand: input.dataset.brand, points }); }); return { total, allocations }; }
function computeScore(allocations) { const map = Object.fromEntries(brands.map(b => [b.name, b.momentum])); return Math.round(allocations.reduce((sum, item) => sum + item.points * (map[item.brand] || 0), 0)); }
function titleFromRating(rating) { if (rating >= 2000) return "DYP Legend"; if (rating >= 1500) return "Market Oracle"; if (rating >= 1000) return "Momentum Hunter"; if (rating >= 700) return "Trend Spotter"; return "Observer"; }

window.publishPortfolio = async function() {
  const { total, allocations } = getAllocations();
  if (total !== 100) { message("publishMessage", "You must allocate exactly 100 points before publishing.", "#ff6767"); return; }
  if (firebaseReady && !currentUser) { message("publishMessage", "Create an account or login before publishing.", "#ff6767"); scrollToSection("signup"); return; }
  if (!currentProfile) currentProfile = { uid: "demo_guest", username: cleanUsername(getInput("usernameInput") || "guest"), email: "", rating: 500, title: "Observer", publishedPortfolios: 0, bestScore: 0 };
  const weeklyScore = computeScore(allocations); const ratingGain = Math.round(weeklyScore / 25); const newRating = Math.max(0, (currentProfile.rating || 500) + ratingGain);
  const portfolio = { userId: firebaseReady ? currentUser.uid : currentProfile.uid, username: currentProfile.username, week: "2026-W02", allocations, weeklyScore, ratingGain, createdAt: firebaseReady ? serverTimestamp() : new Date().toISOString() };
  try {
    if (firebaseReady) {
      await addDoc(collection(db, "portfolios"), portfolio);
      currentProfile = { ...currentProfile, rating: newRating, title: titleFromRating(newRating), publishedPortfolios: (currentProfile.publishedPortfolios || 0) + 1, bestScore: Math.max(currentProfile.bestScore || 0, weeklyScore) };
      await setDoc(doc(db, "users", currentUser.uid), currentProfile, { merge: true });
    } else {
      const state = demoState(); state.portfolios.push(portfolio); const idx = state.users.findIndex(u => u.uid === currentProfile.uid);
      currentProfile = { ...currentProfile, rating: newRating, title: titleFromRating(newRating), publishedPortfolios: (currentProfile.publishedPortfolios || 0) + 1, bestScore: Math.max(currentProfile.bestScore || 0, weeklyScore) };
      if (idx >= 0) state.users[idx] = currentProfile; else state.users.push(currentProfile); saveDemo(state);
    }
    localStorage.setItem("dyp_published", "true"); message("publishMessage", `Portfolio published. Weekly score: ${weeklyScore}. Rating change: ${ratingGain >= 0 ? "+" : ""}${ratingGain}.`); await refreshAll(); scrollToSection("profile");
  } catch (error) { console.error(error); message("publishMessage", readableFirebaseError(error), "#ff6767"); }
};

async function allData() {
  if (firebaseReady) {
    try { const usersSnap = await getDocs(collection(db, "users")); const portfoliosSnap = await getDocs(collection(db, "portfolios")); return { users: usersSnap.docs.map(d => d.data()), portfolios: portfoliosSnap.docs.map(d => d.data()) }; }
    catch (error) { console.error(error); return demoState(); }
  }
  return demoState();
}
function renderProfile() { const p = currentProfile; const username = p?.username || cleanUsername(getInput("usernameInput")); setText("profileUsername", "@" + username); setText("profileRating", p?.rating || 500); setText("profileTitle", p?.title || "Observer"); setText("profilePublished", p?.publishedPortfolios || 0); setText("profileBestScore", p?.bestScore || 0); setText("previewPortfolios", p?.publishedPortfolios || 0); setText("profileSubtitle", `${p?.title || "Observer"} · publish portfolios to build your reputation`); }
async function renderAdmin() { const { users, portfolios } = await allData(); setText("adminUsers", users.length); setText("adminPortfolios", portfolios.length); const brandPoints = {}; portfolios.forEach(p => (p.allocations || []).forEach(a => brandPoints[a.brand] = (brandPoints[a.brand] || 0) + a.points)); const topBrand = Object.entries(brandPoints).sort((a,b) => b[1] - a[1])[0]; setText("adminTopBrand", topBrand ? topBrand[0] : "-"); const list = document.getElementById("adminUsersList"); if (list) list.innerHTML = users.length ? [...users].sort((a,b) => (b.rating || 500) - (a.rating || 500)).slice(0,8).map(u => `<div class="admin-user-row"><strong>@${u.username || "-"}</strong><span>${u.email || "-"}</span><span>${u.rating || 500}</span></div>`).join("") : `<p class="muted">No users yet.</p>`; }
async function renderLeaderboard() { const board = document.getElementById("leaderboardBoard"); if (!board) return; const { users } = await allData(); const sorted = [...users].sort((a,b) => (b.rating || 500) - (a.rating || 500)).slice(0, 10); if (!sorted.length) { board.innerHTML = `<div class="rank-row head"><span>#</span><span>Player</span><span>Title</span><span>Rating</span></div><div class="rank-row"><span>01</span><span>@marketeye</span><span>Observer</span><strong>500</strong></div>`; return; } board.innerHTML = `<div class="rank-row head"><span>#</span><span>Player</span><span>Title</span><span>Rating</span></div>` + sorted.map((u,i) => `<div class="rank-row"><span>${String(i+1).padStart(2,"0")}</span><span>@${u.username || "-"}</span><span>${u.title || "Observer"}</span><strong>${u.rating || 500}</strong></div>`).join(""); }
async function renderLatestPortfolio() { const box = document.getElementById("latestPortfolio"); if (!box) return; const { portfolios } = await allData(); const mine = portfolios.filter(p => p.username === currentProfile?.username).slice(-1)[0]; if (!mine) { box.innerHTML = `<p class="muted">No portfolio published yet.</p>`; return; } box.innerHTML = `<p class="muted">Week: ${mine.week} · Score: ${mine.weeklyScore}</p>` + (mine.allocations || []).map(a => `<div class="latest-allocation"><span>${a.brand}</span><strong>${a.points} pts</strong></div>`).join(""); }
async function refreshAll() { updateBackendStatus(); window.previewUsername(); renderProfile(); await renderAdmin(); await renderLeaderboard(); await renderLatestPortfolio(); }
function initGA() { const id = window.DYP_GA_MEASUREMENT_ID; if (!id) return; const s = document.createElement("script"); s.async = true; s.src = `https://www.googletagmanager.com/gtag/js?id=${id}`; document.head.appendChild(s); window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} window.gtag = gtag; gtag("js", new Date()); gtag("config", id); }

renderMarket(); renderAllocations(); initFirebase(); initGA();
document.addEventListener("DOMContentLoaded", async () => { renderMarket(); renderAllocations(); await refreshAll(); });
setTimeout(refreshAll, 500);
