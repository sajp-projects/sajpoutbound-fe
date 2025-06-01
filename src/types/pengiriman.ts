export type ShipmentType = "ANTAR" | "JEMPUT";
export type ShipmentStatus = "PENDING" | "PROSES" | "SELESAI";

export interface ShipmentItem {
  id: string;
  shipmentId: string;
  deliveryOrderId: string;
  productId: string;
  requestedQuantity: number;
  weightedQuantity: number | null;
  status: "PENDING" | "PROSES" | "SELESAI";
  warehouseId: string;
  weighedAt: string | null;
  createdAt: string;
  updatedAt: string;
  product: {
    id: string;
    name: string;
    satuan: string;
    warehouseId?: string;
    warehouse?: {
      id: string;
      name: string;
    };
  };
  deliveryOrder: {
    id: string;
    customerId?: string;
    customer: {
      id: string;
      name: string;
      address?: string;
    };
  };
  warehouse: {
    id: string;
    name: string;
  };
}

export interface SPMB {
  id: string;
  shipmentId: string;
  deliveryOrderId: string;
  code: string;
  status: "PENDING" | "PROSES" | "SELESAI";
  documentPath: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Shipment {
  id: string;
  type: ShipmentType;
  status: ShipmentStatus;
  armadaId: string;
  internalNote: string | null;
  plateNumber: string;
  platePhoto: string | null;
  isVerified: boolean;
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  armada: {
    id: string;
    model: string;
    plateNumber: string;
    id_sl?: string;
    description?: string;
  };
  shipmentItems: ShipmentItem[];
  spmbs?: SPMB[];
}

export interface CreateShipmentItem {
  deliveryOrderId: string;
  productId: string;
  requestedQuantity: number;
}

export interface CreateShipmentInput {
  type: ShipmentType;
  armadaId?: string;
  internalNote?: string;
  plateNumber: string;
  items: CreateShipmentItem[];
}

export interface UpdateShipmentInput {
  type?: ShipmentType;
  armadaId?: string;
  internalNote?: string;
  plateNumber?: string;
}

export interface ShipmentPagination {
  shipments: Shipment[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface UploadPlatePhotoInput {
  shipmentId: string;
  platePhoto: File;
}
