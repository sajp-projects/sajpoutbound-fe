// Common types
export type DailyGroupType = "item" | "customer" | "vehicle" | "warehouse";
export type ShipmentType = "ANTAR" | "JEMPUT";
export type ShipmentStatus =
  | "PENDING"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

// Output Report types
export interface OutputGroupBase {
  id: string | null;
  name: string;
  type: DailyGroupType;
  totalQuantity: number;
  totalWeight: number;
  shipmentCount: number;
  satuan?: string;
  shipments?: ShipmentItem[];
}

export interface OutputReportSummary {
  totalGroups: number;
  totalShipments: number;
  dateRange?: { start: string; end: string };
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface DailyOutputReportResult {
  data: OutputGroupBase[];
  summary: OutputReportSummary;
  filters: DailyOutputReportFilter;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  allGroups?: OutputGroupBase[];
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
  filters: MonthlyOutputReportFilter;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  allGroups?: OutputGroupBase[];
}

// Add missing filter types for output reports
export type DailyOutputReportFilter = {
  startDate?: string;
  endDate?: string;
  groupBy?: DailyGroupType;
  warehouseId?: string;
  customerId?: string;
  armadaId?: string;
  productId?: string;
};

export type MonthlyOutputReportFilter = {
  year: number;
  month: number;
  groupBy?: DailyGroupType;
  warehouseId?: string;
  customerId?: string;
  armadaId?: string;
  productId?: string;
};

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

// Add ShipmentAssignment type for shipment assignment report
export interface ShipmentAssignment {
  armada: {
    id: string;
    model: string;
    plateNumber: string;
    id_sl?: string;
    description?: string;
  };
  assignments: Record<string, unknown>;
  summary: { PENDING: number; PROSES: number; SELESAI: number; total: number };
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
      [key: string]:
        | string
        | number
        | boolean
        | undefined
        | string[]
        | number[];
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

export type OperationalReportData = Record<
  ShipmentType,
  OperationalReportItem[]
>;

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
