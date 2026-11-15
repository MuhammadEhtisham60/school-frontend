function escapeHtml(val) {
  return String(val ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function sanitizeFilename(str) {
  return String(str || "export")
    .trim()
    .replace(/[^a-zA-Z0-9_-]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

/**
 * Downloads an Excel-compatible .xls file from structured headers and rows.
 */
export function downloadExcelFile({
  filename = "export",
  sheetName = "Sheet1",
  title = "",
  headers = [],
  rows = [],
}) {
  const safeSheet = escapeHtml(sheetName.slice(0, 31) || "Sheet1");
  const titleRow = title
    ? `<tr><th colspan="${Math.max(headers.length, 1)}" style="font-size:14px;font-weight:bold;text-align:left;padding:8px;background:#1e293b;color:#ffffff;">${escapeHtml(title)}</th></tr>`
    : "";

  const headerRow = headers.length
    ? `<tr>${headers
        .map(
          (h) =>
            `<th style="font-weight:bold;text-align:left;padding:6px 8px;background:#e2e8f0;border:1px solid #cbd5e1;">${escapeHtml(h)}</th>`
        )
        .join("")}</tr>`
    : "";

  const bodyRows = rows
    .map(
      (row) =>
        `<tr>${row
          .map(
            (cell) =>
              `<td style="padding:5px 8px;border:1px solid #cbd5e1;vertical-align:top;">${escapeHtml(cell)}</td>`
          )
          .join("")}</tr>`
    )
    .join("");

  const html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:x="urn:schemas-microsoft-com:office:excel"
          xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="UTF-8" />
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>${safeSheet}</x:Name>
                <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
      </head>
      <body>
        <table>
          <thead>
            ${titleRow}
            ${headerRow}
          </thead>
          <tbody>
            ${bodyRows}
          </tbody>
        </table>
      </body>
    </html>
  `.trim();

  const blob = new Blob(["\uFEFF", html], {
    type: "application/vnd.ms-excel;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${sanitizeFilename(filename)}.xls`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
