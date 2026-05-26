/* eslint-disable @typescript-eslint/no-explicit-any */

import { format } from 'date-fns';

// Physical SPMB paper: 8.5" wide x 5.5" tall (landscape half-letter).
const PAGE_WIDTH_IN = 8.5;
const PAGE_HEIGHT_IN = 5.5;

const escapeHtml = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

const formatNumber = (num?: number | null): string => {
  if (num === null || num === undefined) return '0';
  return num.toLocaleString('id-ID');
};

const buildSpmbHtml = (spmbData: any): string => {
  const { shipment, deliveryOrder } = spmbData;

  const leftInfo: Array<[string, string]> = [
    ['No.', spmbData.code || ''],
    ['Tanggal', spmbData.createdAt ? format(new Date(spmbData.createdAt), 'dd/MM/yyyy') : ''],
    ['Kepada', deliveryOrder?.customer?.name || ''],
    ['No. Pengiriman', shipment?.shipmentNumber || ''],
    ['No. DO', deliveryOrder?.doNumber || ''],
  ];

  const rightInfo: Array<[string, string]> = [
    ['Plat Nomor', shipment?.armada?.plateNumber || shipment?.plateNumber || ''],
    ['Supir', shipment?.driver?.name || ''],
    ['Tally', shipment?.tally || ''],
    ['Keterangan', shipment?.internalNote || ''],
  ];

  const shipmentItemsForDO = (shipment?.shipmentItems ?? []).filter(
    (item: any) =>
      item.deliveryOrderId === spmbData.deliveryOrderId &&
      item.warehouseId === spmbData.warehouseId
  );

  const rows: string[] = shipmentItemsForDO.map((item: any) => {
    const cancelled = item.status === 'CANCELLED';
    const cls = cancelled ? ' class="cancelled"' : '';
    return `<tr${cls}>
        <td class="qty">${escapeHtml(formatNumber(item.requestedQuantity))}</td>
        <td>${escapeHtml(item.product?.name || '')}</td>
      </tr>`;
  });

  // Keep a minimum of 5 rows so the table matches the pre-printed form.
  const minRows = 5;
  while (rows.length < minRows) {
    rows.push('<tr><td class="qty">&nbsp;</td><td>&nbsp;</td></tr>');
  }

  const infoRow = ([label, value]: [string, string]) =>
    `<div class="info-row"><span class="info-label">${escapeHtml(label)}</span><span class="info-sep">:</span><span class="info-value">${escapeHtml(value)}</span></div>`;

  return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(spmbData.code || 'SPMB')}</title>
<style>
  @page { size: ${PAGE_WIDTH_IN}in ${PAGE_HEIGHT_IN}in; margin: 0; }
  html, body {
    margin: 0;
    padding: 0;
    width: ${PAGE_WIDTH_IN}in;
    height: ${PAGE_HEIGHT_IN}in;
    font-family: Helvetica, Arial, sans-serif;
    color: #000;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .page {
    position: relative;
    box-sizing: border-box;
    width: ${PAGE_WIDTH_IN}in;
    height: ${PAGE_HEIGHT_IN}in;
    padding: 0.3in 0.35in;
  }
  .title { text-align: center; font-size: 14pt; margin: 0; }
  .subtitle { text-align: center; font-size: 10pt; margin: 2pt 0 0; }
  .info { display: flex; justify-content: space-between; margin-top: 14pt; font-size: 10pt; }
  .info-col { width: 48%; }
  .info-row { display: flex; line-height: 1.45; }
  .info-label { width: 86pt; flex: 0 0 86pt; }
  .info-sep { width: 8pt; flex: 0 0 8pt; }
  .info-value { flex: 1; overflow-wrap: anywhere; }
  table { width: 100%; border-collapse: collapse; margin-top: 12pt; font-size: 10pt; }
  th, td { border: 1px solid #000; padding: 3pt 5pt; }
  th { font-weight: normal; text-align: center; }
  .qty { width: 70pt; text-align: center; }
  tr.cancelled td { color: #969696; font-style: italic; text-decoration: line-through; }
  .signature { margin-top: 22pt; text-align: right; font-size: 10pt; }
  .signature .label { display: inline-block; width: 150pt; text-align: center; }
  /* Pinned ~20pt from the bottom edge to match the preview PDF's signature line. */
  .sign-line { position: absolute; right: 0.35in; bottom: 0.28in; width: 150pt; border-top: 1px solid #000; }
</style>
</head>
<body>
  <div class="page">
    <h1 class="title">SPMB</h1>
    <p class="subtitle">(Surat Perintah Muat Barang)</p>
    <div class="info">
      <div class="info-col">${leftInfo.map(infoRow).join('')}</div>
      <div class="info-col">${rightInfo.map(infoRow).join('')}</div>
    </div>
    <table>
      <thead>
        <tr><th class="qty">Qty</th><th>Nama Barang</th></tr>
      </thead>
      <tbody>
        ${rows.join('\n        ')}
      </tbody>
    </table>
    <div class="signature">
      <div class="label">Dibuat Oleh</div>
    </div>
    <div class="sign-line"></div>
  </div>
</body>
</html>`;
};

/**
 * Prints the SPMB at its exact physical paper size (8.5" x 5.5") by rendering
 * an HTML document inside a hidden iframe and printing that. Unlike printing a
 * PDF embedded in an iframe, the browser's HTML print engine honors the
 * `@page { size }` rule and requests the correct paper size from the printer
 * driver, so no manual paper-size/scale adjustment is needed each time.
 */
export const printSpmb = (spmbData: any): void => {
  const iframe = document.createElement('iframe');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const cleanup = () => {
    if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
  };

  const win = iframe.contentWindow;
  const doc = win?.document;
  if (!win || !doc) {
    cleanup();
    return;
  }

  doc.open();
  doc.write(buildSpmbHtml(spmbData));
  doc.close();

  let printed = false;
  const triggerPrint = () => {
    if (printed) return;
    printed = true;
    win.focus();
    win.print();
    // Give the print dialog time to read the document before removing it.
    setTimeout(cleanup, 1000);
  };

  // System fonts only, so layout is ready almost immediately; the timeout is a
  // safety net in case `onload` does not fire for the written document.
  win.onload = triggerPrint;
  setTimeout(triggerPrint, 300);
};
