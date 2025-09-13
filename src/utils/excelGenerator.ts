import * as XLSX from 'xlsx';
import { OutputReportResult, ShipmentItem } from '@/types/report';

interface ExpenditureItem {
  no: number;
  tanggal: string;
  noSpmb: string;
  namaCustomer: string;
  namaBarang: string;
  qty: number;
  netto: number;
  nomorPlat: string;
  ekspedisi: string;
}

/**
 * Transforms output report data into Excel format
 */
function transformOutputReportToExcelData(outputReportData: OutputReportResult, warehouseFilter?: string): ExpenditureItem[] {
  const excelData: ExpenditureItem[] = [];
  let rowNumber = 1;

  // Use allGroups if available (contains all data), otherwise use data (paginated)
  const groups = outputReportData.allGroups || outputReportData.data || [];

  groups.forEach((group) => {
    if (!group.shipments) return;

    group.shipments.forEach((shipment: ShipmentItem) => {
      // Skip if warehouse filter doesn't match
      if (warehouseFilter && shipment.item.warehouse.id !== warehouseFilter) {
        return;
      }

      // Format date from createdAt
      let tanggal = '';
      if (shipment.createdAt) {
        try {
          // Handle both string and Date object
          const date = typeof shipment.createdAt === 'string' 
            ? new Date(shipment.createdAt) 
            : shipment.createdAt;
          
          // Subtract 7 hours (7 * 60 * 60 * 1000 ms) to convert from UTC+7 to UTC
          const adjustedDate = new Date(date.getTime() - (7 * 60 * 60 * 1000));
          
          // Format to DD-MM-YYYY
          const day = String(adjustedDate.getUTCDate()).padStart(2, '0');
          const month = String(adjustedDate.getUTCMonth() + 1).padStart(2, '0');
          const year = adjustedDate.getUTCFullYear();
          tanggal = `${day}-${month}-${year}`;
        } catch (error) {
          console.error('Error formatting date:', error);
          tanggal = '';
        }
      }
      
      // Get SPMB code from the shipment data
      const noSpmb = shipment.item.deliveryOrder?.spmb?.code || '';

      // Determine expedition type (ANTAR if has armada, JEMPUT if no armada)
      const ekspedisi = shipment.armada ? 'ANTAR' : 'JEMPUT';

      // Get customer name from the shipment data
      const namaCustomer = shipment.item.deliveryOrder?.customer.name || '';

      const rowData: ExpenditureItem = {
        no: rowNumber++,
        tanggal,
        noSpmb,
        namaCustomer,
        namaBarang: shipment.item.product.name,
        qty: shipment.item.requestedQuantity,
        netto: shipment.item.weightedQuantity || 0, // Use weightedQuantity as netto
        nomorPlat: shipment.armada?.plateNumber || shipment.plateNumber || '',
        ekspedisi,
      };

      excelData.push(rowData);
    });
  });

  return excelData;
}

/**
 * Groups expenditure data by product and sums quantities
 */
function groupByProductAndSum(excelData: ExpenditureItem[]): Array<{
  no: number;
  namaBarang: string;
  totalQty: number;
}> {
  const productGroups = new Map<string, {
    namaBarang: string;
    totalQty: number;
  }>();

  excelData.forEach((item) => {
    const key = item.namaBarang;
    if (productGroups.has(key)) {
      const existing = productGroups.get(key)!;
      existing.totalQty += item.qty;
    } else {
      productGroups.set(key, {
        namaBarang: item.namaBarang,
        totalQty: item.qty,
      });
    }
  });

  // Convert to array and add row numbers
  return Array.from(productGroups.values())
    .sort((a, b) => b.totalQty - a.totalQty) // Sort by quantity descending
    .map((item, index) => ({
      no: index + 1,
      ...item,
    }));
}

/**
 * Generates and downloads Excel file for expenditure report using existing hook data
 */
export function generateExpenditureExcel(outputReportData: OutputReportResult, warehouseName?: string, warehouseFilter?: string): void {
  try {
    // Transform to Excel format
    const excelData = transformOutputReportToExcelData(outputReportData, warehouseFilter);

    // Create Excel workbook
    const workbook = XLSX.utils.book_new();

    // Create title based on warehouse filter
    const title = warehouseName
      ? `LAPORAN HARIAN BARANG KELUAR ${warehouseName}`
      : 'LAPORAN HARIAN BARANG KELUAR SEMUA GUDANG';

    // === SHEET 1: Detailed Report ===
    const worksheetData: (string | number)[][] = [
      [title], // Title row
      [], // Empty row
      [
        'NO',
        'TANGGAL',
        'NO. SPMB',
        'NAMA CUSTOMER',
        'NAMA BARANG',
        'QTY',
        'NETTO (KG)',
        'NOMOR PLAT',
        'EKSPEDISI',
      ], // Header row
    ];

    // Add data rows
    excelData.forEach((item) => {
      worksheetData.push([
        item.no,
        item.tanggal,
        item.noSpmb,
        item.namaCustomer,
        item.namaBarang,
        item.qty,
        item.netto,
        item.nomorPlat,
        item.ekspedisi,
      ]);
    });

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Set column widths for detailed sheet
    worksheet['!cols'] = [
      { width: 5 }, // NO
      { width: 12 }, // TANGGAL
      { width: 15 }, // NO. SPMB
      { width: 25 }, // NAMA CUSTOMER
      { width: 20 }, // NAMA BARANG
      { width: 10 }, // QTY
      { width: 12 }, // NETTO
      { width: 15 }, // NOMOR PLAT
      { width: 15 }, // EKSPEDISI
    ];

    // Merge title cells (A1:I1)
    worksheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 8 } }];

    // Add detailed worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan Detail');

    // === SHEET 2: Product Summary ===
    const productSummary = groupByProductAndSum(excelData);
    
    const summaryTitle = warehouseName
      ? `RINGKASAN PER PRODUK ${warehouseName}`
      : 'RINGKASAN PER PRODUK SEMUA GUDANG';

    const summaryWorksheetData: (string | number)[][] = [
      [summaryTitle], // Title row
      [], // Empty row
      [
        'NO',
        'NAMA BARANG',
        'TOTAL QTY',
      ], // Header row
    ];

    // Add product summary rows
    productSummary.forEach((item) => {
      summaryWorksheetData.push([
        item.no,
        item.namaBarang,
        item.totalQty,
      ]);
    });

    const summaryWorksheet = XLSX.utils.aoa_to_sheet(summaryWorksheetData);

    // Set column widths for summary sheet
    summaryWorksheet['!cols'] = [
      { width: 5 }, // NO
      { width: 30 }, // NAMA BARANG
      { width: 12 }, // TOTAL QTY
    ];

    // Merge title cells (A1:C1)
    summaryWorksheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }];

    // Add summary worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Ringkasan Produk');

    // Generate filename
    const dateStr = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '_');
    const warehouseStr = warehouseName ? `_${warehouseName.replace(/\s+/g, '_')}` : '_SEMUA_GUDANG';
    const filename = `laporan_barang_keluar${warehouseStr}_${dateStr}.xlsx`;

    // Write and download Excel file
    XLSX.writeFile(workbook, filename);

  } catch (error) {
    console.error('Error generating Excel file:', error);
    throw error;
  }
}