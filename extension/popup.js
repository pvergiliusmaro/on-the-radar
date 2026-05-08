// popup.js — UI logic for the Track Company extension (v2.0)
// All Sheets API and auth calls go through background.js via sendMessage

function send(message) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(message, resolve);
  });
}

function cleanCompanyName(title, url) {
  if (!title || title.trim() === "") {
    try {
      const domain = new URL(url).hostname.replace("www.", "");
      return domain.split(".")[0].replace(/\b\w/g, c => c.toUpperCase());
    } catch { return ""; }
  }
  for (const sep of [" | ", " - ", " – ", " — ", ":"]) {
    if (title.includes(sep)) {
      const name = title.split(sep)[0].trim();
      if (name) return name;
    }
  }
  const filler = ["Welcome to ", "Home - ", "Home | "];
  for (const phrase of filler) {
    if (title.startsWith(phrase)) return title.slice(phrase.length).trim();
  }
  const result = title.trim();
  // If result is too long, it's probably a tagline not a company name — use domain instead
  if (result.length > 30) {
   try {
      const domain = new URL(url).hostname.replace("www.", "");
      return domain.split(".")[0].replace(/\b\w/g, c => c.toUpperCase());
    } catch { return result; }
}
return result;
}

function showView(id) {
  document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

function setStatus(message, type = "") {
  const el = document.getElementById("status");
  if (el) { el.textContent = message; el.className = "status " + type; }
}

// ── Init ──────────────────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", async () => {
  showView("view-loading");

  // Check auth status
  const status = await send({ type: "GET_STATUS" });

  if (!status.authenticated) {
    showView("view-signin");
    setupSignInView();
  } else {
    await setupTrackView(status.spreadsheetId);
  }
});

// ── Sign-in view ──────────────────────────────────────────────────────────────

function setupSignInView() {
  document.getElementById("signin-btn").addEventListener("click", async () => {
    const btn = document.getElementById("signin-btn");
    btn.disabled = true;
    btn.textContent = "Connecting...";

    const result = await send({ type: "SIGN_IN" });

    if (result.error) {
      btn.disabled = false;
      btn.textContent = "Connect to Google";
      document.getElementById("status-signin").textContent = "❌ " + result.error;
      document.getElementById("status-signin").className = "status error";
      return;
    }

    // Set up sheet if needed
    if (!result.hasSheet) {
      btn.textContent = "Creating your sheet...";
      await send({ type: "SETUP_SHEET" });
    }

    await setupTrackView(null);
  });
}

// ── Track view ────────────────────────────────────────────────────────────────

async function setupTrackView(existingSheetId) {
  showView("view-track");

  // Get sheet URL for the link
  const stored = await chrome.storage.local.get("spreadsheetId");
  const sheetId = existingSheetId || stored.spreadsheetId;

  if (sheetId) {
    const sheetUrl = `https://docs.google.com/spreadsheets/d/${sheetId}`;
    const link = document.getElementById("sheet-link");
    link.href = sheetUrl;
    link.addEventListener("click", (e) => {
      e.preventDefault();
      chrome.tabs.create({ url: sheetUrl });
    });
  }

  // Get current tab
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    const url = tab.url || "";
    const title = tab.title || "";

    // Show domain preview
    try {
      const domain = new URL(url).hostname.replace("www.", "");
      document.getElementById("url-preview").textContent = domain;
    } catch {
      document.getElementById("url-preview").textContent = url;
    }

    // Pre-fill company name
    const guessedName = cleanCompanyName(title, url);
    const nameInput = document.getElementById("company-name");
    nameInput.value = guessedName;
    nameInput.select();

    // Add button
    document.getElementById("add-btn").addEventListener("click", async () => {
      const companyName = nameInput.value.trim();
      if (!companyName) {
        setStatus("Please enter a company name.", "error");
        return;
      }

      const addBtn = document.getElementById("add-btn");
      addBtn.disabled = true;
      setStatus("Adding...");

      const result = await send({ type: "ADD_COMPANY", companyName, url });

      if (result.error) {
        setStatus("❌ " + result.error, "error");
        addBtn.disabled = false;
      } else if (result.duplicate) {
        setStatus(`⚠️ ${result.companyName} is already in your tracker.`, "warning");
        addBtn.disabled = false;
      } else {
        setStatus(`✅ ${result.companyName} added!`, "success");
        addBtn.disabled = false;
      }
    });

    // Enter key submits
    document.getElementById("company-name").addEventListener("keydown", (e) => {
      if (e.key === "Enter") document.getElementById("add-btn").click();
    });
  });

  // Sign out
  document.getElementById("signout-btn").addEventListener("click", async () => {
    await send({ type: "SIGN_OUT" });
    showView("view-signin");
    setupSignInView();
  });
}
