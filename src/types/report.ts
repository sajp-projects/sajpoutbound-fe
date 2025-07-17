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
  totalQuantityBySatuan: Array<{ satuan: string; total: number }>;
  totalWeightBySatuan: Array<{ satuan: string; total: number }>;
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

export interface ShipmentAssignmentReportSummary {
  totalArmada: number;
  totalAssignments: number;
  byStatus: { PENDING: number; PROSES: number; SELESAI: number };
}

export interface ShipmentAssignmentReportFilter {
  armadaId?: string;
  warehouseId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export interface ShipmentAssignmentKPI {
  totalAssignedToday: number;
  totalAssignedWeek: number;
  totalAssignedMonth: number;
  mostActiveArmada: {
    id: string;
    model: string;
    plateNumber: string;
    count: number;
  } | null;
  avgShipmentsPerArmadaPerDay: number;
  pendingAssignments: number;
}

export interface ShipmentAssignmentReportResult {
  data: ShipmentAssignment[];
  summary: ShipmentAssignmentReportSummary;
  filters: ShipmentAssignmentReportFilter;
  kpi?: ShipmentAssignmentKPI;
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
  plateNumber?: string;
  armada?: {
    plateNumber?: string;
  };
  totalItems: number;
  totalWeight: number;
}

export type OperationalReportData = Record<
  ShipmentType,
  OperationalReportItem[]
>;

// Correct type for operational report summary
export interface OperationalReportSummary {
  ANTAR: { PENDING: number; PROSES: number; SELESAI: number; total: number };
  JEMPUT: { PENDING: number; PROSES: number; SELESAI: number; total: number };
  overall: { PENDING: number; PROSES: number; SELESAI: number; total: number };
}
// Update the type for the API response to include the new 'kpi' field
export interface OperationalReportKPI {
  totalShipmentsCreatedToday: number;
  totalShipmentsVerifiedToday: number;
  uniqueProductsMoved: number;
  dispatchedTotalsByUnit: Array<{ satuan: string; totalQuantity: number }>;
  topShippedProducts: Array<{
    id: string;
    name: string;
    satuan: string;
    totalQuantity: number;
  }>;
  mostActiveVehicle: {
    id: string;
    model: string;
    plateNumber: string;
    shipmentCount: number;
  } | null;
  topCustomersByShipmentCount: Array<{
    id: string;
    name: string;
    shipmentCount: number;
  }>;
  topCustomersByVolume: Array<{
    id: string;
    name: string;
    totalQuantity: number;
  }>;
  vehicleUsageCount: number;
  trendline7Days: Array<{ date: string; shipmentCount: number }>;
  unitsUsed: string[];
}
export interface OperationalReportResponse {
  report: {
    data: Record<string, Record<string, Array<OperationalReportItem>>>;
    summary: OperationalReportSummary;
    kpi: OperationalReportKPI;
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
