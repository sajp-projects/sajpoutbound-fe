/* eslint-disable @typescript-eslint/no-explicit-any */

import { format } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateSpmbPdf = (spmbData: any): string => {
  // Create PDF with 9.5" x 5.5" custom format (matching physical SPMB paper)
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: [684, 396], // 9.5" x 5.5" in points (1pt = 1/72 inch)
  });

  const { shipment, deliveryOrder } = spmbData;
  const fontName = 'helvetica';

  const formatNumber = (num?: number | null) => {
    if (num === null || num === undefined) return '0';
    return num.toLocaleString('id-ID');
  };

  // Header
  doc.setFont(fontName, 'normal');
  doc.setFontSize(14);
  doc.text('SPMB', doc.internal.pageSize.width / 2, 30, { align: 'center' });

  doc.setFontSize(10);
  doc.text('(Surat Perintah Muat Barang)', doc.internal.pageSize.width / 2, 45, { align: 'center' });

  // SPMB Info (Left side)
  const infoTop = 75;
  const leftX = 20;
  const leftValueX = 100;
  let leftY = infoTop;
  const rowSpacing = 15;

  const addLeftInfo = (label: string, value: string) => {
    doc.text(label, leftX, leftY);
    doc.text(`: ${value}`, leftValueX, leftY);
    leftY += rowSpacing;
  };

  addLeftInfo('No.', spmbData.code || '');
  addLeftInfo('Tanggal', spmbData.createdAt ? format(new Date(spmbData.createdAt), 'dd/MM/yyyy') : '');
  addLeftInfo('Kepada', deliveryOrder?.customer?.name || '');
  // New requirements
  addLeftInfo('No. Pengiriman', shipment?.shipmentNumber || '');
  addLeftInfo('No. DO', deliveryOrder?.doNumber || '');

  // Shipment Info (Right side)
  const rightX = 402;
  const rightValueX = 489;
  let rightY = infoTop;

  const addRightInfo = (label: string, value: string) => {
    doc.text(label, rightX, rightY);

    // Check if value fits, if not, truncate or let it overlap (backend didn't wrap either)
    doc.text(`: ${value}`, rightValueX, rightY);
    rightY += rowSpacing;
  };

  addRightInfo('Plat Nomor', shipment?.armada?.plateNumber || shipment?.plateNumber || '');
  addRightInfo('Supir', shipment?.driver?.name || '');
  addRightInfo('Tally', shipment?.tally || '');
  addRightInfo('Keterangan', shipment?.internalNote || '');

  // Table
  const tableTop = Math.max(leftY, rightY) + 15;

  const shipmentItemsForDO = shipment?.shipmentItems?.filter(
    (item: any) =>
      item.deliveryOrderId === spmbData.deliveryOrderId && item.warehouseId === spmbData.warehouseId
  ) || [];

  const tableBody = shipmentItemsForDO.map((item: any) => {
    const isCancelled = item.status === 'CANCELLED';
    return [
      { content: formatNumber(item.requestedQuantity), styles: { halign: 'center', textColor: isCancelled ? [150, 150, 150] : [0, 0, 0] } },
      {
        content: item.product?.name || '',
        styles: {
          textColor: isCancelled ? [150, 150, 150] : [0, 0, 0],
          fontStyle: isCancelled ? 'italic' : 'normal',
        }
      }
    ];
  });

  // Ensure minimum 5 rows
  const minRows = 5;
  while (tableBody.length < minRows) {
    tableBody.push([{ content: '' }, { content: '' }]);
  }

  // Draw table using jspdf-autotable
  autoTable(doc, {
    startY: tableTop,
    margin: { left: 20, right: 20 },
    theme: 'grid',
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      lineColor: [0, 0, 0],
      lineWidth: 1,
      halign: 'center',
      font: fontName,
      fontSize: 10,
    },
    bodyStyles: {
      textColor: [0, 0, 0],
      lineColor: [0, 0, 0],
      lineWidth: 1,
      font: fontName,
      fontSize: 10,
    },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 'auto' },
    },
    head: [['Qty', 'Nama Barang']],
    body: tableBody,
    didDrawCell: (data: any) => {
      // Add strikethrough for cancelled items
      if (data.section === 'body') {
        const itemIndex = data.row.index;
        if (itemIndex < shipmentItemsForDO.length) {
          const item = shipmentItemsForDO[itemIndex];
          if (item.status === 'CANCELLED') {
            // Draw strike line
            const { x, y, width, height } = data.cell;
            const midY = y + height / 2;
            // Pad line slightly inside cell
            doc.setDrawColor(150, 150, 150);
            doc.line(x + 2, midY, x + width - 2, midY);
            doc.setDrawColor(0, 0, 0); // Reset
          }
        }
      }
    }
  });

  // Signature area
  const tableBottom = (doc as any).lastAutoTable?.finalY || (doc as any).autoTable?.previous?.finalY || tableTop + 50;
  const finalY = tableBottom + 30; // Move down by 30pt

  doc.setFontSize(10);
  doc.text('Dibuat Oleh', 546, finalY, { align: 'center' });

  const signatureY = doc.internal.pageSize.height - 20;
  doc.setLineWidth(1);
  doc.line(471, signatureY, 621, signatureY);

  // Return Blob URL
  const pdfBlob = doc.output('blob');
  return URL.createObjectURL(pdfBlob);
};
