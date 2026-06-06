import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, getDocs, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const brands = [
  {name:"Red Bull", ticker:"RB", momentum:12.4},
  {name:"Nike", ticker:"NKE", momentum:8.1},
  {name:"Ferrari", ticker:"FRR", momentum:5.8},
  {name:"Apple", ticker:"APL", momentum:-2.7},
  {name:"NVIDIA", ticker:"NVDA", momentum:10.6},
  {name:"Tesla", ticker:"TSLA", momentum:4.3},
  {name:"Adidas", ticker:"ADS", momentum:-4.2}
];

const fixtures = [
  ["wc1","2026-06-11","19:00","A","Mexico City","Mexico","South Africa"],
  ["wc2","2026-06-12","03:00","A","Zapopan","South Korea","Czechia"],
  ["wc3","2026-06-12","20:00","B","Toronto","Canada","Bosnia and Herzegovina"],
  ["wc4","2026-06-13","02:00","D","Los Angeles","USA","Paraguay"],
  ["wc5","2026-06-13","20:00","B","Santa Clara","Qatar","Switzerland"],
  ["wc6","2026-06-13","23:00","C","New Jersey","Brazil","Morocco"],
  ["wc7","2026-06-14","02:00","D","Santa Clara","Australia","Turkey"],
  ["wc8","2026-06-14","20:00","C","Boston","Scotland","Haiti"],
  ["wc9","2026-06-14","23:00","F","Guadalajara","Sweden","Tunisia"],
  ["wc10","2026-06-15","18:00","H","Atlanta","Spain","Cape Verde"],
  ["wc11","2026-06-15","21:00","E","Philadelphia","Germany","Curaçao"],
  ["wc12","2026-06-16","02:00","G","Los Angeles","Iran","New Zealand"],
  ["wc13","2026-06-16","20:00","I","New Jersey","France","Senegal"],
  ["wc14","2026-06-16","23:00","I","Foxborough","Iraq","Norway"],
  ["wc15","2026-06-17","02:00","J","Kansas City","Argentina","Algeria"],
  ["wc16","2026-06-17","05:00","J","Santa Clara","Austria","Jordan"],
  ["wc17","2026-06-17","18:00","K","Houston","Portugal","DR Congo"],
  ["wc18","2026-06-17","21:00","L","Arlington","England","Croatia"]
].map(x => ({id:x[0], date:x[1], time:x[2], group:x[3], venue:x[4], home:x[5], away:x[6]}));

const rankings = {
  Argentina:1, France:2, Spain:3, England:4, Brazil:5, Portugal:6, Germany:9,
  Croatia:10, Morocco:12, USA:13, Mexico:14, Switzerland:15, Senegal:18,
  Iran:20, "South Korea":22, Australia:24, Turkey:26, Canada:31, Sweden:28,
  Tunisia:41, Czechia:40, Paraguay:53, "South Africa":57, Qatar:34
};

const teams = [...new Set(fixtures.flatMap(f => [f.home, f.away]))];
const teamForm = {};
teams.forEach((team, idx) => {
  let gf = 0, ga = 0, matches = [];
  for (let i = 0; i < 10; i++) {
    const r = (idx * 7 + i * 3) % 10;
    const result = r > 5 ? "W" : r > 2 ? "D" : "L";
    const opp = teams[(idx + i + 3) % teams.length];
    const goalsFor = result === "W" ? 2 + (r % 2) : result === "D" ? 1 : r % 2;
    const goalsAgainst = result === "L" ? 2 + (r % 2) : result === "D" ? 1 : r % 2;
    gf += goalsFor; ga += goalsAgainst;
    matches.push({result, opponent:opp, goalsFor, goalsAgainst, label:`${team} ${goalsFor}-${goalsAgainst} ${opp}`});
  }
  teamForm[team] = {gf, ga, matches};
});

let app, auth, db, currentUser = null, currentProfile = null;
let footballPoints = [];

try {
  app = initializeApp(window.DYP_FIREBASE.firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  onAuthStateChanged(auth, async user => {
    currentUser = user;
    if (user) {
      const snap = await getDoc(doc(db, "users", user.uid));
      currentProfile = snap.exists() ? snap.data() : null;
    } else currentProfile = null;
    refresh();
  });
} catch (e) {
  console.warn(e);
}

// mode handled by mode-controller.js
// showLanding handled by mode-controller.js
// enterMode handled by mode-controller.js
// goToPublish handled by mode-controller.js
// scrollToId handled by mode-controller.js

function weekInfo() {
  const today = new Date("2026-06-11T12:00:00"); // MVP reference date for Week 1 preview
  const start0 = new Date("2026-06-08T00:00:00");
  const ms = 7*24*60*60*1000;
  const idx = Math.max(0, Math.floor((today - start0)/ms));
  const start = new Date(start0.getTime() + idx*ms);
  const end = new Date(start.getTime() + ms - 1);
  return {id:`2026-WC-W${idx+1}`, label:`Week ${idx+1}`, start, end};
}
function activeFixtures() {
  const w = weekInfo();
  return fixtures.filter(f => {
    const d = new Date(f.date+"T12:00:00");
    return d >= w.start && d <= w.end;
  });
}

function renderBrandHome() {
  document.getElementById("brandMiniBars").innerHTML = brands.map(b => `<div class="miniBar ${b.momentum < 0 ? "red":""}" style="height:${Math.max(24, Math.abs(b.momentum)*8)}px"></div>`).join("");
  document.getElementById("brandTopList").innerHTML = brands.slice(0,4).map(b => `<p><b>${b.name}</b> <span class="${b.momentum>=0?"positive":"negative"}">${b.momentum>=0?"+":""}${b.momentum}%</span></p>`).join("");
}

function renderBrandCard() {
  document.getElementById("brandAllocationList").innerHTML = brands.map(b => `
    <div class="allocationRow">
      <div><b>${b.name}</b><p class="${b.momentum>=0?"positive":"negative"}">${b.momentum>=0?"+":""}${b.momentum}% momentum</p></div>
      <input type="number" min="0" max="100" value="0" data-brand="${b.name}" oninput="updateBrandTotal()">
    </div>`).join("");
}
window.updateBrandTotal = () => {
  let total = 0;
  document.querySelectorAll("#brandAllocationList input").forEach(i => total += Number(i.value)||0);
  const el = document.getElementById("brandTotal");
  el.textContent = total;
  el.style.color = total === 100 ? "#81ff70" : total > 100 ? "#ff6767" : "#ffd166";
};

function renderBrandAnalytics() {
  const select = document.getElementById("brandSelect");
  const b = brands.find(x => x.name === select.value) || brands[0];
  const ctx = document.getElementById("brandCanvas").getContext("2d");
  drawLine(ctx, `${b.name} momentum`, Array.from({length:10}, (_,i) => ({
    label:`D${i+1}`,
    value: 50 + b.momentum*3 + Math.sin(i)*10 + i*b.momentum/2,
    color: b.momentum >= 0 ? "#81ff70" : "#ff6767",
    detail:`${b.name} day ${i+1}`
  })));
  document.getElementById("brandStats").innerHTML = `
    <div><span>Momentum</span><strong>${b.momentum>=0?"+":""}${b.momentum}%</strong></div>
    <div><span>DYP score</span><strong>${Math.round(80+b.momentum)}</strong></div>`;
}
window.renderBrandAnalytics = renderBrandAnalytics;

function renderFixtures() {
  const w = weekInfo();
  document.getElementById("weekInfo").textContent = `${w.label} · 8 Jun 2026 – 14 Jun 2026`;
  document.getElementById("fixturesGrid").innerHTML = activeFixtures().map(f => `
    <article class="fixtureCard">
      <div class="fixtureMeta"><span>${f.group}</span><span>${f.date} · ${f.time}</span></div>
      <div class="fixtureTeam"><span>${f.home}</span><strong>1</strong></div>
      <div class="vs">DRAW = X</div>
      <div class="fixtureTeam"><span>${f.away}</span><strong>2</strong></div>
      <p class="muted">${f.venue}</p>
    </article>`).join("");
}

function renderFootballCard() {
  document.getElementById("footballPredictionList").innerHTML = activeFixtures().map(f => `
    <div class="predictionRow" data-id="${f.id}">
      <div><b>${f.home} vs ${f.away}</b><p class="muted">${f.date} · ${f.time}</p></div>
      <div class="outcomeSelect">
        <label class="active"><input type="radio" name="o-${f.id}" value="1" checked onchange="syncOutcomes()">1</label>
        <label><input type="radio" name="o-${f.id}" value="X" onchange="syncOutcomes()">X</label>
        <label><input type="radio" name="o-${f.id}" value="2" onchange="syncOutcomes()">2</label>
      </div>
      <input type="number" min="0" max="100" value="0" data-id="${f.id}" oninput="updateFootballTotal()">
    </div>`).join("");
}
window.syncOutcomes = () => {
  document.querySelectorAll(".outcomeSelect label").forEach(l => l.classList.toggle("active", l.querySelector("input").checked));
};
window.updateFootballTotal = () => {
  let total = 0;
  document.querySelectorAll("#footballPredictionList input[type='number']").forEach(i => total += Number(i.value)||0);
  const el = document.getElementById("footballTotal");
  el.textContent = total;
  el.style.color = total === 100 ? "#81ff70" : total > 100 ? "#ff6767" : "#ffd166";
};

let currentFootballPoints = [];
function renderFootballAnalytics() {
  const team = document.getElementById("teamSelect").value || teams[0];
  const form = teamForm[team];
  const values = form.matches.map((m,i) => {
    let base = m.result === "W" ? 75 : m.result === "D" ? 55 : 35;
    return {label:`M${i+1}`, value:base + i*2, color:m.result==="W"?"#81ff70":m.result==="D"?"#ffd166":"#ff6767", detail:m.label + ` · ${m.result}`};
  });
  const ctx = document.getElementById("footballCanvas").getContext("2d");
  currentFootballPoints = drawLine(ctx, `${team} form · last 10 matches`, values);
  const wins = form.matches.filter(m=>m.result==="W").length;
  const draws = form.matches.filter(m=>m.result==="D").length;
  const losses = form.matches.filter(m=>m.result==="L").length;
  document.getElementById("teamStats").innerHTML = `
    <div><span>Wins</span><strong>${wins}</strong></div>
    <div><span>Draws</span><strong>${draws}</strong></div>
    <div><span>Losses</span><strong>${losses}</strong></div>
    <div><span>Goals for</span><strong>${form.gf}</strong></div>
    <div><span>Goals against</span><strong>${form.ga}</strong></div>
    <div><span>Goal diff.</span><strong>${form.gf-form.ga}</strong></div>`;
  document.getElementById("teamRanking").innerHTML = `<span>World ranking</span><strong>#${rankings[team] || "-"}</strong><p class="muted">Demo ranking field. Connect a football API for live ranking.</p>`;
}
window.renderFootballAnalytics = renderFootballAnalytics;

function drawLine(ctx, title, rows) {
  const W = ctx.canvas.width, H = ctx.canvas.height;
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle = "#05070a"; ctx.fillRect(0,0,W,H);
  ctx.strokeStyle = "rgba(255,255,255,.12)";
  for(let y=70;y<H-50;y+=60){ctx.beginPath();ctx.moveTo(55,y);ctx.lineTo(W-35,y);ctx.stroke();}
  ctx.fillStyle = "#fff"; ctx.font = "bold 26px Arial"; ctx.fillText(title, 60, 42);
  const pts = rows.map((r,i) => ({x:70+i*((W-140)/(rows.length-1)), y:H-65-r.value*3, row:r}));
  ctx.strokeStyle = "#81ff70"; ctx.lineWidth = 5; ctx.beginPath();
  pts.forEach((p,i) => i ? ctx.lineTo(p.x,p.y) : ctx.moveTo(p.x,p.y)); ctx.stroke();
  pts.forEach(p => {ctx.fillStyle=p.row.color; ctx.beginPath(); ctx.arc(p.x,p.y,9,0,Math.PI*2); ctx.fill();});
  ctx.fillStyle = "rgba(255,255,255,.75)"; ctx.font = "bold 14px Arial";
  pts.forEach(p => ctx.fillText(p.row.label, p.x-12, H-22));
  return pts;
}

document.getElementById("footballCanvas").addEventListener("click", e => {
  const c = e.target, r = c.getBoundingClientRect();
  const x = (e.clientX-r.left)*(c.width/r.width), y = (e.clientY-r.top)*(c.height/r.height);
  let best=null, dist=999;
  currentFootballPoints.forEach(p => { const d=Math.hypot(p.x-x,p.y-y); if(d<dist){dist=d;best=p;} });
  if(best && dist<35) document.getElementById("footballTooltip").textContent = best.row.detail;
});

async function createUserDoc(user, username) {
  currentProfile = {uid:user.uid, username, email:user.email, rating:500, brandCards:0, footballCards:0, createdAt:serverTimestamp()};
  await setDoc(doc(db,"users",user.uid), currentProfile);
}
window.createProfile = async () => {
  try {
    const username = document.getElementById("usernameInput").value.trim() || "guest";
    const email = document.getElementById("emailInput").value.trim();
    const pass = document.getElementById("passwordInput").value;
    const cred = await createUserWithEmailAndPassword(auth,email,pass);
    await createUserDoc(cred.user, username);
    document.getElementById("profileMessage").textContent = "Profile created online.";
    refresh();
  } catch(e){ document.getElementById("profileMessage").textContent = e.message; }
};
window.loginProfile = async () => {
  try {
    const email = document.getElementById("emailInput").value.trim();
    const pass = document.getElementById("passwordInput").value;
    await signInWithEmailAndPassword(auth,email,pass);
    document.getElementById("profileMessage").textContent = "Logged in.";
    refresh();
  } catch(e){ document.getElementById("profileMessage").textContent = e.message; }
};
window.logoutProfile = async () => { await signOut(auth); refresh(); };

window.publishBrandCard = async () => {
  if(!currentUser){document.getElementById("brandMessage").textContent="Login first.";return;}
  let total=0, picks=[];
  document.querySelectorAll("#brandAllocationList input").forEach(i=>{let p=Number(i.value)||0; total+=p; if(p>0)picks.push({brand:i.dataset.brand,points:p});});
  if(total!==100){document.getElementById("brandMessage").textContent="Allocate exactly 100 points.";return;}
  await addDoc(collection(db,"portfolios"),{userId:currentUser.uid,email:currentUser.email,picks,total,createdAt:serverTimestamp()});
  document.getElementById("brandMessage").textContent="Brand card published.";
};

window.publishFootballCard = async () => {
  if(!currentUser){document.getElementById("footballMessage").textContent="Login first.";return;}
  let total=0, picks=[], week=weekInfo();
  const snap = await getDocs(collection(db,"footballPortfolios"));
  if(snap.docs.some(d=>d.data().userId===currentUser.uid && d.data().weekId===week.id)){
    document.getElementById("footballMessage").textContent="You already published this week.";
    return;
  }
  document.querySelectorAll(".predictionRow").forEach(row=>{
    const points=Number(row.querySelector("input[type='number']").value)||0;
    const outcome=row.querySelector("input[type='radio']:checked").value;
    total+=points;
    const f=fixtures.find(x=>x.id===row.dataset.id);
    if(points>0)picks.push({matchId:f.id,home:f.home,away:f.away,date:f.date,outcome,points});
  });
  if(total!==100){document.getElementById("footballMessage").textContent="Allocate exactly 100 football points.";return;}
  await addDoc(collection(db,"footballPortfolios"),{userId:currentUser.uid,email:currentUser.email,weekId:week.id,picks,total,createdAt:serverTimestamp()});
  document.getElementById("footballMessage").textContent="Football card published.";
};

async function refresh() {
  document.body.dataset.admin = currentUser?.email === window.DYP_ADMIN_EMAIL ? "true" : "false";
  document.getElementById("backendStatus").textContent = currentUser ? "Online" : "Firebase";
  document.getElementById("profileName").textContent = currentProfile?.username ? "@"+currentProfile.username : "@guest";
  if(currentUser && db){
    const users = await getDocs(collection(db,"users")).catch(()=>null);
    const brand = await getDocs(collection(db,"portfolios")).catch(()=>null);
    const football = await getDocs(collection(db,"footballPortfolios")).catch(()=>null);
    if(users) document.getElementById("adminUsers").textContent = users.size;
    if(brand) document.getElementById("adminBrandCards").textContent = brand.size;
    if(football) document.getElementById("adminFootballCards").textContent = football.size;
  }
}

function init() {
  // initial mode handled by mode-controller.js
  renderBrandHome();
  renderBrandCard();
  document.getElementById("brandSelect").innerHTML = brands.map(b=>`<option>${b.name}</option>`).join("");
  renderBrandAnalytics();
  renderFixtures();
  renderFootballCard();
  document.getElementById("teamSelect").innerHTML = teams.map(t=>`<option>${t}</option>`).join("");
  renderFootballAnalytics();
  document.getElementById("brandLeaderboard").innerHTML = `<div class="row"><b>#</b><b>Player</b><b>Rating</b></div><div class="row"><span>01</span><span>@marketeye</span><strong>500</strong></div>`;
  document.getElementById("footballLeaderboard").innerHTML = `<div class="row"><b>#</b><b>Player</b><b>Cards</b></div><div class="row"><span>01</span><span>@footballoracle</span><strong>0</strong></div>`;
}
document.addEventListener("DOMContentLoaded", init);
