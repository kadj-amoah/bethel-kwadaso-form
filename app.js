/* =========================================================================
 * Bethel Announcements — Steward Form logic
 * Pure vanilla JS. Works offline until submit (submit needs internet to
 * reach the GitHub API). Builds latest.json and PUTs it to the data repo.
 * ========================================================================= */
(function () {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ----------------------------- Header dates ---------------------------- */
  const dateInput = $("#date");

  function nthSundayOfMonth(d) {
    // Which Sunday-of-the-month is this date's week? Count Sundays up to/incl. d.
    return Math.floor((d.getDate() - 1) / 7) + 1;
  }
  function sundayOfYear(d) {
    // Ordinal of this Sunday among Sundays of the year.
    const jan1 = new Date(d.getFullYear(), 0, 1);
    const firstSundayOffset = (7 - jan1.getDay()) % 7; // days until first Sunday
    const firstSunday = new Date(d.getFullYear(), 0, 1 + firstSundayOffset);
    if (d < firstSunday) return 0;
    return Math.floor((d - firstSunday) / (7 * 86400000)) + 1;
  }

  function refreshDateReadouts() {
    const v = dateInput.value;
    if (!v) { $("#sunday_of_month").textContent = "—"; $("#sunday_of_year").textContent = "—"; return; }
    const d = new Date(v + "T00:00:00");
    $("#sunday_of_month").textContent = nthSundayOfMonth(d);
    $("#sunday_of_year").textContent = sundayOfYear(d);
  }

  // Default to the upcoming (or today's) Sunday.
  (function setDefaultDate() {
    const t = new Date();
    const daysToSunday = (7 - t.getDay()) % 7; // 0 if today is Sunday
    const sunday = new Date(t.getFullYear(), t.getMonth(), t.getDate() + daysToSunday);
    dateInput.value = sunday.toISOString().slice(0, 10);
    refreshDateReadouts();
  })();
  dateInput.addEventListener("input", refreshDateReadouts);

  /* --------------------------- Attendance calc --------------------------- */
  const n = (id) => parseInt($("#" + id).value, 10) || 0;
  function refreshAttendance() {
    const am = n("adult_male"), af = n("adult_female");
    const ym = n("youth_male"), yf = n("youth_female");
    $("#total_male").textContent = am + ym;
    $("#total_female").textContent = af + yf;
    $("#total_adult").textContent = am + af;
    $("#total_youth").textContent = ym + yf;
    $("#total_attendance").textContent = am + af + ym + yf;
  }
  $$("[data-att]").forEach((el) => el.addEventListener("input", refreshAttendance));

  /* ----------------------------- Finance calc ---------------------------- */
  const f = (id) => parseFloat($("#" + id).value) || 0;
  function refreshFinance() {
    const total = f("tithe") + f("offering") + f("thanks_offering") + f("monthly_offering");
    $("#finance_total").textContent = total.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  $$("[data-fin]").forEach((el) => el.addEventListener("input", refreshFinance));

  /* ------------------------- Dynamic item lists -------------------------- */
  const itemTpl = $("#tpl-item");

  function addItem(listId, data) {
    const list = document.getElementById(listId);
    const node = itemTpl.content.firstElementChild.cloneNode(true);
    if (data) {
      $(".item-text", node).value = data.text || "";
      $(".item-dur", node).value = data.duration != null ? data.duration : 8;
      $(".item-auto", node).checked = data.auto_advance !== false;
    }
    list.appendChild(node);
    return node;
  }

  function readList(listId) {
    return $$(".item-row", document.getElementById(listId)).map((row) => {
      const text = $(".item-text", row).value.trim();
      const auto = $(".item-auto", row).checked;
      const dur = parseInt($(".item-dur", row).value, 10) || null;
      return { text, auto_advance: auto, duration: auto ? dur : null };
    }).filter((it) => it.text.length > 0);
  }

  // Delegated controls for every item list.
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    if (btn.dataset.add) { addItem(btn.dataset.add); return; }

    const row = btn.closest(".item-row");
    if (!row) return;
    if (btn.hasAttribute("data-remove")) { row.remove(); return; }
    if (btn.dataset.move === "up" && row.previousElementSibling) {
      row.parentNode.insertBefore(row, row.previousElementSibling);
    } else if (btn.dataset.move === "down" && row.nextElementSibling) {
      row.parentNode.insertBefore(row.nextElementSibling, row);
    }
  });

  /* ----------------------------- Bereavements ---------------------------- */
  const bTpl = $("#tpl-bereavement");
  const bList = $("#bereavements");

  function reindexBereavements() {
    $$(".bereavement", bList).forEach((fs, i) => { $(".b-index", fs).textContent = i + 1; });
  }
  function addBereavement(data) {
    const node = bTpl.content.firstElementChild.cloneNode(true);
    if (data) {
      $(".b-name", node).value = data.name || "";
      $(".b-relation", node).value = data.relation_info || "";
      $(".b-date", node).value = data.date || "";
      $(".b-state", node).value = data.laying_in_state || "";
      $(".b-burial", node).value = data.burial_venue || "";
      $(".b-rites", node).value = data.final_rites_venue || "";
      $(".b-autoadv", node).checked = !!data.auto_advance;
      $(".b-dur", node).value = data.duration != null ? data.duration : 12;
    }
    bList.appendChild(node);
    reindexBereavements();
  }
  $("#add-bereavement").addEventListener("click", () => addBereavement());
  bList.addEventListener("click", (e) => {
    if (e.target.closest(".b-remove")) {
      e.target.closest(".bereavement").remove();
      reindexBereavements();
    }
  });

  // Show a small preview + size hint when a photo is chosen.
  bList.addEventListener("change", (e) => {
    const input = e.target.closest(".b-photo-input");
    if (!input) return;
    const prev = $(".b-photo-preview", input.closest(".bereavement"));
    prev.innerHTML = "";
    const file = input.files && input.files[0];
    if (!file) return;
    const img = document.createElement("img");
    img.src = URL.createObjectURL(file);
    img.className = "b-thumb";
    img.onload = () => URL.revokeObjectURL(img.src);
    prev.appendChild(img);
  });

  function readBereavements() {
    return $$(".bereavement", bList).map((fs) => {
      const name = $(".b-name", fs).value.trim();
      const auto = $(".b-autoadv", fs).checked;
      const dur = parseInt($(".b-dur", fs).value, 10) || null;
      const val = (s) => { const v = $("." + s, fs).value.trim(); return v.length ? v : null; };
      const fileInput = $(".b-photo-input", fs);
      return {
        name,
        relation_info: val("b-relation"),
        date: val("b-date"),
        laying_in_state: val("b-state"),
        burial_venue: val("b-burial"),
        final_rites_venue: val("b-rites"),
        image_filename: null, // set during upload if a photo was chosen
        auto_advance: auto,
        duration: auto ? dur : null,
        _file: (fileInput && fileInput.files && fileInput.files[0]) || null,
      };
    }).filter((b) => b.name.length > 0);
  }

  /* -------------------- Image resize (client-side) --------------------- */
  function slugify(s) {
    return (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 50) || "photo";
  }

  // Downscale to <= maxDim on the longest side, return base64 JPEG (no prefix).
  function resizeToBase64(file, maxDim = 1200, quality = 0.85) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale), h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL("image/jpeg", quality).split(",")[1]);
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Could not read image")); };
      img.src = url;
    });
  }

  /* ------------------------ Build the JSON payload ------------------------ */
  function buildAnnouncementJSON() {
    const d = dateInput.value;
    return {
      meta: {
        date: d,
        sunday_of_month: d ? nthSundayOfMonth(new Date(d + "T00:00:00")) : null,
        sunday_of_year: d ? sundayOfYear(new Date(d + "T00:00:00")) : null,
        preacher: $("#preacher").value.trim(),
        welcome_note: $("#welcome_note").value.trim(),
        submitted_at: new Date().toISOString(),
      },
      attendance: {
        adult_male: n("adult_male"), adult_female: n("adult_female"),
        youth_male: n("youth_male"), youth_female: n("youth_female"),
      },
      finance: {
        tithe: f("tithe"), offering: f("offering"),
        thanks_offering: f("thanks_offering"), monthly_offering: f("monthly_offering"),
      },
      weekly_program: readList("weekly_program"),
      special_program: readList("special_program"),
      announcements: readList("announcements"),
      bereavements: readBereavements(),
    };
  }

  /* --------------------------- GitHub API I/O ---------------------------- */
  const cfg = window.GITHUB_CONFIG;
  const contentsUrl = (path) =>
    `https://api.github.com/repos/${cfg.owner}/${cfg.repo}/contents/${path}`;

  function ghHeaders() {
    return {
      Authorization: `Bearer ${cfg.token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    };
  }

  // base64 that handles UTF-8 (church names / notes may contain non-ASCII).
  function utf8ToBase64(str) {
    return btoa(unescape(encodeURIComponent(str)));
  }

  async function getSHA(path) {
    const url = `${contentsUrl(path)}?ref=${encodeURIComponent(cfg.branch)}`;
    const r = await fetch(url, { headers: ghHeaders() });
    if (r.status === 404) return null; // doesn't exist yet — first write
    if (!r.ok) throw new Error(`Could not read ${path} (HTTP ${r.status})`);
    return (await r.json()).sha;
  }

  // Write base64 content to `path`. Fetches the current SHA first if needed.
  async function putContent(path, base64Content, message) {
    const sha = await getSHA(path);
    const body = { message, content: base64Content, branch: cfg.branch };
    if (sha) body.sha = sha;
    const r = await fetch(contentsUrl(path), {
      method: "PUT",
      headers: { ...ghHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!r.ok) {
      const detail = await r.json().catch(() => ({}));
      throw new Error(detail.message || `Write failed for ${path} (HTTP ${r.status})`);
    }
    return r.json();
  }

  // Upload any chosen bereavement photos; set each record's image_filename.
  async function uploadBereavementImages(bereavements) {
    const imagesDir = (cfg.imagesDir || "data/images").replace(/\/+$/, "");
    const usedNames = {};
    for (const b of bereavements) {
      if (!b._file) continue;
      let base = slugify(b.name);
      usedNames[base] = (usedNames[base] || 0) + 1;
      if (usedNames[base] > 1) base += "-" + usedNames[base];
      const filename = base + ".jpg";
      setStatus(`Uploading photo for ${b.name}…`);
      const b64 = await resizeToBase64(b._file);
      await putContent(`${imagesDir}/${filename}`, b64, `Bereavement photo: ${b.name}`);
      b.image_filename = filename;
    }
  }

  /* ------------------------------- Submit -------------------------------- */
  const form = $("#announcement-form");
  const statusEl = $("#status");
  const submitBtn = $("#submit-btn");

  function setStatus(msg, kind) {
    statusEl.textContent = msg;
    statusEl.className = "status" + (kind ? " " + kind : "");
  }

  function configReady() {
    return cfg && cfg.owner && cfg.token &&
      !cfg.owner.startsWith("your-") && !cfg.token.includes("xxxx");
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!configReady()) {
      setStatus("Form not configured: copy config.sample.js → config.js and fill in the GitHub details.", "err");
      return;
    }
    submitBtn.disabled = true;
    setStatus("Saving…");
    try {
      const data = buildAnnouncementJSON();
      // 1. Upload any chosen photos, stamping image_filename onto each record.
      await uploadBereavementImages(data.bereavements);
      // 2. Drop the transient File handles before serializing.
      data.bereavements = data.bereavements.map(({ _file, ...rest }) => rest);
      setStatus("Saving announcement…");
      const payload = JSON.stringify(data, null, 2);
      await putContent(cfg.path, utf8ToBase64(payload),
        `Announcement update — ${dateInput.value || "untitled"}`);
      setStatus("Announcement saved. ✓  The media team will have it on Sunday.", "ok");
    } catch (err) {
      console.error(err);
      setStatus("Could not save: " + err.message + " — check your internet and try again.", "err");
    } finally {
      submitBtn.disabled = false;
    }
  });

  /* --------------------- Seed one empty row per list --------------------- */
  ["weekly_program", "special_program", "announcements"].forEach((id) => addItem(id));
  refreshAttendance();
  refreshFinance();
})();
