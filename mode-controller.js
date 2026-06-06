// DYP mode controller.
// Plain non-module script: works from local file:// and GitHub Pages.

(function () {
  function setMode(mode) {
    document.body.setAttribute("data-mode", mode);
    if (mode === "landing") {
      localStorage.removeItem("dyp_mode");
    } else {
      localStorage.setItem("dyp_mode", mode);
    }
  }

  window.enterMode = function (mode) {
    if (mode !== "brand" && mode !== "football") return;

    setMode(mode);

    setTimeout(function () {
      var targetId = mode === "football" ? "football-fixtures" : "brand-market";
      var el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }, 50);
  };

  window.showLanding = function () {
    setMode("landing");
    setTimeout(function () {
      var el = document.getElementById("landing");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      else window.scrollTo({ top: 0, behavior: "smooth" });
    }, 50);
  };

  window.goToPublish = function () {
    var mode = document.body.getAttribute("data-mode") || localStorage.getItem("dyp_mode") || "brand";
    var targetId = mode === "football" ? "football-card" : "brand-card";
    var el = document.getElementById(targetId);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  window.scrollToId = function (id) {
    var el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  document.addEventListener("DOMContentLoaded", function () {
    // Always start on landing. User explicitly wants to choose first.
    setMode("landing");
  });
})();
