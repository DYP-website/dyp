/*
DYP API CONNECTORS — FREE-FIRST STRATEGY

Reads config.js:
window.DYP_LIVE_API.footballData.token

If API fails, the website keeps using local demo data.
*/

window.DYP_API = {
  async footballDataRequest(endpoint) {
    const cfg = window.DYP_LIVE_API?.footballData;

    if (!cfg || !cfg.enabled || !cfg.token || cfg.token === "PASTE_YOUR_TOKEN_HERE") {
      console.warn("Football-data API token missing. Using fallback data.");
      return null;
    }

    const response = await fetch(`${cfg.baseUrl}${endpoint}`, {
      headers: {
        "X-Auth-Token": cfg.token
      }
    });

    if (!response.ok) {
      console.warn("Football-data API error:", response.status, response.statusText);
      return null;
    }

    return await response.json();
  },

  async fetchWorldCupMatches() {
    const cfg = window.DYP_LIVE_API?.footballData;
    const data = await this.footballDataRequest(`/competitions/${cfg?.competitionCode || "WC"}/matches`);
    return data?.matches || window.DYP_DATA.matches;
  },

  async fetchWorldCupTeams() {
    const cfg = window.DYP_LIVE_API?.footballData;
    const data = await this.footballDataRequest(`/competitions/${cfg?.competitionCode || "WC"}/teams`);
    return data?.teams || window.DYP_DATA.teams;
  },

  async fetchWorldCupStandings() {
    const cfg = window.DYP_LIVE_API?.footballData;
    const data = await this.footballDataRequest(`/competitions/${cfg?.competitionCode || "WC"}/standings`);
    return data?.standings || null;
  },

  async testFootballData() {
    const cfg = window.DYP_LIVE_API?.footballData;
    const data = await this.footballDataRequest(`/competitions/${cfg?.competitionCode || "WC"}/matches`);
    console.log("DYP Football-data test:", data);
    return data;
  }
};
