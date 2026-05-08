// background.js — handles Google OAuth and Sheets API calls
// Runs as a service worker, called from popup.js via chrome.runtime.sendMessage

const SHEET_NAME = "Company Tracker";
const COLUMNS = [
  "Date Added",
  "Company Name",
  "URL",
  "Industry",
  "Size / Stage",
  "Growth Indicators",
  "Priority for Follow Up",
  "Notes"
];

// ── Auth ──────────────────────────────────────────────────────────────────────

async function getAuthToken(interactive = true) {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive }, (token) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(token);
      }
    });
  });
}

async function signOut() {
  return new Promise((resolve) => {
    chrome.identity.getAuthToken({ interactive: false }, (token) => {
      if (token) {
        chrome.identity.removeCachedAuthToken({ token }, () => {
          fetch(`https://accounts.google.com/o/oauth2/revoke?token=${token}`);
          resolve(true);
        });
      } else {
        resolve(false);
      }
    });
  });
}

// ── Sheets API helpers ────────────────────────────────────────────────────────

async function sheetsRequest(token, method, path, body = null) {
  const opts = {
    method,
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets${path}`, opts);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Sheets API error ${res.status}`);
  }
  return res.json();
}

// ── Sheet setup ───────────────────────────────────────────────────────────────

async function createSheet(token) {
  const sheet = await sheetsRequest(token, "POST", "", {
    properties: { title: SHEET_NAME },
    sheets: [
      { properties: { title: "Company List", index: 0 } },
      { properties: { title: "Signal Archive", index: 1 } }
    ]
  });

  const spreadsheetId = sheet.spreadsheetId;
  const companyListSheetId = sheet.sheets[0].properties.sheetId;
  const signalArchiveSheetId = sheet.sheets[1].properties.sheetId;

  // Write headers
  await sheetsRequest(token, "PUT",
    `/${spreadsheetId}/values/Company%20List!A1:H1?valueInputOption=USER_ENTERED`,
    { values: [COLUMNS] }
  );

  await sheetsRequest(token, "PUT",
    `/${spreadsheetId}/values/Signal%20Archive!A1:C1?valueInputOption=USER_ENTERED`,
    { values: [["Date", "Company Name", "Signal"]] }
  );

  // Format: bold headers, freeze row 1, priority dropdown
  await sheetsRequest(token, "POST", `/${spreadsheetId}:batchUpdate`, {
    requests: [
      {
        updateSheetProperties: {
          properties: { sheetId: companyListSheetId, gridProperties: { frozenRowCount: 1 } },
          fields: "gridProperties.frozenRowCount"
        }
      },
      {
        updateSheetProperties: {
          properties: { sheetId: signalArchiveSheetId, gridProperties: { frozenRowCount: 1 } },
          fields: "gridProperties.frozenRowCount"
        }
      },
      {
        setDataValidation: {
          range: { sheetId: companyListSheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: 6, endColumnIndex: 8 },
          rule: {
            condition: {
              type: "ONE_OF_LIST",
              values: [
                { userEnteredValue: "High" },
                { userEnteredValue: "Medium" },
                { userEnteredValue: "Low" },
                { userEnteredValue: "Reject/NA" }
              ]
            },
            showCustomUi: true,
            strict: false
          }
        }
      }
    ]
  });

  return spreadsheetId;
}

async function getOrCreateSheet(token) {
  const stored = await chrome.storage.local.get("spreadsheetId");
  if (stored.spreadsheetId) {
    try {
      await sheetsRequest(token, "GET", `/${stored.spreadsheetId}?fields=spreadsheetId`);
      return stored.spreadsheetId;
    } catch {
      // Sheet deleted or inaccessible — create a new one
    }
  }
  const spreadsheetId = await createSheet(token);
  await chrome.storage.local.set({ spreadsheetId });
  return spreadsheetId;
}

// ── Company operations ────────────────────────────────────────────────────────

async function getExistingCompanies(token, spreadsheetId) {
  const res = await sheetsRequest(token, "GET",
    `/${spreadsheetId}/values/Company%20List!A:A`
  );
  const values = res.values || [];
  return values.slice(1).map(row => (row[0] || "").toLowerCase());
}

async function addCompany(token, spreadsheetId, companyName, url) {
  const today = new Date().toLocaleDateString("en-US", {
    year: "2-digit", month: "2-digit", day: "2-digit"
  }).replace(/\//g, "-");

  const newRow = [
    today,
    companyName,
    url
  ];

  await sheetsRequest(token, "POST",
    `/${spreadsheetId}/values/Company%20List!A:C:append?valueInputOption=RAW&insertDataOption=OVERWRITE`,
    { values: [newRow] }
  );
}

// ── Message handler ───────────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message).then(sendResponse).catch(err => {
    sendResponse({ error: err.message });
  });
  return true;
});

async function handleMessage(message) {
  switch (message.type) {

    case "GET_STATUS": {
      try {
        const token = await getAuthToken(false);
        const stored = await chrome.storage.local.get("spreadsheetId");
        return {
          authenticated: true,
          hasSheet: !!stored.spreadsheetId,
          spreadsheetId: stored.spreadsheetId
        };
      } catch {
        return { authenticated: false, hasSheet: false };
      }
    }

    case "SIGN_IN": {
      const token = await getAuthToken(true);
      const stored = await chrome.storage.local.get("spreadsheetId");
      return {
        authenticated: true,
        hasSheet: !!stored.spreadsheetId,
        spreadsheetId: stored.spreadsheetId
      };
    }

    case "SIGN_OUT": {
      await signOut();
      await chrome.storage.local.remove(["spreadsheetId"]);
      return { success: true };
    }

    case "SETUP_SHEET": {
      const token = await getAuthToken(false);
      const spreadsheetId = await getOrCreateSheet(token);
      const sheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;
      return { success: true, spreadsheetId, sheetUrl };
    }

    case "ADD_COMPANY": {
      const { companyName, url } = message;
      const token = await getAuthToken(false);
      const spreadsheetId = await getOrCreateSheet(token);

      const existing = await getExistingCompanies(token, spreadsheetId);
      if (existing.includes(companyName.toLowerCase())) {
        return { duplicate: true, companyName };
      }

      try {
        await addCompany(token, spreadsheetId, companyName, url);
      } catch (e) {
        return { error: "addCompany failed: " + e.message };
      }

      const sheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;
      return { success: true, companyName, sheetUrl };
    }

    default:
      return { error: "Unknown message type" };
  }
}