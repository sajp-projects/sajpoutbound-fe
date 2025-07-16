// Common types
export type DailyGroupType = "item" | "customer" | "vehicle" | "warehouse";
export type ShipmentType = 'ANTAR' | 'JEMPUT';
export type ShipmentStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

// Output Report types
export interface OutputGroupBase {
  id: string | null;
  name: string;
  type: DailyGroupType;
  totalQuantity: number;
  totalWeight: number;
  shipmentCount: number;
  unit?: string;
  shipments?: ShipmentItem[];
}

export interface OutputReportSummary {
  totalGroups: number;
  totalQuantity: number;
  totalWeight: number;
  totalShipments: number;
  dateRange?: { start: string; end: string };
}

export interface MonthlyOutputReportResult {
  data: OutputGroupBase[];
  summary: OutputReportSummary;
  monthInfo: {
    year: number;
    month: number;
    monthName: string;
    daysInMonth: number;
  };
}

// Shipment related types
export interface ShipmentItem {
  shipmentId: string;
  shipmentNumber: string;
  type: string;
  plateNumber?: string;
  item: {
    id: string;
    product: {
      id: string;
      name: string;
      satuan: string;
    };
    warehouse: {
      id: string;
      name: string;
    };
    requestedQuantity: number;
    weightedQuantity: number;
    status: ShipmentStatus;
    locationType: string;
  };
  armada?: {
    id: string;
    name: string;
    plateNumber: string;
    driverName?: string;
    phoneNumber?: string;
  };
}

// Report response types
export interface ReportResponse<T> {
  report: {
    data: T[];
    summary: {
      totalGroups: number;
      totalQuantity: number;
      totalWeight: number;
      totalShipments: number;
      dateRange?: {
        start: string;
        end: string;
      };
    };
    filters: {
      groupBy?: DailyGroupType;
      type?: ShipmentType;
      status?: ShipmentStatus;
      [key: string]: string | number | boolean | undefined | string[] | number[];
    };
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

// Operational report types
export interface OperationalReportItem {
  status: ShipmentStatus;
  shipmentNumber: string;
  vehicle?: {
    plateNumber?: string;
  };
  totalItems: number;
  totalWeight: number;
}

export type OperationalReportData = Record<ShipmentType, OperationalReportItem[]>;

export interface OperationalReportResponse {
  report: {
    data: OperationalReportData;
    summary: {
      totalShipments: number;
      totalItems: number;
      totalWeight: number;
    };
  };
}
