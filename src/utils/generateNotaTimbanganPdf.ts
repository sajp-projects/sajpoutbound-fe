/* eslint-disable @typescript-eslint/no-explicit-any */

import jsPDF from 'jspdf';
import { format } from 'date-fns';

export const generateNotaTimbanganPdf = (weighingData: any): string => {
  // Create PDF with custom receipt size (240x320 points)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: [240, 320],
  });

  const { shipmentChosenProduct, notaTimbangan, shipmentItems } = weighingData;
  const { shipment, product } = shipmentChosenProduct;

  const fontName = 'helvetica';
  const fontSize = 8;
  const margin = 15;
  const contentWidth = 240 - margin * 2;

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'dd/MM/yy - HH:mm:ss');
    } catch {
      return 'N/A';
    }
  };

  const formatNumber = (num?: number | null) => {
    if (num === null || num === undefined) return '0';
    return num.toLocaleString('id-ID');
  };

  const formatWeight = (weight?: number | null) => {
    if (weight === null || weight === undefined) return '0,00';
    return weight
      .toFixed(2)
      .replace('.', ',')
      .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  // Header
  doc.setFont(fontName, 'bold');
  doc.setFontSize(10);
  doc.text('NOTA TIMBANGAN', 120, margin + 10, { align: 'center' });

  // Info Section
  doc.setFont(fontName, 'normal');
  doc.setFontSize(fontSize);
  
  let currentY = margin + 30;
  const labelWidth = 70;
  const colonX = margin + labelWidth;
  const valueX = colonX + 8;
  const maxValueWidth = contentWidth - labelWidth - 8;
  const rowSpacing = 12;

  const addInfoRow = (label: string, value: string) => {
    doc.setFont(fontName, 'normal');
    doc.text(label, margin, currentY);
    doc.text(':', colonX, currentY);
    
    // Simple text wrapping
    const splitValue = doc.splitTextToSize(value, maxValueWidth);
    doc.text(splitValue, valueX, currentY);
    currentY += splitValue.length * rowSpacing;
  };

  // The ticket sequence or fallback to ticketNumber
  const ticketNumber = notaTimbangan?.ticketSeq?.toString() || notaTimbangan?.ticketNumber || 'N/A';

  addInfoRow('No. Tiket', ticketNumber);
  addInfoRow('Tgl/ Jam Masuk', formatDate(weighingData.timeIn));
  addInfoRow('Tgl/ Jam Keluar', formatDate(weighingData.timeOut));
  currentY += 4;

  addInfoRow('No. Kendaraan', shipment?.armada?.plateNumber || shipment?.plateNumber || 'N/A');
  addInfoRow('Nama Barang', product?.name || 'N/A');
  addInfoRow('No. Referensi', shipmentChosenProduct?.code || 'N/A');
  // New requirement: short shipment ID
  const shortShipmentId = shipment?.shipmentNumber || (shipment?.id ? shipment.id.split('-')[0].toUpperCase() : 'N/A');
  addInfoRow('No. Pengiriman', shortShipmentId);
  currentY += 4;

  // Calculate total quantity
  const linkedItems = shipmentItems?.filter(
    (item: any) =>
      item.productId === product?.id && item.shipmentChosenProductWeighingId === weighingData.id
  ) || [];
  
  const totalQuantity = linkedItems.reduce((sum: number, item: any) => sum + (item.requestedQuantity || 0), 0);

  addInfoRow('Jumlah', `${formatNumber(totalQuantity)} ${product?.satuan || ''}`.trim());
  currentY += 8;

  // Weight Section
  const addWeightRow = (label: string, value: string) => {
    doc.setFont(fontName, 'bold');
    doc.text(label, margin, currentY);
    doc.text(`: ${value}`, colonX, currentY);
    currentY += rowSpacing;
  };

  addWeightRow('Berat Bruto', `${formatWeight(weighingData.grossWeight)} kg`);
  addWeightRow('Berat Tarra', `${formatWeight(weighingData.tareWeight)} kg`);
  addWeightRow('Berat Netto', `${formatWeight(weighingData.netWeight)} kg`);
  
  currentY += 12;

  // Average Weight Section
  const averageWeight =
    weighingData.netWeight && totalQuantity > 0 ? weighingData.netWeight / totalQuantity : 0;

  const labelText = 'Ditimbang: ';
  const valueText = `${formatWeight(averageWeight)} kg`;

  const centerX = margin + contentWidth / 2;
  
  doc.setFont(fontName, 'normal');
  const labelWidth2 = doc.getStringUnitWidth(labelText) * fontSize;
  doc.setFont(fontName, 'bold');
  const valueWidth = doc.getStringUnitWidth(valueText) * fontSize;
  
  const avgLabelX = centerX - (labelWidth2 + valueWidth) / 2;
  const avgValueX = avgLabelX + labelWidth2;

  doc.setFont(fontName, 'normal');
  doc.text(labelText, avgLabelX, currentY);
  
  doc.setFont(fontName, 'bold');
  doc.text(valueText, avgValueX, currentY);

  // Signatures
  const signatureY = 320 - 25;
  doc.setFont(fontName, 'normal');
  doc.text('(                    )', margin, signatureY);
  doc.text('(                    )', 240 - margin - doc.getStringUnitWidth('(                    )') * fontSize, signatureY);

  // Return Blob URL
  const pdfBlob = doc.output('blob');
  return URL.createObjectURL(pdfBlob);
};
