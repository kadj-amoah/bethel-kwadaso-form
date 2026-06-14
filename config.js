// ---------------------------------------------------------------------------
// Bethel Announcements — Steward Form configuration
//
// NOTE: the GitHub token is NOT stored here. GitHub auto-revokes any PAT
// committed to a public repo, and Pages serves this file publicly. Instead the
// token is stored once in the steward's browser (localStorage) via a one-time
// setup link, and never lives in the repo. See app.js (getToken / setup link).
// ---------------------------------------------------------------------------
window.GITHUB_CONFIG = {
  owner:  "kadj-amoah",
  repo:   "bethel-kwadaso-announcements",
  branch: "main",
  path:   "data/latest.json",
  imagesDir: "data/images",
};
