/**
 * PARIRIMBON MBG — Backend Google Sheet
 * ------------------------------------------------------------------
 * Cara pakai:
 * 1. Buka Google Sheet yang mau dipakai sebagai database.
 * 2. Menu Extensions > Apps Script.
 * 3. Hapus isi default, tempel semua isi file ini.
 * 4. Ganti nilai SECRET di bawah dengan kode rahasia bikinan sendiri.
 * 5. Deploy > New deployment > pilih tipe "Web app".
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 6. Salin URL Web App yang muncul (diakhiri /exec), itu untuk CONFIG.API_URL
 *    di index.html. SECRET di bawah harus sama dengan CONFIG.API_KEY.
 * ------------------------------------------------------------------
 */

const SHEET_NAME = 'entries';
const SECRET = 'GANTI_DENGAN_KODE_RAHASIA'; // WAJIB diganti, harus sama dengan CONFIG.API_KEY di index.html

const COLUMNS = ['id', 'tanggal', 'pendapatan', 'pengeluaran', 'budgetBiasa', 'budgetWL', 'catatan'];

function doGet(e) {
  try {
    if ((e.parameter.key || '') !== SECRET) {
      return jsonResponse({ error: 'unauthorized' });
    }
    const sheet = getSheet();
    return jsonResponse({ entries: readAll(sheet) });
  } catch (err) {
    return jsonResponse({ error: String(err) });
  }
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    if ((body.key || '') !== SECRET) {
      return jsonResponse({ error: 'unauthorized' });
    }
    const sheet = getSheet();
    const action = body.action;

    if (action === 'create') {
      const id = String(Date.now());
      sheet.appendRow([
        id, body.tanggal, num(body.pendapatan), num(body.pengeluaran),
        num(body.budgetBiasa), num(body.budgetWL), body.catatan || ''
      ]);
      return jsonResponse({ ok: true, id: id });
    }

    if (action === 'update') {
      const rowIndex = findRowById(sheet, body.id);
      if (rowIndex === -1) return jsonResponse({ error: 'not_found' });
      sheet.getRange(rowIndex, 1, 1, COLUMNS.length).setValues([[
        String(body.id), body.tanggal, num(body.pendapatan), num(body.pengeluaran),
        num(body.budgetBiasa), num(body.budgetWL), body.catatan || ''
      ]]);
      return jsonResponse({ ok: true });
    }

    if (action === 'delete') {
      const rowIndex = findRowById(sheet, body.id);
      if (rowIndex === -1) return jsonResponse({ error: 'not_found' });
      sheet.deleteRow(rowIndex);
      return jsonResponse({ ok: true });
    }

    return jsonResponse({ error: 'unknown_action' });
  } catch (err) {
    return jsonResponse({ error: String(err) });
  }
}

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(COLUMNS);
    // Kolom tanggal (B) dipaksa jadi teks biar tidak diubah otomatis jadi format Date oleh Sheets
    sheet.getRange('B:B').setNumberFormat('@');
  }
  return sheet;
}

function readAll(sheet) {
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  const headers = values[0];
  return values.slice(1)
    .filter(r => r[0] !== '' && r[0] !== null)
    .map(r => {
      const obj = {};
      headers.forEach((h, i) => { obj[h] = r[i]; });
      return obj;
    });
}

function findRowById(sheet, id) {
  const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0]) === String(id)) return i + 1;
  }
  return -1;
}

function num(v) {
  const n = parseFloat(v);
  return isNaN(n) ? 0 : n;
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
