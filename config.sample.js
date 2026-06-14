// ---------------------------------------------------------------------------
// Bethel Announcements — Steward Form configuration
//
// Copy this file to `config.js` (in the same folder) and fill in the values.
// `config.js` is what the form actually loads; keep `config.sample.js` as the
// reference template.
//
// SECURITY NOTE (from the design doc):
//   The fine-grained PAT below lives in client-side JavaScript. That is an
//   accepted risk for a church bulletin system: scope the token to ONLY the
//   announcements repo with `Contents: Read and Write`, and keep that repo
//   PRIVATE so the token isn't trivially discoverable via GitHub code search.
//   Worst case if leaked: someone can overwrite this week's announcement JSON.
// ---------------------------------------------------------------------------
window.GITHUB_CONFIG = {
  owner:  "your-github-username",            // GitHub account / org that owns the repo
  repo:   "bethel-kwadaso-announcements",    // the PRIVATE data repo (Repo B)
  branch: "main",                            // branch to write to
  path:   "data/latest.json",                // file the form overwrites each week
  imagesDir: "data/images",                  // bereavement photos are committed here
  token:  "github_pat_xxxxxxxxxxxxxxxxxxxx",  // fine-grained PAT, Contents R/W on this repo only
};
