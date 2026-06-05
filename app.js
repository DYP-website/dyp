import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, getDocs, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

let firebaseReady = false, app = null, auth = null, db = null, currentUser = null, currentProfile = null;
const demoStoreKey = "dyp_demo_state_v1";

function getDemoState() {
  const raw = localStorage.getItem(demoStoreKey);
  if (raw) return JSON.parse(raw);
  return { users: [], portfolios: [] };
}
function saveDemoState(state) { localStorage.setItem(demoStoreKey, JSON.stringify(state)); }

function initFirebase() {
  try {
    if (window.DYP_FIREBASE && window.DYP_FIREBASE.enabled) {
      app = initializeApp(window.DYP_FIREBASE.firebaseConfig);
      auth = getAuth(app);
      db = getFirestore(app);
      firebaseReady = true;
      onAuthStateChanged(auth, async (user) => {
        currentUser = user;
        if (user) {
          const snap = await getDoc(doc(db, "users", user.uid));
          currentProfile = snap.exists() ? snap.data() : null;
        } else currentProfile = null;
        refreshAll();
      });
    }
  } catch (e) {
    console.error("Firebase init failed", e);
    firebaseReady = false;
  }
  refreshAll();
}

function setStatus() {
  const status = firebaseReady ? (currentUser ? "Online" : "Firebase") : "Demo";
  ["authStatus","adminFirebase"].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = status;
    el.classList.toggle("auth-online", firebaseReady);
    el.classList.toggle("auth-demo", !firebaseReady);
  });
}
function msg(text, color="#81ffb0") {
  const el = document.getElementById("profileMessage");
  if (el) { el.textContent = text; el.style.color = color; }
}
function username() {
  const input = document.getElementById("usernameInput");
  return input && input.value.trim() ? input.value.trim().replace("@","") : "";
}
function email() {
  const input = document.getElementById("emailInput");
  return input ? input.value.trim() : "";
}
function password() {
  const input = document.getElementById("passwordInput");
  return input ? input.value : "";
}

window.updateProfilePreview = function() {
  const u = username() || "marketeye";
  const a = document.getElementById("signupPreviewUsername");
  const b = document.getElementById("profileUsername");
  if (a) a.textContent = "@" + u;
  if (b) b.textContent = "@" + u;
};

window.createProfile = async function() {
  const u = username(), e = email(), p = password();
  if (!u || !e || p.length < 8) return msg("Insert username, valid email and password of at least 8 characters.", "#ff7272");

  if (firebaseReady) {
    try {
      const cred = await createUserWithEmailAndPassword(auth, e, p);
      currentUser = cred.user;
      currentProfile = { uid: cred.user.uid, username: u, email: e, rating: 500, title: "Observer", publishedPortfolios: 0, streak: 0, createdAt: serverTimestamp() };
      await setDoc(doc(db, "users", cred.user.uid), currentProfile);
      msg("Profile created online. Starting rating: 500.");
    } catch(err) { console.error(err); return msg(err.message, "#ff7272"); }
  } else {
    const state = getDemoState();
    currentProfile = { uid: "demo_" + Date.now(), username: u, email: e, rating: 500, title: "Observer", publishedPortfolios: 0, streak: 0, createdAt: new Date().toISOString() };
    state.users.push(currentProfile);
    saveDemoState(state);
    msg("Demo profile created. Configure Firebase to save real users online.", "#ffd166");
  }
  refreshAll();
  scrollToSection("profile");
};

window.loginProfile = async function() {
  if (!firebaseReady) return msg("Login requires Firebase. Demo mode is active.", "#ffd166");
  try {
    const cred = await signInWithEmailAndPassword(auth, email(), password());
    currentUser = cred.user;
    const snap = await getDoc(doc(db, "users", cred.user.uid));
    currentProfile = snap.exists() ? snap.data() : null;
    msg("Logged in.");
    refreshAll();
  } catch(err) { msg(err.message, "#ff7272"); }
};

window.logoutProfile = async function() {
  if (firebaseReady && auth) await signOut(auth);
  currentUser = null; currentProfile = null;
  msg("Logged out.", "#ffd166");
  refreshAll();
};

function allocations() {
  const inputs = document.querySelectorAll("#allocationList input");
  let total = 0, list = [];
  inputs.forEach(input => {
    const points = Number(input.value) || 0;
    total += points;
    if (points > 0) list.push({ brand: input.dataset.brand, points });
  });
  return { total, list };
}
function demoScore(list) {
  const momentum = { Nike:12.4, Adidas:-4.2, "Red Bull":10.1, Apple:8.7, Tesla:7.2, Netflix:10.2, NVIDIA:9.7, Ferrari:5.8 };
  return list.reduce((s,a)=>s+a.points*(momentum[a.brand] ?? 2),0);
}

const originalPublish = window.publishPortfolio;
window.publishPortfolio = async function() {
  const { total, list } = allocations();
  const out = document.getElementById("publishMessage");
  if (total !== 100) {
    if (out) { out.textContent = "Error: allocate exactly 100 points before publishing."; out.style.color = "#ff7272"; }
    return;
  }
  if (firebaseReady && !currentUser) {
    if (out) { out.textContent = "Create an account or login before publishing."; out.style.color = "#ff7272"; }
    scrollToSection("signup");
    return;
  }
  if (!currentProfile) currentProfile = { uid:"demo_guest", username: username() || "guest", rating:500, title:"Observer", publishedPortfolios:0, streak:0 };

  const portfolio = { userId: firebaseReady ? currentUser.uid : currentProfile.uid, username: currentProfile.username, week:"2026-W02", allocations:list, total, demoScore:demoScore(list), createdAt: firebaseReady ? serverTimestamp() : new Date().toISOString() };

  if (firebaseReady) {
    await addDoc(collection(db, "portfolios"), portfolio);
    currentProfile.publishedPortfolios = (currentProfile.publishedPortfolios || 0) + 1;
    currentProfile.rating = (currentProfile.rating || 500) + Math.round(portfolio.demoScore / 20);
    await setDoc(doc(db, "users", currentUser.uid), currentProfile, { merge:true });
  } else {
    const state = getDemoState();
    state.portfolios.push(portfolio);
    let idx = state.users.findIndex(u => u.uid === currentProfile.uid);
    if (idx === -1) { state.users.push(currentProfile); idx = state.users.length - 1; }
    state.users[idx].publishedPortfolios = (state.users[idx].publishedPortfolios || 0) + 1;
    state.users[idx].rating = (state.users[idx].rating || 500) + Math.round(portfolio.demoScore / 20);
    currentProfile = state.users[idx];
    saveDemoState(state);
  }
  localStorage.setItem("dyp_published", "true");
  if (out) { out.textContent = "Portfolio published. Your prediction is locked."; out.style.color = "#81ffb0"; }
  const footer = document.querySelector(".card-footer");
  if (footer) { footer.classList.add("published"); const s = footer.querySelector("strong"); if (s) s.textContent = "PUBLISHED"; }
  refreshAll();
};

function renderProfile() {
  const p = currentProfile;
  const u = p?.username || username() || "marketeye";
  const set = (id,val) => { const el = document.getElementById(id); if(el) el.textContent = val; };
  set("profileUsername", "@" + u);
  set("profileRating", p?.rating || 500);
  set("profileTitle", p?.title || "Observer");
  set("profilePublished", p?.publishedPortfolios || 0);
  set("profileStreak", (p?.streak || 0) + " weeks");
}

async function allData() {
  if (firebaseReady) {
    const usersSnap = await getDocs(collection(db, "users"));
    const portfoliosSnap = await getDocs(collection(db, "portfolios"));
    return { users: usersSnap.docs.map(d=>d.data()), portfolios: portfoliosSnap.docs.map(d=>d.data()) };
  }
  return getDemoState();
}

async function renderAdmin() {
  const { users, portfolios } = await allData();
  const set = (id,val) => { const el = document.getElementById(id); if(el) el.textContent = val; };
  set("adminUsers", users.length);
  set("adminPortfolios", portfolios.length);
  const counts = {};
  portfolios.forEach(p => (p.allocations||[]).forEach(a => counts[a.brand]=(counts[a.brand]||0)+a.points));
  const top = Object.entries(counts).sort((a,b)=>b[1]-a[1])[0];
  set("adminTopBrand", top ? top[0] : "-");
  const list = document.getElementById("adminUsersList");
  if (list) list.innerHTML = users.length ? users.slice(-8).reverse().map(u=>`<div class="admin-user-row"><strong>@${u.username||"-"}</strong><span>${u.email||"-"}</span><span>${u.rating||500}</span></div>`).join("") : "<p>No users yet.</p>";
}

async function renderLeaderboard() {
  const board = document.getElementById("leaderboardBoard");
  if (!board) return;
  const { users } = await allData();
  const sorted = [...users].sort((a,b)=>(b.rating||500)-(a.rating||500)).slice(0,10);
  if (!sorted.length) return;
  board.innerHTML = `<div class="rank-row head"><span>#</span><span>Player</span><span>Title</span><span>Rating</span></div>` + sorted.map((u,i)=>`<div class="rank-row"><span>${String(i+1).padStart(2,"0")}</span><span>@${u.username}</span><span>${u.title||"Observer"}</span><strong>${u.rating||500}</strong></div>`).join("");
}

function initGA() {
  const id = window.DYP_GA_MEASUREMENT_ID;
  if (!id) return;
  const s = document.createElement("script");
  s.async = true; s.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  window.gtag = gtag;
  gtag("js", new Date()); gtag("config", id);
}

function refreshAll() {
  setStatus();
  window.updateProfilePreview();
  renderProfile();
  renderAdmin();
  renderLeaderboard();
}

initFirebase();
initGA();
document.addEventListener("DOMContentLoaded", refreshAll);
setTimeout(refreshAll, 250);
