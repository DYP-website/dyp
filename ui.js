window.DYP = (function(){
const DATA = window.DYP_DATA;
let selectedAvatar = "captain";
let formPoints = [];
let selectedScorers = {};
let demoGlobalCard = null;
let demoLeagueCard = null;

const LANGS = [
 ["it","🇮🇹 Italiano"],["en","🇬🇧 English"],["es","🇪🇸 Español"],["fr","🇫🇷 Français"],
 ["de","🇩🇪 Deutsch"],["pt","🇵🇹 Português"],["nl","🇳🇱 Nederlands"],["ja","🇯🇵 日本語"]
];

const I18N = {
 "it": {
  "language": "Lingua",
  "button.publish": "Publish",
  "nav.matchday": "Matchday",
  "nav.card": "Scheda",
  "nav.teams": "Squadre",
  "nav.analytics": "Analytics",
  "nav.rules": "Regole",
  "nav.badges": "Badge",
  "nav.ranking": "Classifica",
  "nav.leagues": "Leghe",
  "home.lead": "Pubblica la tua scheda giornaliera prima del calcio d’inizio. Vinci badge nazionali. Scala la classifica.",
  "home.createCard": "Crea scheda",
  "home.viewMatchday": "Vedi giornata",
  "profile.loginTitle": "Login o crea profilo",
  "profile.createLogin": "Crea / Login",
  "profile.avatarTitle": "Scegli il tuo avatar calcistico",
  "matchday.title": "Centro giornata",
  "card.title": "Pubblica la scheda di oggi",
  "teams.title": "Profili squadre dei gironi",
  "analytics.title": "Forma vs aspettative quote",
  "rules.title": "Come funziona DYP World Cup",
  "badges.title": "Collezione badge",
  "ranking.title": "Classifica DYP World Cup",
  "leagues.title": "Crea o entra in una lega"
 },
 "en": {
  "language": "Language",
  "button.publish": "Publish",
  "nav.matchday": "Matchday",
  "nav.card": "Daily Card",
  "nav.teams": "Teams",
  "nav.analytics": "Analytics",
  "nav.rules": "Rules",
  "nav.badges": "Badges",
  "nav.ranking": "Ranking",
  "nav.leagues": "Leagues",
  "home.lead": "Publish your daily prediction card before kickoff. Win national badges. Climb the ranking.",
  "home.createCard": "Create card",
  "home.viewMatchday": "View matchday",
  "profile.loginTitle": "Login or create profile",
  "profile.createLogin": "Create / Login",
  "profile.avatarTitle": "Choose your football avatar",
  "matchday.title": "Matchday center",
  "card.title": "Publish today’s card",
  "teams.title": "Group-stage team profiles",
  "analytics.title": "Form vs odds expectations",
  "rules.title": "How DYP World Cup works",
  "badges.title": "Badge collection",
  "ranking.title": "DYP World Cup ranking",
  "leagues.title": "Create or join a league"
 },
 "es": {
  "language": "Idioma",
  "button.publish": "Publish",
  "nav.matchday": "Jornada",
  "nav.card": "Tarjeta",
  "nav.teams": "Equipos",
  "nav.analytics": "Analytics",
  "nav.rules": "Reglas",
  "nav.badges": "Insignias",
  "nav.ranking": "Clasificación",
  "nav.leagues": "Ligas",
  "home.lead": "Publica tu tarjeta diaria antes del inicio. Gana insignias nacionales y sube en la clasificación.",
  "home.createCard": "Crear tarjeta",
  "home.viewMatchday": "Ver jornada",
  "profile.loginTitle": "Iniciar sesión o crear perfil",
  "profile.createLogin": "Crear / Login",
  "profile.avatarTitle": "Elige tu avatar futbolístico",
  "matchday.title": "Centro de jornada",
  "card.title": "Publica la tarjeta de hoy",
  "teams.title": "Perfiles de equipos",
  "analytics.title": "Forma vs expectativas de cuotas",
  "rules.title": "Cómo funciona DYP World Cup",
  "badges.title": "Colección de insignias",
  "ranking.title": "Clasificación DYP World Cup",
  "leagues.title": "Crear o unirse a una liga"
 },
 "fr": {
  "language": "Langue",
  "button.publish": "Publish",
  "nav.matchday": "Journée",
  "nav.card": "Carte",
  "nav.teams": "Équipes",
  "nav.analytics": "Analytics",
  "nav.rules": "Règles",
  "nav.badges": "Badges",
  "nav.ranking": "Classement",
  "nav.leagues": "Ligues",
  "home.lead": "Publie ta carte quotidienne avant le coup d’envoi. Gagne des badges nationaux et monte au classement.",
  "home.createCard": "Créer la carte",
  "home.viewMatchday": "Voir journée",
  "profile.loginTitle": "Connexion ou création de profil",
  "profile.createLogin": "Créer / Connexion",
  "profile.avatarTitle": "Choisis ton avatar football",
  "matchday.title": "Centre de journée",
  "card.title": "Publier la carte du jour",
  "teams.title": "Profils des équipes",
  "analytics.title": "Forme vs attentes des cotes",
  "rules.title": "Comment fonctionne DYP World Cup",
  "badges.title": "Collection de badges",
  "ranking.title": "Classement DYP World Cup",
  "leagues.title": "Créer ou rejoindre une ligue"
 },
 "de": {
  "language": "Sprache",
  "button.publish": "Publish",
  "nav.matchday": "Spieltag",
  "nav.card": "Karte",
  "nav.teams": "Teams",
  "nav.analytics": "Analytics",
  "nav.rules": "Regeln",
  "nav.badges": "Badges",
  "nav.ranking": "Rangliste",
  "nav.leagues": "Ligen",
  "home.lead": "Veröffentliche deine Tageskarte vor dem Anstoß. Gewinne National-Badges und steige in der Rangliste.",
  "home.createCard": "Karte erstellen",
  "home.viewMatchday": "Spieltag ansehen",
  "profile.loginTitle": "Einloggen oder Profil erstellen",
  "profile.createLogin": "Erstellen / Login",
  "profile.avatarTitle": "Wähle deinen Fußball-Avatar",
  "matchday.title": "Spieltag-Zentrale",
  "card.title": "Heutige Karte veröffentlichen",
  "teams.title": "Teamprofile der Gruppenphase",
  "analytics.title": "Form vs Quoten-Erwartung",
  "rules.title": "So funktioniert DYP World Cup",
  "badges.title": "Badge-Sammlung",
  "ranking.title": "DYP World Cup Rangliste",
  "leagues.title": "Liga erstellen oder beitreten"
 },
 "pt": {
  "language": "Idioma",
  "button.publish": "Publish",
  "nav.matchday": "Jornada",
  "nav.card": "Cartão",
  "nav.teams": "Equipas",
  "nav.analytics": "Analytics",
  "nav.rules": "Regras",
  "nav.badges": "Badges",
  "nav.ranking": "Ranking",
  "nav.leagues": "Ligas",
  "home.lead": "Publica o teu cartão diário antes do início. Ganha badges nacionais e sobe no ranking.",
  "home.createCard": "Criar cartão",
  "home.viewMatchday": "Ver jornada",
  "profile.loginTitle": "Login ou criar perfil",
  "profile.createLogin": "Criar / Login",
  "profile.avatarTitle": "Escolhe o teu avatar de futebol",
  "matchday.title": "Centro da jornada",
  "card.title": "Publicar cartão de hoje",
  "teams.title": "Perfis das equipas",
  "analytics.title": "Forma vs expectativas das odds",
  "rules.title": "Como funciona o DYP World Cup",
  "badges.title": "Coleção de badges",
  "ranking.title": "Ranking DYP World Cup",
  "leagues.title": "Criar ou entrar numa liga"
 },
 "nl": {
  "language": "Taal",
  "button.publish": "Publish",
  "nav.matchday": "Speeldag",
  "nav.card": "Kaart",
  "nav.teams": "Teams",
  "nav.analytics": "Analytics",
  "nav.rules": "Regels",
  "nav.badges": "Badges",
  "nav.ranking": "Ranking",
  "nav.leagues": "Leagues",
  "home.lead": "Publiceer je dagelijkse kaart vóór de aftrap. Win nationale badges en klim in de ranking.",
  "home.createCard": "Kaart maken",
  "home.viewMatchday": "Bekijk speeldag",
  "profile.loginTitle": "Inloggen of profiel maken",
  "profile.createLogin": "Maken / Login",
  "profile.avatarTitle": "Kies je voetbalavatar",
  "matchday.title": "Speeldagcentrum",
  "card.title": "Publiceer kaart van vandaag",
  "teams.title": "Teamprofielen groepsfase",
  "analytics.title": "Vorm vs oddsverwachting",
  "rules.title": "Hoe DYP World Cup werkt",
  "badges.title": "Badgecollectie",
  "ranking.title": "DYP World Cup ranking",
  "leagues.title": "League maken of deelnemen"
 },
 "ja": {
  "language": "言語",
  "button.publish": "Publish",
  "nav.matchday": "試合日",
  "nav.card": "カード",
  "nav.teams": "チーム",
  "nav.analytics": "分析",
  "nav.rules": "ルール",
  "nav.badges": "バッジ",
  "nav.ranking": "ランキング",
  "nav.leagues": "リーグ",
  "home.lead": "キックオフ前に毎日のカードを公開。国別バッジを獲得し、ランキングを上げよう。",
  "home.createCard": "カード作成",
  "home.viewMatchday": "試合日を見る",
  "profile.loginTitle": "ログインまたはプロフィール作成",
  "profile.createLogin": "作成 / ログイン",
  "profile.avatarTitle": "サッカーアバターを選択",
  "matchday.title": "試合日センター",
  "card.title": "今日のカードを公開",
  "teams.title": "グループステージのチーム",
  "analytics.title": "フォームとオッズ期待値",
  "rules.title": "DYP World Cupの仕組み",
  "badges.title": "バッジコレクション",
  "ranking.title": "DYP World Cupランキング",
  "leagues.title": "リーグ作成または参加"
 }
};

function $(id){return document.getElementById(id)}
function scrollTo(id){$(id)?.scrollIntoView({behavior:"smooth",block:"start"})}
function team(name){return DATA.teams.find(t=>t.name===name)||{name,flag:"🏳️",group:"-",ranking:"-",squad:[]}}

function normalizeFootballDataMatch(apiMatch){
 const home = apiMatch.homeTeam?.name || "Home";
 const away = apiMatch.awayTeam?.name || "Away";
 const utcDate = apiMatch.utcDate ? new Date(apiMatch.utcDate) : null;
 const yyyyMMdd = utcDate ? utcDate.toISOString().slice(0,10) : "2026-06-11";
 const time = utcDate ? utcDate.toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"}) : "TBD";
 const statusMap = { FINISHED:"complete", IN_PLAY:"live", PAUSED:"live", TIMED:"scheduled", SCHEDULED:"scheduled" };
 return {
   id: String(apiMatch.id),
   matchday: yyyyMMdd,
   group: apiMatch.group || apiMatch.stage || "-",
   time,
   venue: apiMatch.venue || "World Cup venue",
   home,
   away,
   status: statusMap[apiMatch.status] || "scheduled",
   scoreHome: apiMatch.score?.fullTime?.home ?? apiMatch.score?.regularTime?.home ?? null,
   scoreAway: apiMatch.score?.fullTime?.away ?? apiMatch.score?.regularTime?.away ?? null,
   scorers: [],
   odds: { home: 2.00, draw: 3.20, away: 3.60 },
   source: "football-data"
 };
}

function normalizeFootballDataTeam(apiTeam){
 const existing = DATA.teams.find(t => t.name === apiTeam.name || t.name === apiTeam.shortName);
 return {
   name: apiTeam.name || apiTeam.shortName,
   group: existing?.group || "-",
   flag: existing?.flag || "🏳️",
   ranking: existing?.ranking || "-",
   coach: existing?.coach || "To be announced",
   squad: existing?.squad || [],
   squadSections: existing?.squadSections || {
     goalkeepers: [],
     defenders: [],
     midfielders: [],
     forwards: []
   },
   source: "football-data"
 };
}

async function loadLiveData(){
 const chip = $("apiStatusChip");
 if(chip){ chip.textContent="Loading live API…"; chip.classList.add("blue"); }

 const [apiMatches, apiTeams] = await Promise.all([
   window.DYP_API?.fetchWorldCupMatches?.(),
   window.DYP_API?.fetchWorldCupTeams?.()
 ]);

 let loaded = false;

 if(apiTeams && Array.isArray(apiTeams) && apiTeams.length){
   const normalizedTeams = apiTeams.map(normalizeFootballDataTeam);
   // Keep richer local teams where API roster is limited; add missing teams from API.
   normalizedTeams.forEach(apiT => {
     if(!DATA.teams.some(t => t.name === apiT.name)) DATA.teams.push(apiT);
   });
   loaded = true;
 }

 if(apiMatches && Array.isArray(apiMatches) && apiMatches.length){
   DATA.matches = apiMatches.map(normalizeFootballDataMatch);
   loaded = true;
 }

 renderMatchdaySelect();
 renderMatchday();
 renderTeamSelect();
 renderTeamProfile();
 renderAnalytics();
 renderBadges();
 renderLeaderboard();
 refreshAllLiveCards();

 if(chip){
   chip.textContent = loaded ? "Live API loaded" : "Fallback data updated";
   chip.classList.toggle("green", loaded);
   chip.classList.toggle("red", !loaded);
 }
}
function activeDate(){return $("matchdaySelect")?.value || DATA.matches[0]?.matchday}
function matchesByDate(d){return DATA.matches.filter(m=>m.matchday===d)}
function setMessage(id,text,color){const el=$(id); if(el){el.textContent=text; el.style.color=color||"#111827"}}

function renderLanguages(){
 const menu=$("languageMenu"); if(!menu)return;
 menu.innerHTML=LANGS.map(([code,label])=>`<button onclick="DYP.setLanguage('${code}')">${label}</button>`).join("");
 setLanguage(localStorage.getItem("dyp_lang")||"it");
}
function toggleLanguage(){$("languageMenu")?.classList.toggle("open")}
function setLanguage(lang){
 localStorage.setItem("dyp_lang",lang);
 document.documentElement.lang = lang;
 const t=I18N[lang]||I18N.it;
 if($("languageLabel"))$("languageLabel").textContent=t.language;
 document.querySelectorAll("[data-i18n]").forEach(el=>{
   const key=el.dataset.i18n;
   if(t[key]) el.innerHTML=t[key];
 });
 const btn=document.querySelector(".publishBtn");
 if(btn) btn.textContent="Publish";
 $("languageMenu")?.classList.remove("open");
}

function renderAvatars(){
 $("avatarGrid").innerHTML=DATA.avatars.map(a=>`<button class="avatarOption ${selectedAvatar===a.id?"selected":""}" onclick="DYP.selectAvatar('${a.id}')">${a.icon}</button>`).join("");
}
function selectAvatar(id){selectedAvatar=id;renderAvatars();$("profileAvatar").textContent=(DATA.avatars.find(a=>a.id===id)||DATA.avatars[0]).icon}
function avatarIcon(id){return (DATA.avatars.find(a=>a.id===id)||DATA.avatars[0]).icon}

function renderMatchdaySelect(){
 const dates=[...new Set(DATA.matches.map(m=>m.matchday))];
 $("matchdaySelect").innerHTML=dates.map((d,i)=>`<option value="${d}">Matchday ${i+1} · ${d}</option>`).join("");
}
function renderMatchday(){
 const date=activeDate(), matches=matchesByDate(date);
 $("predictionDayTitle").textContent=`Daily card · ${date}`;
 const first=matches[0]; if(first)$("deadlineText").textContent=`${date} · before ${first.time}`;
 $("matchGrid").innerHTML=matches.map(m=>{
   const homeScorers=(m.scorers||[]).filter(s=>s.team===m.home);
   const awayScorers=(m.scorers||[]).filter(s=>s.team===m.away);
   return `
  <article class="matchCard">
    <div class="matchMeta"><span>Group ${m.group}</span><span>${m.matchday} · ${m.time}</span></div>
    <div class="scoreLine">
      <div class="teamName">${team(m.home).flag} ${m.home}</div>
      <div class="scoreBox">${m.scoreHome ?? "-"} : ${m.scoreAway ?? "-"}</div>
      <div class="teamName">${team(m.away).flag} ${m.away}</div>
    </div>
    <div class="scorerColumns">
      <div><strong>${m.home} scorers</strong>${homeScorers.length ? homeScorers.map(s=>`<span>${s.minute}' ${s.player}</span>`).join("") : `<span class="muted">No scorer yet</span>`}</div>
      <div><strong>${m.away} scorers</strong>${awayScorers.length ? awayScorers.map(s=>`<span>${s.minute}' ${s.player}</span>`).join("") : `<span class="muted">No scorer yet</span>`}</div>
    </div>
    <div class="oddsLine intuitive">
      <span><b>Home win</b><small>${m.home}</small><strong>${m.odds.home}</strong></span>
      <span><b>Draw</b><small>X</small><strong>${m.odds.draw}</strong></span>
      <span><b>Away win</b><small>${m.away}</small><strong>${m.odds.away}</strong></span>
    </div>
  </article>`}).join("");
 renderPredictionList(); refreshAllLiveCards();
}
function renderPredictionList(){
 $("predictionList").innerHTML=matchesByDate(activeDate()).map(m=>`
  <div class="predictionRow" data-id="${m.id}">
    <div><strong>${team(m.home).flag} ${m.home} vs ${team(m.away).flag} ${m.away}</strong><p class="muted">${m.matchday} · ${m.time}</p><button class="addScorerBtn" onclick="DYP.openScorerPicker('${m.id}')">Add scorer</button><div id="selected-scorer-${m.id}"></div></div>
    <div class="outcomes">
      <label class="active"><input type="radio" name="pred-${m.id}" value="1" checked onchange="DYP.syncOutcomes()">1</label>
      <label><input type="radio" name="pred-${m.id}" value="X" onchange="DYP.syncOutcomes()">X</label>
      <label><input type="radio" name="pred-${m.id}" value="2" onchange="DYP.syncOutcomes()">2</label>
    </div>
  </div>`).join("");
 syncOutcomes();
}
function syncOutcomes(){document.querySelectorAll(".outcomes label").forEach(l=>l.classList.toggle("active",l.querySelector("input").checked))}
function collectPicks(){
 return [...document.querySelectorAll(".predictionRow")].map(row=>{
  const m=DATA.matches.find(x=>x.id===row.dataset.id);
  return {
    matchId:m.id,
    home:m.home,
    away:m.away,
    prediction:row.querySelector("input:checked").value,
    scorer:selectedScorers[m.id] || null
  };
 });
}

function renderTeamSelect(){
 $("teamSelect").innerHTML=DATA.teams.map(t=>`<option value="${t.name}">${t.flag} ${t.name}</option>`).join("");
}
function renderTeamProfile(){
 const name=$("teamSelect").value||DATA.teams[0].name, t=team(name);
 $("teamHeader").innerHTML=`<div class="teamHeaderTop"><div class="flagBadge">${t.flag}</div><div><h3>${t.name}</h3><p class="muted">Group ${t.group} · Ranking #${t.ranking}</p><p class="coachLine"><b>Coach</b> ${t.coach || "To be announced"}</p></div></div>`;
 $("teamFixtures").innerHTML=DATA.matches.filter(m=>m.home===name||m.away===name).map(m=>`<div class="fixtureMini"><strong>${m.home} vs ${m.away}</strong><p class="muted">${m.matchday} · ${m.time} · ${m.scoreHome ?? "-"}:${m.scoreAway ?? "-"}</p></div>`).join("") || `<p class="muted">No group fixture loaded yet.</p>`;
 renderSquadSection("goalkeepers");
 renderGroupTable(t.group);
}
function renderSquadSection(section){
 const name=$("teamSelect").value||DATA.teams[0].name, t=team(name);
 const sections=t.squadSections || {
   goalkeepers:(t.squad||[]).slice(0,3),
   defenders:(t.squad||[]).slice(3,11),
   midfielders:(t.squad||[]).slice(11,18),
   forwards:(t.squad||[]).slice(18)
 };
 document.querySelectorAll(".squadTab").forEach(b=>b.classList.toggle("active",b.dataset.section===section));
 const titleMap={goalkeepers:"Goalkeepers",defenders:"Defenders",midfielders:"Midfielders",forwards:"Forwards"};
 const players=sections[section] || [];
 $("teamSquad").innerHTML=`<div class="squadSectionTitle"><strong>${titleMap[section]}</strong><span>${players.length} players</span></div>` + players.map(p=>`<div class="playerPill">${p}</div>`).join("");
}
window.renderSquadSection = renderSquadSection;
function renderGroupTable(group){
 const rows=DATA.teams.filter(t=>t.group===group).map(t=>{
  let pts=0,pg=0,gf=0,ga=0;
  DATA.matches.forEach(m=>{
   if((m.home===t.name||m.away===t.name)&&m.scoreHome!==null){
    pg++; const forG=m.home===t.name?m.scoreHome:m.scoreAway; const ag=m.home===t.name?m.scoreAway:m.scoreHome;
    gf+=forG; ga+=ag; pts+=forG>ag?3:forG===ag?1:0;
   }
  });
  return {name:t.name,pts,pg,gf,ga};
 }).sort((a,b)=>b.pts-a.pts||(b.gf-b.ga)-(a.gf-a.ga));
 $("groupTable").innerHTML=`<div class="groupRow head"><span>Team</span><span>Pt</span><span>PG</span><span>GF</span><span>GA</span></div>`+rows.map(r=>`<div class="groupRow"><strong>${r.name}</strong><span>${r.pts}</span><span>${r.pg}</span><span>${r.gf}</span><span>${r.ga}</span></div>`).join("");
}

function historicalMatchesFor(name){
 const opponents = DATA.teams.filter(t=>t.name!==name).map(t=>t.name);
 return Array.from({length:10},(_,i)=>{
   const opp = opponents[(name.length+i*3)%opponents.length];
   const v=(name.length*7+i*5)%10;
   const result=v>5?"W":v>2?"D":"L";
   const gf=result==="W"?2+(i%2):result==="D"?1:i%2;
   const ga=result==="L"?2+(i%2):result==="D"?1:i%2;
   return {
     label:`M${i+1}`,
     opponent:opp,
     result,
     score:`${gf}-${ga}`,
     detail:`${name} ${gf}-${ga} ${opp} · ${result}`
   };
 });
}
function expectationForMatch(match,i){
 // Simulated odds expectation: FAV = expected win, EVEN = expected draw/tight match, DOG = expected loss.
 const cycle=(match.opponent.length+i+match.detail.length)%3;
 return cycle===0?"FAV":cycle===1?"EVEN":"DOG";
}
function expectationValue(match,i){
 const exp=expectationForMatch(match,i);
 const actual=match.result;
 if(exp==="FAV" && actual==="W") return {v:1, label:"Confirmed favorite", color:"#14b86a"};
 if(exp==="FAV" && actual==="D") return {v:-0.5, label:"Below favorite expectation", color:"#f59e0b"};
 if(exp==="FAV" && actual==="L") return {v:-1, label:"Upset loss as favorite", color:"#ef4444"};
 if(exp==="EVEN" && actual==="D") return {v:1, label:"Draw confirmed tight odds", color:"#14b86a"};
 if(exp==="EVEN" && actual==="W") return {v:0.8, label:"Positive edge in tight match", color:"#14b86a"};
 if(exp==="EVEN" && actual==="L") return {v:-0.8, label:"Negative edge in tight match", color:"#ef4444"};
 if(exp==="DOG" && actual==="W") return {v:1.2, label:"Huge upset above odds", color:"#14b86a"};
 if(exp==="DOG" && actual==="D") return {v:0.7, label:"Good result as underdog", color:"#14b86a"};
 return {v:0, label:"Expected loss as underdog", color:"#94a3b8"};
}
function renderAnalytics(){
 const name=$("teamSelect").value||DATA.teams[0].name,t=team(name),matches=historicalMatchesFor(name);
 $("analyticsStats").innerHTML=`<div><span>Wins</span><strong>${matches.filter(x=>x.result==="W").length}</strong></div><div><span>Draws</span><strong>${matches.filter(x=>x.result==="D").length}</strong></div><div><span>Losses</span><strong>${matches.filter(x=>x.result==="L").length}</strong></div><div><span>GF</span><strong>${matches.reduce((a,m)=>a+Number(m.score.split("-")[0]),0)}</strong></div><div><span>GA</span><strong>${matches.reduce((a,m)=>a+Number(m.score.split("-")[1]),0)}</strong></div><div><span>Group</span><strong>${t.group}</strong></div>`;
 $("rankingBadge").innerHTML=`<span>World ranking</span><strong>#${t.ranking}</strong><p class="muted">Demo ranking field. Connect a free API or admin update later.</p>`;
 formPoints=drawResultBars($("formCanvas"),`${name} result trend`,matches);
 drawExpectedBars($("expectedCanvas"),`${name} expected outcome from odds`,matches);
 drawExpectationPerformance($("vsCanvas"),`${name} performance vs expectations`,matches);
}
function drawResultBars(canvas,title,rows){
 const ctx=canvas.getContext("2d"),W=canvas.width,H=canvas.height;
 setupChart(ctx,W,H,title);
 const mid=H/2-4,left=50,slot=(W-left-30)/rows.length,bw=Math.min(52,slot*.58);
 const pts=[];
 rows.forEach((r,i)=>{
   const val=r.result==="W"?1:r.result==="L"?-1:0;
   const h=val===0?18:84;
   const x=left+i*slot+slot/2-bw/2;
   const y=val>0?mid-h:val<0?mid:mid-9;
   ctx.fillStyle=val>0?"#14b86a":val<0?"#ef4444":"#94a3b8";
   roundRect(ctx,x,y,bw,h,12); ctx.fill();
   ctx.fillStyle="#fff"; ctx.font="bold 13px Arial"; ctx.fillText(r.result,x+bw/2-6,val>0?y+25:y+h-9);
   drawMiniLabel(ctx,r.opponent,r.score,x+ bw/2,H-58,H-34);
   pts.push({x:x+bw/2,y:y+h/2,row:r});
 });
 return pts;
}
function drawExpectedBars(canvas,title,rows){
 const ctx=canvas.getContext("2d"),W=canvas.width,H=canvas.height;
 setupChart(ctx,W,H,title);
 const mid=H/2-4,left=50,slot=(W-left-30)/rows.length,bw=Math.min(52,slot*.58);
 rows.forEach((r,i)=>{
   const exp=expectationForMatch(r,i);
   const val=exp==="FAV"?1:exp==="DOG"?-1:0;
   const h=val===0?18:72;
   const x=left+i*slot+slot/2-bw/2;
   const y=val>0?mid-h:val<0?mid:mid-9;
   ctx.fillStyle=val>0?"#2563eb":val<0?"#64748b":"#94a3b8";
   roundRect(ctx,x,y,bw,h,12); ctx.fill();
   ctx.fillStyle="#fff"; ctx.font="bold 11px Arial"; ctx.fillText(exp,x+bw/2-13,val>0?y+24:y+h-9);
   drawMiniLabel(ctx,r.opponent,r.score,x+bw/2,H-58,H-34);
 });
}
function drawExpectationPerformance(canvas,title,rows){
 const ctx=canvas.getContext("2d"),W=canvas.width,H=canvas.height;
 setupChart(ctx,W,H,title);
 const mid=H/2-4,left=50,slot=(W-left-30)/rows.length,bw=Math.min(52,slot*.58);
 const pts=[];
 rows.forEach((r,i)=>{
   const perf=expectationValue(r,i);
   const val=perf.v>0?1:perf.v<0?-1:0;
   const h=Math.max(18,Math.abs(perf.v)*72);
   const x=left+i*slot+slot/2-bw/2;
   const y=val>0?mid-h:val<0?mid:mid-9;
   ctx.fillStyle=perf.color;
   roundRect(ctx,x,y,bw,h,12); ctx.fill();
   ctx.fillStyle="#fff"; ctx.font="bold 12px Arial"; ctx.fillText(val>0?"UP":val<0?"DN":"OK",x+bw/2-10,val>0?y+24:y+h-9);
   drawMiniLabel(ctx,r.opponent,r.score,x+bw/2,H-58,H-34);
   pts.push({x:x+bw/2,y:y+h/2,row:{...r,detail:`${r.detail} · ${perf.label}`}});
 });
 return pts;
}
function setupChart(ctx,W,H,title){
 ctx.clearRect(0,0,W,H);
 ctx.fillStyle="#f8fafc";ctx.fillRect(0,0,W,H);
 const mid=H/2-4;
 ctx.strokeStyle="#cbd5e1";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(42,mid);ctx.lineTo(W-28,mid);ctx.stroke();
 ctx.fillStyle="#111827";ctx.font="bold 23px Arial";ctx.fillText(title,48,38);
 ctx.fillStyle="#64748b";ctx.font="bold 11px Arial";ctx.fillText("above",48,mid-92);ctx.fillText("below",48,mid+104);
}
function drawMiniLabel(ctx,opponent,score,x,y1,y2){
 const label=opponent.length>9?opponent.slice(0,9)+"…":opponent;
 ctx.fillStyle="#111827";ctx.font="bold 10px Arial";ctx.textAlign="center";ctx.fillText(label,x,y1);
 ctx.fillStyle="#64748b";ctx.font="bold 11px Arial";ctx.fillText(score,x,y2);
 ctx.textAlign="start";
}
function roundRect(ctx,x,y,w,h,r){
 ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.closePath();
}
function attachChartClick(){
 $("formCanvas").addEventListener("click",e=>{
  const c=e.target,r=c.getBoundingClientRect(),x=(e.clientX-r.left)*(c.width/r.width),y=(e.clientY-r.top)*(c.height/r.height);
  let best=null,dist=999; formPoints.forEach(p=>{const d=Math.hypot(p.x-x,p.y-y); if(d<dist){dist=d;best=p}});
  if(best&&dist<35)$("formTooltip").textContent=best.row.detail;
 });
}

function renderBadges(){
 $("badgeCollection").innerHTML=DATA.teams.map(t=>`<div class="badgeItem"><div class="flagBadge">${t.flag}</div><strong>${t.name}</strong><p class="muted">Locked</p></div>`).join("") + `<div class="badgeItem"><div class="flagBadge">⚽</div><strong>1 Scorer</strong><p class="muted">Predict 1 scorer</p></div><div class="badgeItem"><div class="flagBadge">🔥</div><strong>5 Scorers</strong><p class="muted">Predict 5 scorers</p></div><div class="badgeItem"><div class="flagBadge">🏆</div><strong>10 Scorers</strong><p class="muted">Predict 10 scorers</p></div><div class="badgeItem"><div class="flagBadge">👑</div><strong>20 Scorers</strong><p class="muted">Predict 20 scorers</p></div>`;
}
function renderLeaderboard(){
 const demoPlayers=[
  {username:"worldcuporacle",points:12,badges:["Mexico","South Korea","Canada"],cards:3},
  {username:"captainvision",points:8,badges:["Brazil","Germany"],cards:2},
  {username:"arvin",points:4,badges:["France"],cards:1}
 ];
 $("leaderboard").innerHTML=`<div class="leaderboardRow head"><strong>#</strong><strong>Player</strong><strong>Points</strong><strong>Badges</strong></div>`+
 demoPlayers.map((p,i)=>`<button class="leaderboardRow playerRow" onclick='DYP.openPublicProfile(${JSON.stringify(JSON.stringify(p))})'><span>${i+1}</span><strong>@${p.username}</strong><span>${p.points}</span><span>${p.badges.length}</span></button>`).join("");
}
function openPublicProfile(playerJson){
 const p=JSON.parse(playerJson);
 const badgeHtml=p.badges.length?p.badges.map(name=>{const t=team(name);return `<div class="miniBadge"><span>${t.flag}</span><b>${name}</b></div>`}).join(""):`<p class="muted">No badges yet.</p>`;
 $("publicProfileContent").innerHTML=`<div class="publicProfileHeader"><div class="profileAvatar">⚽</div><div><h3>@${p.username}</h3><p class="muted">${p.points} DYP Points · ${p.cards} cards published</p></div></div><div class="miniBadgeGrid">${badgeHtml}</div>`;
}
function renderAdminSelect(){
 const sel=$("adminMatchSelect"); if(!sel)return;
 sel.innerHTML=DATA.matches.map(m=>`<option value="${m.id}">${m.matchday} · ${m.home} vs ${m.away}</option>`).join("");
}


let selectedLeagueLogo = "🏆";
let activeLeagueId = null;

window.DYPLeagues = {
  selectLogo(logo) {
    selectedLeagueLogo = logo;
    document.querySelectorAll(".leagueLogoPicker button").forEach(b => b.classList.toggle("active", b.textContent.trim() === logo));
  },

  createLeague() {
    const msg = $("createLeagueMessage");
    msg.textContent = "Login required to create an online league. Firebase will save it once logged in.";
    msg.style.color = "#f59e0b";

    const name = $("createLeagueName").value.trim();
    const limit = Math.min(20, Math.max(2, Number($("createLeagueLimit").value) || 10));
    if (!name) {
      msg.textContent = "Insert a league name.";
      msg.style.color = "#ef4444";
      return;
    }

    const demo = JSON.parse(localStorage.getItem("dyp_demo_leagues") || "[]");
    const id = "league_" + Date.now();
    demo.push({ id, name, logo: selectedLeagueLogo, limit, members: [{ username: "you", points: 0, badges: [], cards: 0 }] });
    localStorage.setItem("dyp_demo_leagues", JSON.stringify(demo));
    msg.textContent = "League created locally. Login/Firebase will make it online.";
    msg.style.color = "#14b86a";
    renderLocalLeagues();
  },

  joinLeague() {
    const msg = $("joinLeagueMessage");
    msg.textContent = "Online league joining requires Firebase login. Local demo search is active.";
    msg.style.color = "#f59e0b";

    const name = $("joinLeagueName").value.trim().toLowerCase();
    const leagues = JSON.parse(localStorage.getItem("dyp_demo_leagues") || "[]");
    const found = leagues.find(l => l.name.toLowerCase() === name);
    if (!found) {
      msg.textContent = "League not found in local demo.";
      msg.style.color = "#ef4444";
      return;
    }
    openLeague(found.id);
    msg.textContent = "League opened.";
    msg.style.color = "#14b86a";
  },

  refreshLeagues() {
    renderLocalLeagues();
  },

  openLeague(id) {
    openLeague(id);
  }
};

function renderLocalLeagues() {
  const list = $("myLeaguesList");
  if (!list) return;
  const leagues = JSON.parse(localStorage.getItem("dyp_demo_leagues") || "[]");
  if (!leagues.length) {
    list.innerHTML = `<p class="muted">No leagues yet. Create one or join using league name and password.</p>`;
    return;
  }

  list.innerHTML = leagues.map(l => `
    <div class="leagueItem">
      <div class="leagueIcon">${l.logo || "🏆"}</div>
      <div>
        <strong>${l.name}</strong>
        <p class="muted">${l.members.length}/${l.limit} participants</p>
      </div>
      <button class="secondary" onclick="DYPLeagues.openLeague('${l.id}')">Open</button>
    </div>
  `).join("");
}

function openLeague(id) {
  activeLeagueId = id;
  const leagues = JSON.parse(localStorage.getItem("dyp_demo_leagues") || "[]");
  const league = leagues.find(l => l.id === id);
  if (!league) return;

  $("activeLeagueHeader").innerHTML = `
    <div class="teamHeaderTop">
      <div class="leagueIcon">${league.logo || "🏆"}</div>
      <div>
        <h3>${league.name}</h3>
        <p class="muted">${league.members.length}/${league.limit} participants · ranking by badges</p>
      </div>
    </div>
  `;

  const rows = [...league.members].sort((a,b) => (b.points||0) - (a.points||0));
  $("leagueRanking").innerHTML = `
    <div class="leagueRankRow head"><span>#</span><span>Player</span><span>Points</span><span>Badges</span></div>
    ${rows.map((m,i) => `<div class="leagueRankRow"><span>${i+1}</span><strong>@${m.username}</strong><span>${m.points || 0}</span><span>${Array.isArray(m.badges)?m.badges.length:(m.badges||0)}</span></div>`).join("")}
  `;
}


function calculatePredictionReward({ prediction, match, currentBadges=[] }){
 // Returns score for one match:
 // +1 for correct prediction.
 // +3 extra when the correct prediction unlocks a new national badge.
 // Draw gives both team badges if both are not already owned.
 const actual = match.scoreHome===null ? null : match.scoreHome>match.scoreAway ? "1" : match.scoreHome<match.scoreAway ? "2" : "X";
 if(!actual || actual!==prediction) return {points:0,newBadges:[],correct:false};

 let badgeCandidates = [];
 if(actual==="1") badgeCandidates=[match.home];
 if(actual==="2") badgeCandidates=[match.away];
 if(actual==="X") badgeCandidates=[match.home,match.away];

 const newBadges = badgeCandidates.filter(b=>!currentBadges.includes(b));
 return {
   points: 1 + newBadges.length*3,
   newBadges,
   correct:true
 };
}


function roleLabel(role){
 return {goalkeepers:"Goalkeepers",defenders:"Defenders",midfielders:"Midfielders",forwards:"Forwards"}[role] || role;
}
function playersByRole(teamName, role){
 const t=team(teamName);
 const s=t.squadSections || {goalkeepers:(t.squad||[]).slice(0,3),defenders:(t.squad||[]).slice(3,11),midfielders:(t.squad||[]).slice(11,18),forwards:(t.squad||[]).slice(18)};
 return s[role] || [];
}
function openScorerPicker(matchId){
 const m=DATA.matches.find(x=>x.id===matchId);
 if(!m) return;
 const roles=["goalkeepers","defenders","midfielders","forwards"];
 $("scorerPickerPanel").innerHTML=`
  <div class="scorerPickerCard">
    <div class="cardTop">
      <h3>Add scorer · ${m.home} vs ${m.away}</h3>
      <button class="ghost" onclick="DYP.closeScorerPicker()">Close</button>
    </div>
    <p class="muted">Choose one potential scorer from either team. Correct scorer gives +5 DYP Points.</p>
    <div class="scorerTeams">
      ${[m.home,m.away].map(teamName=>`
        <div class="scorerTeamColumn">
          <h3>${team(teamName).flag} ${teamName}</h3>
          <div class="scorerRoleTabs">
            ${roles.map(role=>`<button onclick="DYP.renderScorerRole('${matchId}','${teamName}','${role}')">${roleLabel(role)}</button>`).join("")}
          </div>
          <div id="scorerPlayers-${matchId}-${teamName.replaceAll(" ","_")}" class="scorerPlayers"></div>
        </div>
      `).join("")}
    </div>
  </div>`;
 renderScorerRole(matchId,m.home,"forwards");
 renderScorerRole(matchId,m.away,"forwards");
}
function renderScorerRole(matchId, teamName, role){
 const id=`scorerPlayers-${matchId}-${teamName.replaceAll(" ","_")}`;
 const box=$(id);
 if(!box) return;
 const players=playersByRole(teamName,role);
 box.innerHTML=players.map(p=>`<button onclick="DYP.selectScorer('${matchId}','${teamName}','${p.replaceAll("'","\\'")}')">${p}</button>`).join("");
}
function selectScorer(matchId, teamName, player){
 selectedScorers[matchId]={team:teamName, player};
 const el=$(`selected-scorer-${matchId}`);
 if(el) el.innerHTML=`<span class="selectedScorer">Scorer: ${player} · ${teamName}</span>`;
 closeScorerPicker();
}
function closeScorerPicker(){
 $("scorerPickerPanel").innerHTML="";
}


function resultOfMatch(m){
 if(m.scoreHome===null || m.scoreAway===null) return null;
 if(m.scoreHome>m.scoreAway) return "1";
 if(m.scoreHome<m.scoreAway) return "2";
 return "X";
}
function simulatedMatchStatus(m){
 if(m.status==="complete") return "finished";
 // Demo live logic: mark first scheduled match of selected day as live.
 const dayMatches=matchesByDate(activeDate()).filter(x=>x.status!=="complete");
 if(dayMatches.length && dayMatches[0].id===m.id) return "live";
 return "scheduled";
}
function scorerHasScored(match, scorer){
 if(!scorer) return null;
 if(match.status!=="complete" && simulatedMatchStatus(match)!=="live") return null;
 return (match.scorers||[]).some(s=>s.player===scorer.player && s.team===scorer.team);
}
function evaluatePick(match,pick){
 const status=simulatedMatchStatus(match);
 const actual=resultOfMatch(match);
 const resultCorrect=actual ? pick.prediction===actual : null;
 const scorerCorrect=scorerHasScored(match,pick.scorer);
 return {status,actual,resultCorrect,scorerCorrect};
}
function makeDemoCard(){
 return {matchday:activeDate(),picks:collectPicks(),createdAt:new Date().toISOString()};
}
function renderLiveCardStatus(containerId, card, label){
 const box=$(containerId);
 if(!box) return;
 if(!card){
   box.innerHTML=`<p class="muted">No ${label} card published yet. Create a card to track live status.</p>`;
   return;
 }
 const rows=card.picks.map(p=>{
   const m=DATA.matches.find(x=>x.id===p.matchId);
   if(!m) return "";
   const ev=evaluatePick(m,p);
   const cls=ev.resultCorrect===true?"correct":ev.resultCorrect===false?"wrong":ev.status==="live"?"live":"";
   const resultText=ev.actual?`Final result: ${ev.actual}`:ev.status==="live"?"Match live":"Not started";
   const scorerText=p.scorer ? `${p.scorer.player} · ${p.scorer.team}` : "No scorer selected";
   const scorerClass=ev.scorerCorrect===true?"green":ev.scorerCorrect===false?"red":"";
   const resultClass=ev.resultCorrect===true?"green":ev.resultCorrect===false?"red":ev.status==="live"?"blue":"";
   return `<div class="livePickRow ${cls}">
    <div class="livePickMain">
      <strong>${team(m.home).flag} ${m.home} vs ${team(m.away).flag} ${m.away}</strong>
      <p class="muted">${m.matchday} · ${m.time} · ${ev.status.toUpperCase()}</p>
      <div class="livePickMeta">
        <span class="liveTag ${resultClass}">Pick: ${p.prediction} · ${resultText}</span>
        <span class="liveTag ${scorerClass}">Scorer: ${scorerText}${ev.scorerCorrect===true?" · scored":ev.scorerCorrect===false?" · no goal":""}</span>
      </div>
    </div>
    <div class="liveScoreBox">${m.scoreHome ?? "-"} : ${m.scoreAway ?? "-"}</div>
   </div>`;
 }).join("");
 const finished=card.picks.every(p=>simulatedMatchStatus(DATA.matches.find(m=>m.id===p.matchId))==="finished");
 box.innerHTML=rows+`<div class="matchdaySettlementBox"><strong>${finished?"Matchday complete":"Matchday not complete yet"}</strong><p class="muted">${finished?"Final DYP Points can now be settled for global and private league rankings.":"Live status is shown now, but rankings update only after the whole matchday is complete."}</p></div>`;
}
function refreshAllLiveCards(){
 renderLiveCardStatus("globalCardStatus", demoGlobalCard, "global");
 renderLiveCardStatus("leagueLiveCardStatus", demoLeagueCard, "league");
}
function publishDemoGlobalCard(){
 demoGlobalCard=makeDemoCard();
 refreshAllLiveCards();
}
function publishDemoLeagueCard(){
 demoLeagueCard=makeDemoCard();
 refreshAllLiveCards();
}

function init(){
 renderLanguages(); renderAvatars(); renderMatchdaySelect(); renderMatchday(); renderTeamSelect(); renderTeamProfile(); renderAnalytics(); renderBadges(); renderLeaderboard(); renderAdminSelect(); renderLocalLeagues(); refreshAllLiveCards(); attachChartClick(); loadLiveData();
}
document.addEventListener("DOMContentLoaded",init);

function toggleMobileMenu(){
 document.body.classList.toggle("mobileMenuOpen");
}
document.addEventListener("click", function(e){
 if(e.target.closest(".nav a")) document.body.classList.remove("mobileMenuOpen");
});

return {scrollTo,toggleLanguage,setLanguage,toggleMobileMenu,openScorerPicker,renderScorerRole,selectScorer,closeScorerPicker,publishDemoGlobalCard,publishDemoLeagueCard,refreshAllLiveCards,loadLiveData,selectAvatar,syncOutcomes,renderMatchday,renderTeamProfile,renderAnalytics,openPublicProfile,collectPicks,setMessage,avatarIcon};
})();
