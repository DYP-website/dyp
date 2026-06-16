/*
DYP API CONNECTORS — FREE-FIRST STRATEGY

This file is ready for future free API keys.

What you will do later:
1. Create free API account.
2. Paste the API key below.
3. Set enabled: true.
4. The app can be extended to fetch data from the connector and fall back to demo data.

IMPORTANT:
- GitHub Pages is static. It cannot safely hide private API keys.
- For serious production, use Firebase Cloud Functions as a proxy.
- For the free MVP, use demo/admin data first, then cache API data in Firebase.
*/

window.DYP_API_CONFIG = {
  footballData: {
    enabled: false,
    apiKey: "PASTE_FREE_KEY_HERE",
    notes: "Use for fixtures, standings, teams when available."
  },
  oddsApi: {
    enabled: false,
    apiKey: "PASTE_FREE_KEY_HERE",
    notes: "Use for odds with strict free request limits."
  }
};

window.DYP_API = {
  async fetchFixturesFallback() {
    return window.DYP_DATA.matches;
  },
  async fetchTeamsFallback() {
    return window.DYP_DATA.teams;
  }
};
