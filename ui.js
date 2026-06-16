window.DYP = (function(){
const DATA = window.DYP_DATA;
let selectedAvatar = "captain";
let formPoints = [];

const LANGS = [
 ["en","🇬🇧 English"],["es","🇪🇸 Español"],["fr","🇫🇷 Français"],["de","🇩🇪 Deutsch"],
 ["it","🇮🇹 Italiano"],["pt","🇵🇹 Português"],["nl","🇳🇱 Nederlands"],["ja","🇯🇵 日本語"]
];

const I18N = {
 en:{language:"Language",publishCard:"Publish card",heroLead:"Publish your daily prediction card before kickoff. Win national badges. Climb the ranking.",createCard:"Create today’s card",viewMatchday:"View matchday"},
 it:{language:"Lingua",publishCard:"Pubblica schedina",heroLead:"Pubblica la tua schedina prima del calcio d’inizio. Vinci badge nazionali. Scala il ranking.",createCard:"Crea schedina",viewMatchday:"Vedi giornata"},
 es:{language:"Idioma",publishCard:"Publicar",heroLead:"Publica tu pronóstico antes del inicio. Gana insignias nacionales y sube en el ranking.",createCard:"Crear tarjeta",viewMatchday:"Ver jornada"},
 fr:{language:"Langue",publishCard:"Publier",heroLead:"Publie ta carte avant le coup d’envoi. Gagne des badges nationaux.",createCard:"Créer la carte",viewMatchday:"Voir journée"},
 de:{language:"Sprache",publishCard:"Veröffentlichen",heroLead:"Veröffentliche deine Tageskarte vor dem Anstoß und sammle Badges.",createCard:"Karte erstellen",viewMatchday:"Spieltag ansehen"},
 pt:{language:"Idioma",publishCard:"Publicar",heroLead:"Publica a tua previsão antes do início. Ganha badges nacionais.",createCard:"Criar cartão",viewMatchday:"Ver jornada"},
 nl:{language:"Taal",publishCard:"Publiceren",heroLead:"Publiceer je dagelijkse voorspelling vóór de aftrap. Win nationale badges en klim in de ranking.",createCard:"Maak kaart",viewMatchday:"Bekijk speeldag"},
 ja:{language:"言語",publishCard:"カード公開",heroLead:"キックオフ前に毎日の予想カードを公開。国別バッジを獲得し、ランキングを上げよう。",createCard:"今日のカード作成",viewMatchday:"試合日を見る"}
};

function $(id){return document.getElementById(id)}
function scrollTo(id){$(id)?.scrollIntoView({behavior:"smooth",block:"start"})}
function team(name){return DATA.teams.find(t=>t.name===name)||{name,flag:"🏳️",group:"-",ranking:"-",squad:[]}}
function activeDate(){return $("matchdaySelect")?.value || DATA.matches[0]?.matchday}
function matchesByDate(d){return DATA.matches.filter(m=>m.matchday===d)}
function setMessage(id,text,color){const el=$(id); if(el){el.textContent=text; el.style.color=color||"#111827"}}

function renderLanguages(){
 const menu=$("languageMenu"); if(!menu)return;
 menu.innerHTML=LANGS.map(([code,label])=>`<button onclick="DYP.setLanguage('${code}')">${label}</button>`).join("");
 setLanguage(localStorage.getItem("dyp_lang")||"en");
}
function toggleLanguage(){$("languageMenu")?.classList.toggle("open")}
function setLanguage(lang){
 localStorage.setItem("dyp_lang",lang);
 const t=I18N[lang]||I18N.en;
 if($("languageLabel"))$("languageLabel").textContent=t.language;
 document.querySelectorAll("[data-i18n]").forEach(el=>{const k=el.dataset.i18n;if(t[k])el.textContent=t[k]});
 document.querySelector(".publishBtn").textContent=t.publishCard;
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
 renderPredictionList();
}
function renderPredictionList(){
 $("predictionList").innerHTML=matchesByDate(activeDate()).map(m=>`
  <div class="predictionRow" data-id="${m.id}">
    <div><strong>${team(m.home).flag} ${m.home} vs ${team(m.away).flag} ${m.away}</strong><p class="muted">${m.matchday} · ${m.time}</p></div>
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
  return {matchId:m.id,home:m.home,away:m.away,prediction:row.querySelector("input:checked").value};
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
 $("badgeCollection").innerHTML=DATA.teams.map(t=>`<div class="badgeItem"><div class="flagBadge">${t.flag}</div><strong>${t.name}</strong><p class="muted">Locked</p></div>`).join("");
}
function renderLeaderboard(){
 $("leaderboard").innerHTML=`<div class="leaderboardRow"><strong>#</strong><strong>Player</strong><strong>Cards</strong><strong>Badges</strong></div><div class="leaderboardRow"><span>01</span><span>@worldcuporacle</span><span>0</span><span>0</span></div><div class="leaderboardRow"><span>02</span><span>@captainvision</span><span>0</span><span>0</span></div>`;
}
function renderAdminSelect(){
 const sel=$("adminMatchSelect"); if(!sel)return;
 sel.innerHTML=DATA.matches.map(m=>`<option value="${m.id}">${m.matchday} · ${m.home} vs ${m.away}</option>`).join("");
}

function init(){
 renderLanguages(); renderAvatars(); renderMatchdaySelect(); renderMatchday(); renderTeamSelect(); renderTeamProfile(); renderAnalytics(); renderBadges(); renderLeaderboard(); renderAdminSelect(); attachChartClick();
}
document.addEventListener("DOMContentLoaded",init);

function toggleMobileMenu(){
 document.body.classList.toggle("mobileMenuOpen");
}
document.addEventListener("click", function(e){
 if(e.target.closest(".nav a")) document.body.classList.remove("mobileMenuOpen");
});

return {scrollTo,toggleLanguage,setLanguage,toggleMobileMenu,selectAvatar,syncOutcomes,renderMatchday,renderTeamProfile,renderAnalytics,collectPicks,setMessage,avatarIcon};
})();
