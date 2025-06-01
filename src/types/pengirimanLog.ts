export interface ShipmentLog {
  id: string;
  shipmentId: string;
  performedById: string;
  createdAt: string;
  updatedAt: string;
  action: "CREATE" | "UPDATE" | "DELETE" | "RESTORE";
  entityType: "SHIPMENT" | "SHIPMENT_ITEM";
  oldData: Record<string, unknown> | null;
  newData: Record<string, unknown> | null;
  description: string;
  performedBy: {
    id: string;
    name: string;
    email: string;
  };
  shipment?: {
    id: string;
    plateNumber: string;
    type: string;
  };
}

export interface ShipmentLogPagination {
  logs: ShipmentLog[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
