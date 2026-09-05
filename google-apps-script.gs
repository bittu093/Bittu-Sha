/**
 * OPTIONAL: Log every registration to a Google Sheet.
 * The website itself needs no server — this is a free Google-hosted
 * script the OWNER deploys once. Takes about 5 minutes.
 *
 * SETUP:
 * 1. Go to https://sheets.new to create a fresh Google Sheet.
 *    Rename the first tab to "Registrations".
 * 2. In the Sheet, go to Extensions > Apps Script.
 * 3. Delete any starter code and paste this whole file in.
 * 4. Click Deploy > New deployment > select type "Web app".
 *      - Execute as: Me
 *      - Who has access: Anyone
 * 5. Click Deploy, authorize the permissions Google asks for.
 * 6. Copy the Web App URL it gives you.
 * 7. Paste that URL into CONFIG.GOOGLE_SHEET_ENDPOINT in script.js.
 * 8. Every form submission will now also append a row to this Sheet,
 *    which the owner can open or download anytime (File > Download).
 */

function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Registrations")
    || SpreadsheetApp.getActiveSpreadsheet().insertSheet("Registrations");

  // Add header row once
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "Timestamp", "Event ID", "Full Name", "Age", "Gender", "WhatsApp",
      "Email", "State", "Area", "Package", "Amount", "Transaction ID"
    ]);
  }

  const data = JSON.parse(e.postData.contents);

  sheet.appendRow([
    new Date(),
    data.id || "",
    data.fullName || "",
    data.age || "",
    data.gender || "",
    data.mobile || "",
    data.email || "",
    data.state || "",
    data.city || "",
    data.package || "",
    data.amount || "",
    data.txnId || ""
  ]);

  return ContentService.createTextOutput(JSON.stringify({ status: "ok" }))
    .setMimeType(ContentService.MimeType.JSON);
}
