// ---------------------------------------------------------------------------
// Bethel Announcements — Steward Form configuration (TEMPLATE)
//
// Copy this file to `config.js` and set owner/repo for your data repo.
//
// IMPORTANT: do NOT put the GitHub token here. Pages serves this file publicly
// and GitHub auto-revokes any PAT committed to a public repo. The token is
// instead stored once in the steward's browser (localStorage) via a one-time
// setup link of the form:   <form-url>/#t=<THE_TOKEN>
// Opening that link saves the token on the device and strips it from the URL.
// ---------------------------------------------------------------------------
window.GITHUB_CONFIG = {
  owner:  "your-github-username",
  repo:   "bethel-kwadaso-announcements",
  branch: "main",
  path:   "data/latest.json",
  imagesDir: "data/images",
};
