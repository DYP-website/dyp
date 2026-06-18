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
      const snap = await getDoc(doc(db, "wcUsers", user.uid));
      currentProfile = snap.exists() ? snap.data() : null;
    } else {
      currentProfile = null;
    }
    await refreshUserState();
  });
} catch (e) {
  console.warn("Firebase disabled or unavailable", e);
}

function isAdmin() {
  return currentUser?.email?.toLowerCase() === window.DYP_ADMIN_EMAIL.toLowerCase();
}

function selectedAvatarId() {
  const selected = document.querySelector(".avatarOption.selected");
  return selected ? "captain" : "captain";
}

window.DYPAuth = {
  async createProfile() {
    const msg = document.getElementById("authMessage");
    try {
      const username = document.getElementById("usernameInput").value.trim() || "guest";
      const email = document.getElementById("emailInput").value.trim();
      const password = document.getElementById("passwordInput").value;

      const cred = await createUserWithEmailAndPassword(auth, email, password);
      currentProfile = {
        uid: cred.user.uid,
        username,
        email,
        avatar: selectedAvatarId(),
        cards: 0,
        points: 0,
        badges: [],
        points: 0,
        correctPredictions: 0,
        streak: 0,
        createdAt: serverTimestamp()
      };

      await setDoc(doc(db, "wcUsers", cred.user.uid), currentProfile);
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
      await signInWithEmailAndPassword(
        auth,
        document.getElementById("emailInput").value.trim(),
        document.getElementById("passwordInput").value
      );
      msg.textContent = "Logged in.";
      msg.style.color = "#14b86a";
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
        badges: 0,
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
      badges: 0,
      cards: 0
    }];

    await setDoc(doc(db, "wcLeagues", leagueDoc.id), league, { merge: true });
    return leagueDoc.id;
  }
};
