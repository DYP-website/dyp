/*
DYP API CONNECTORS — football-data.org bridge

This file uses:
config.js → window.DYP_LIVE_API.footballData.token

If the token is missing or the API fails, the site keeps using fallback data.
*/

window.DYP_API = {
  async footballDataRequest(endpoint) {
    const cfg = window.DYP_LIVE_API?.footballData;

    if (!cfg || !cfg.enabled || !cfg.token || cfg.token === "PASTE_YOUR_TOKEN_HERE") {
      console.warn("Football-data API token missing. Using fallback data.");
      return null;
    }

    try {
      const response = await fetch(`${cfg.baseUrl}${endpoint}`, {
        headers: { "X-Auth-Token": cfg.token }
      });

      if (!response.ok) {
        console.warn("Football-data API error:", response.status, response.statusText);
        return null;
      }

      return await response.json();
    } catch (err) {
      console.warn("Football-data fetch failed. Possible CORS/network issue:", err);
      return null;
    }
  },

  async fetchWorldCupMatches() {
    const cfg = window.DYP_LIVE_API?.footballData;
    const data = await this.footballDataRequest(`/competitions/${cfg?.competitionCode || "WC"}/matches`);
    return data?.matches || null;
  },

  async fetchWorldCupTeams() {
    const cfg = window.DYP_LIVE_API?.footballData;
    const data = await this.footballDataRequest(`/competitions/${cfg?.competitionCode || "WC"}/teams`);
    return data?.teams || null;
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
