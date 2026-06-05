# DYP – MVP Website v4 Profile Avatars

Nuova versione del sito DYP con:
- Sezione Sign up demo
- Login visuale con Google, Apple, Facebook, Email
- Scelta username
- Scelta avatar animale stilizzato
- Profilo utente con rating, title, streak, badge
- Rimozione reward dalla homepage
- Sezione "When attention becomes value" trasformata in vision
- Market, Portfolio, Analytics e Methodology mantenuti

## Come aprire
Apri `index.html` nel browser.

## Nota
È ancora un MVP statico gratuito: non salva utenti online e non usa backend.


## v5 Multilanguage
Aggiunto selettore lingua statico:
- Italiano
- English
- Português
- Español
- Français
- Deutsch
- 中文

Il cambio lingua usa JavaScript e localStorage. Non richiede backend.


## v6 Navigation + Portfolio
- Navbar rimodulata:
  - Sign Up
  - Market con sottovoci Overview / Analytics / Methodology
  - Brands con sottovoci All Brands / Top Gainers / Top Losers / Sectors
  - Portfolios con sottovoci My Portfolio / Leaderboard / Badge Cabinet
  - Profile
- Aggiunta sezione Brand Universe con oltre 20 brand.
- Aggiunto My Portfolio dentro Profile.
- Incluso file logo SVG: DYP_logo.svg.


## v7 Language Pill
- Sostituito il vecchio select lingua con un pallino pulito in alto a destra.
- Aggiunte bandierine per: IT, EN, PT, ES, FR, DE, ZH.
- Dropdown compatto vicino al bottone Create Profile.


## v8 Clean Signup + Avatars
- Aggiunta label vicino al pallino lingua.
- Rimossa strip centrale Create profile / Choose avatar / Publish prediction.
- Rimossa completamente la possibilità di accesso con Google, Apple e Facebook.
- Sign up solo con username, email, password.
- Ridisegnati avatar SVG con linee più sottili e stile più pulito.


## v9 Hero + Language consistency
- Home iniziale con DYP dominante.
- Testo hero ridotto e più diretto.
- Card market con barre verdi/rosse coerenti con il sito.
- Migliorata traduzione dinamica di avatar, messaggi e testi principali.


## v10 Avatar visibility fix
- Avatar resi sempre visibili usando icone animali grandi dentro card minimal.
- Rimossa dipendenza da SVG complessi che potevano non renderizzarsi correttamente.


## v11 Definitive avatar fix
- Avatar renderizzati con HTML/CSS puro, non SVG e non emoji.
- Fallback già presente nel markup.
- Funzioni avatar sovrascritte a fine JS per evitare conflitti con versioni precedenti.


## v12 Premium Avatars
- Signup ridisegnata come mockup premium.
- Avatar sostituiti con SVG illustrati e colorati in stile dark fintech.
- Nuovi animali: Owl, Fox, Wolf, Cat, Eagle, Bull, Dolphin, Panther.
- Profilo aggiorna l’avatar selezionato.


## v13 Final Profile Publish
- Logo header: solo DYP grande, senza riquadro; Did You Publish? piccolo sotto.
- Rimossa scritta Fantasy Marketing Exchange dall'header.
- Avatar premium resi visibili tramite file SVG in /avatars.
- In alto a destra: Publish prima, Language dopo.
- Bottone Publish diventa Published dopo pubblicazione card.


## v16 Free Firebase Ready
- Firebase Auth ready
- Firestore user/portfolio saving ready
- Demo fallback active
- Admin dashboard
- Leaderboard
- See FIREBASE_SETUP.md
