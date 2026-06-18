const ADMIN_EMAILS = window.DYP_FIREBASE?.adminEmails || ["arvin.bokhoree@gmail.com"];
const firebaseConfig = window.DYP_FIREBASE?.firebaseConfig;
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, getDocs, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

let app, auth, db, currentUser = null, currentProfile = null;

try {
  app = initializeApp(window.DYP_FIREBASE.firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);

  onAuthStateChanged(auth, async user => {
    currentUser = user;

    if (user) {
      const ref = doc(db, "wcUsers", user.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        currentProfile = snap.data();
      } else {
        currentProfile = {
          uid: user.uid,
          username: user.displayName || user.email?.split("@")[0] || "guest",
          email: user.email,
          avatar: "captain",
          cards: 0,
          points: 0,
          correctPredictions: 0,
          scorerPredictions: 0,
          badges: [],
          scorerBadges: [],
          streak: 0,
          createdAt: serverTimestamp()
        };

        await setDoc(ref, currentProfile, { merge: true });
      }
    } else {
      currentProfile = null;
    }

    await refreshUserState();
  });
} catch (e) {
  console.warn("Firebase disabled or unavailable", e);
}

function isAdmin() {
  const email = currentUser?.email?.toLowerCase();
  return !!email && ADMIN_EMAILS.map(e => e.toLowerCase()).includes(email);
}

function selectedAvatarId() {
  const selected = document.querySelector(".avatarOption.selected");
  return selected ? "captain" : "captain";
}



async function getAllUsersSorted() {
  const snap = await getDocs(collection(db, "wcUsers")).catch(() => null);
  if (!snap) return [];
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (b.points || 0) - (a.points || 0));
}

async function getMyCards() {
  const snap = await getDocs(collection(db, "wcCards")).catch(() => null);
  if (!snap || !currentUser) return [];
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(c => c.userId === currentUser.uid)
    .sort((a, b) => String(b.createdAt?.seconds || "").localeCompare(String(a.createdAt?.seconds || "")));
}

async function getMyLeagues() {
  const snap = await getDocs(collection(db, "wcLeagues")).catch(() => null);
  if (!snap || !currentUser) return [];
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(l => (l.members || []).some(m => m.uid === currentUser.uid));
}

function renderBadgeList(targetId, badges = [], scorerBadges = []) {
  const box = document.getElementById(targetId);
  if (!box) return;
  const all = [
    ...(badges || []).map(b => ({ icon: "🏳️", name: b })),
    ...(scorerBadges || []).map(b => ({ icon: "⚽", name: b }))
  ];
  box.innerHTML = all.length
    ? all.map(b => `<div class="miniBadge"><span>${b.icon}</span><b>${b.name}</b></div>`).join("")
    : `<p class="muted">No badges yet.</p>`;
}

async function refreshProfileDashboard() {
  if (!currentUser || !currentProfile) return;

  const users = await getAllUsersSorted();
  const myIndex = users.findIndex(u => u.id === currentUser.uid || u.uid === currentUser.uid);
  const myRank = myIndex >= 0 ? myIndex + 1 : "-";
  const cards = await getMyCards();
  const leagues = await getMyLeagues();

  const pointsEl = document.getElementById("dashPoints");
  const rankEl = document.getElementById("dashGlobalRank");
  const badgesEl = document.getElementById("dashBadges");
  const cardsEl = document.getElementById("dashCards");

  if (pointsEl) pointsEl.textContent = currentProfile.points || 0;
  if (rankEl) rankEl.textContent = myRank;
  if (badgesEl) badgesEl.textContent = (currentProfile.badges || []).length + (currentProfile.scorerBadges || []).length;
  if (cardsEl) cardsEl.textContent = cards.length || currentProfile.cards || 0;

  const globalBox = document.getElementById("myGlobalRankingBox");
  if (globalBox) {
    globalBox.innerHTML = users.length
      ? users.slice(0, 10).map((u, i) => `
        <div class="miniRankRow ${u.uid === currentUser.uid || u.id === currentUser.uid ? "me" : ""}">
          <span>#${i + 1}</span>
          <strong>@${u.username || "guest"}</strong>
          <span>${u.points || 0} pts</span>
          <span>${(u.badges || []).length} badges</span>
        </div>
      `).join("")
      : `<p class="muted">No global ranking yet.</p>`;
  }

  renderBadgeList("myBadgeBox", currentProfile.badges || [], currentProfile.scorerBadges || []);

  const leaguesBox = document.getElementById("myPrivateLeaguesBox");
  if (leaguesBox) {
    leaguesBox.innerHTML = leagues.length
      ? leagues.map(l => `
        <div class="leagueItem">
          <div class="leagueIcon">${l.logo || "🏆"}</div>
          <div>
            <strong>${l.name}</strong>
            <p class="muted">${(l.members || []).length}/${l.limit || 20} participants</p>
          </div>
          <button class="secondary" onclick="DYPAuth.openLeagueDashboard('${l.id}')">Open</button>
        </div>
      `).join("")
      : `<p class="muted">You are not registered in any private league yet.</p>`;
  }
}

async function openLeagueDashboard(leagueId) {
  const snap = await getDoc(doc(db, "wcLeagues", leagueId)).catch(() => null);
  const box = document.getElementById("selectedLeagueDashboard");
  if (!snap || !snap.exists() || !box) return;

  const league = { id: snap.id, ...snap.data() };
  const members = [...(league.members || [])].sort((a, b) => (b.points || b.badges || 0) - (a.points || a.badges || 0));

  const cardsSnap = await getDocs(collection(db, "wcCards")).catch(() => null);
  const leagueCards = cardsSnap ? cardsSnap.docs.map(d => ({ id: d.id, ...d.data() }))
    .filter(c => c.leagueId === leagueId || c.leagueName === league.name)
    .slice(0, 8) : [];

  box.innerHTML = `
    <div class="leagueDashboardHead">
      <div class="leagueIcon">${league.logo || "🏆"}</div>
      <div>
        <h3>${league.name}</h3>
        <p class="muted">${members.length}/${league.limit || 20} participants · private ranking</p>
      </div>
    </div>

    <h4>League ranking</h4>
    <div class="miniTable">
      ${members.length ? members.map((m, i) => `
        <div class="miniRankRow ${m.uid === currentUser.uid ? "me" : ""}">
          <span>#${i + 1}</span>
          <strong>@${m.username || "user"}</strong>
          <span>${m.points || 0} pts</span>
          <span>${Array.isArray(m.badges) ? m.badges.length : (m.badges || 0)} badges</span>
        </div>
      `).join("") : `<p class="muted">No participants yet.</p>`}
    </div>

    <h4 style="margin-top:16px">League cards</h4>
    ${leagueCards.length ? leagueCards.map(c => `
      <div class="leagueCardMini">
        <strong>@${c.username || "guest"}</strong>
        <p class="muted">${c.matchday || "matchday"} · ${c.settlementStatus || "pending"}</p>
      </div>
    `).join("") : `<p class="muted">No cards published in this league yet.</p>`}
  `;
}


function parseETDateTimeForPublish(dateStr, timeStr){
  const clean = String(timeStr || "00:00").replace("ET","").trim();
  const hm = clean.match(/(\d{1,2}):(\d{2})/);
  const h = hm ? hm[1].padStart(2,"0") : "00";
  const m = hm ? hm[2] : "00";
  return new Date(`${dateStr}T${h}:${m}:00-04:00`);
}

function isMatchdayClosedForPublish(matchday){
  const matches = window.DYP_DATA.matches.filter(m => m.matchday === matchday);
  if(!matches.length) return false;
  const first = matches
    .map(m => parseETDateTimeForPublish(m.matchday, m.time))
    .sort((a,b) => a-b)[0];
  return new Date() >= first;
}

window.DYPAuth = {
  async refreshDashboard() {
    await refreshProfileDashboard();
  },

  async openLeagueDashboard(leagueId) {
    await openLeagueDashboard(leagueId);
  },

  async createProfile() {
    const msg = document.getElementById("authMessage");
    try {
      const username = document.getElementById("usernameInput").value.trim() || "guest";
      const email = document.getElementById("emailInput").value.trim();
      const password = document.getElementById("passwordInput").value;

      let userCredential;

      try {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      } catch (err) {
        if (err.code === "auth/email-already-in-use") {
          userCredential = await signInWithEmailAndPassword(auth, email, password);
        } else {
          throw err;
        }
      }

      currentUser = userCredential.user;
      currentProfile = {
        uid: currentUser.uid,
        username,
        email: currentUser.email,
        avatar: selectedAvatarId(),
        cards: 0,
        points: 0,
        correctPredictions: 0,
        scorerPredictions: 0,
        badges: [],
        scorerBadges: [],
        streak: 0,
        createdAt: serverTimestamp()
      };

      await setDoc(doc(db, "wcUsers", currentUser.uid), currentProfile, { merge: true });

      msg.textContent = "Profile created online.";
      msg.style.color = "#14b86a";
      await refreshUserState();
    } catch (e) {
      msg.textContent = e.message;
      msg.style.color = "#ef4444";
    }
  },

  async loginProfile() {
    const msg = document.getElementById("authMessage");
    try {
      const cred = await signInWithEmailAndPassword(
        auth,
        document.getElementById("emailInput").value.trim(),
        document.getElementById("passwordInput").value
      );

      currentUser = cred.user;
      const ref = doc(db, "wcUsers", currentUser.uid);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        currentProfile = {
          uid: currentUser.uid,
          username: document.getElementById("usernameInput").value.trim() || currentUser.email?.split("@")[0] || "guest",
          email: currentUser.email,
          avatar: selectedAvatarId(),
          cards: 0,
          points: 0,
          correctPredictions: 0,
          scorerPredictions: 0,
          badges: [],
          scorerBadges: [],
          streak: 0,
          createdAt: serverTimestamp()
        };
        await setDoc(ref, currentProfile, { merge: true });
      } else {
        currentProfile = snap.data();
      }

      msg.textContent = "Logged in.";
      msg.style.color = "#14b86a";
      await refreshUserState();
    } catch (e) {
      msg.textContent = e.message;
      msg.style.color = "#ef4444";
    }
  },

  async logoutProfile() {
    if (auth) await signOut(auth);
  },

  async publishDailyCard() {
    const msg = document.getElementById("predictionMessage");
    if (!currentUser) {
      msg.textContent = "Login before publishing your daily card.";
      msg.style.color = "#ef4444";
      return;
    }

    const matchday = document.getElementById("matchdaySelect").value;
    if (isMatchdayClosedForPublish(matchday)) {
      msg.textContent = "Publishing is closed for this matchday.";
      msg.style.color = "#ef4444";
      return;
    }
    const existing = await getDocs(collection(db, "wcCards"));
    if (existing.docs.some(d => d.data().userId === currentUser.uid && d.data().matchday === matchday)) {
      msg.textContent = "You already published a card for this matchday.";
      msg.style.color = "#ef4444";
      return;
    }

    // The card is stored first.
    // Final points are assigned when match results are settled:
    // +1 correct prediction
    // +3 extra for every newly unlocked badge
    await addDoc(collection(db, "wcCards"), {
      userId: currentUser.uid,
      email: currentUser.email,
      username: currentProfile?.username || "guest",
      matchday,
      picks: window.DYP.collectPicks(),
      scoringModel: { correctResult: 1, newTeamBadge: 3, correctScorer: 5, scorerBadgeThresholds: [1,5,10,20] },
      settlementStatus: "pending_matchday_completion",
      createdAt: serverTimestamp()
    });

    msg.textContent = "Daily card published.";
    msg.style.color = "#14b86a";
    await refreshUserState();
  }
};

window.DYPAdmin = {
  loadOdds() {
    const id = document.getElementById("adminMatchSelect").value;
    const m = window.DYP_DATA.matches.find(x => x.id === id);
    if (!m) return;
    document.getElementById("adminOddsHome").value = m.odds.home;
    document.getElementById("adminOddsDraw").value = m.odds.draw;
    document.getElementById("adminOddsAway").value = m.odds.away;
  },

  async saveOdds() {
    if (!isAdmin()) return;
    const id = document.getElementById("adminMatchSelect").value;
    const m = window.DYP_DATA.matches.find(x => x.id === id);
    if (!m) return;

    m.odds.home = Number(document.getElementById("adminOddsHome").value);
    m.odds.draw = Number(document.getElementById("adminOddsDraw").value);
    m.odds.away = Number(document.getElementById("adminOddsAway").value);

    await setDoc(doc(db, "wcOdds", id), {
      matchId: id,
      odds: m.odds,
      updatedAt: serverTimestamp()
    }, { merge: true });

    document.getElementById("adminOddsMessage").textContent = "Odds saved.";
    document.getElementById("adminOddsMessage").style.color = "#14b86a";
    window.DYP.renderMatchday();
    window.DYP.renderAnalytics();
  }
};

async function refreshUserState() {
  document.body.classList.toggle("admin", isAdmin());

  const avatar = document.getElementById("profileAvatar");
  const name = document.getElementById("profileName");
  const status = document.getElementById("profileStatus");

  if (name) name.textContent = currentProfile ? "@" + currentProfile.username : "@guest";
  if (status) status.textContent = currentUser ? currentUser.email : "Not logged in";
  if (avatar) avatar.textContent = "⚽";

  if (isAdmin()) {
    document.getElementById("adminStatus").textContent = "Active";
    const users = await getDocs(collection(db, "wcUsers")).catch(() => null);
    const cards = await getDocs(collection(db, "wcCards")).catch(() => null);
    if (users) document.getElementById("adminUsers").textContent = users.size;
    if (cards) document.getElementById("adminCards").textContent = cards.size;

    if (users) {
      document.getElementById("adminUsersList").innerHTML = users.docs.map(d => {
        const u = d.data();
        return `<div class="groupRow"><strong>@${u.username}</strong><span>${u.email}</span><span>${u.cards || 0}</span><span>${u.badges?.length || 0}</span><span>${u.streak || 0}</span></div>`;
      }).join("");
    }
  }
}


// Online league functions are intentionally separated from the local UI fallback.
// They can be wired to the UI after Firebase login verification.
window.DYPLeaguesOnline = {
  async createLeagueOnline({ name, password, logo, limit }) {
    if (!currentUser) throw new Error("Login required.");
    const safeLimit = Math.min(20, Math.max(2, Number(limit) || 10));
    const ref = await addDoc(collection(db, "wcLeagues"), {
      name,
      nameLower: name.toLowerCase(),
      password,
      logo: logo || "🏆",
      limit: safeLimit,
      ownerId: currentUser.uid,
      ownerEmail: currentUser.email,
      members: [{
        uid: currentUser.uid,
        username: currentProfile?.username || "user",
        email: currentUser.email,
        points: 0,
        badges: [],
        scorerBadges: [],
        cards: 0
      }],
      createdAt: serverTimestamp()
    });
    return ref.id;
  },

  async joinLeagueOnline({ name, password }) {
    if (!currentUser) throw new Error("Login required.");
    const snap = await getDocs(collection(db, "wcLeagues"));
    const leagueDoc = snap.docs.find(d => {
      const l = d.data();
      return l.nameLower === name.toLowerCase() && l.password === password;
    });
    if (!leagueDoc) throw new Error("League not found or wrong password.");

    const league = leagueDoc.data();
    if ((league.members || []).length >= league.limit) throw new Error("League is full.");
    if ((league.members || []).some(m => m.uid === currentUser.uid)) return leagueDoc.id;

    league.members = [...(league.members || []), {
      uid: currentUser.uid,
      username: currentProfile?.username || "user",
      email: currentUser.email,
      points: 0,
      badges: [],
      scorerBadges: [],
      cards: 0
    }];

    await setDoc(doc(db, "wcLeagues", leagueDoc.id), league, { merge: true });
    return leagueDoc.id;
  }
};
