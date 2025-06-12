export type ShipmentType = "ANTAR" | "JEMPUT";
export type ShipmentStatus = "PENDING" | "PROSES" | "SELESAI" | "COMPLETED";

export interface ShipmentItem {
  id: string;
  shipmentId: string;
  deliveryOrderId: string;
  productId: string;
  requestedQuantity: number;
  weightedQuantity: number | null;
  status: ShipmentStatus;
  locationType: string;
  chosenProduct?: boolean;
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
  status: ShipmentStatus;
  documentPath: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Shipment {
  id: string;
  shipmentNumber: string;
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
  locationType: string;
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
  items?: CreateShipmentItem[];
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

export interface Customer {
  id: string;
  name: string;
  id_sl?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryOrder {
  id: string;
  customerId: string;
  address?: string;
  internalNote?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  customer: Customer;
}

export interface ChosenProduct {
  id: string;
  shipmentId: string;
  productId: string;
  product: {
    id: string;
    name: string;
    satuan: string;
    warehouseId: string;
    warehouse: {
      id: string;
      name: string;
    };
  };
  deliveryOrders: DeliveryOrder[];
  customers: Customer[];
  shipmentItems: Array<{
    id: string;
    status: string;
    requestedQuantity: number;
    weightedQuantity: number | null;
    locationType: string;
    weighedAt: string | null;
  }>;
  weighings: {
    id: string;
    grossWeight: number;
    netWeight: number;
    tareWeight: number;
  }[];
  totalGrossWeight: number;
  totalNetWeight: number;
  totalTareWeight: number;
  totalRequestedQuantity: number;
  locationType: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChosenProductsResponse {
  note: string;
  chosenProducts: ChosenProduct[];
}

export interface DeliveryOrderProduct {
  deliveryOrderId: string;
  customer: {
    id: string;
    name: string;
    address?: string;
  };
  products: {
    id: string;
    name: string;
    satuan: string;
    quantity: number;
    warehouseId?: string;
    warehouse?: {
      id: string;
      name: string;
    };
  }[];
}
