export type ShipmentType = "ANTAR" | "JEMPUT";
export type ShipmentStatus = "PENDING" | "PROSES" | "SELESAI" | "COMPLETED";
export type WeighingMethod = "MANUAL" | "VENDOR";

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
    doNumber: string;
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
  originalDOQuantity?: number;
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
  deliveryOrder: {
    doNumber: string;
  };
}

export interface Shipment {
  id: string;
  shipmentNumber: string;
  type: ShipmentType;
  status: ShipmentStatus;
  armadaId: string;
  driverId: string;
  tally: string | null;
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
  driver: {
    id: string;
    name: string;
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

export interface UpdateShipmentItem {
  deliveryOrderId: string;
  locationType: string;
  productId: string;
  requestedQuantity: number;
  shipmentItemId?: string; // Optional untuk item baru
}

export interface CreateShipmentInput {
  type: ShipmentType;
  armadaId?: string;
  driverId: string;
  internalNote?: string;
  plateNumber: string;
  items: CreateShipmentItem[];
}

export interface UpdateShipmentInput {
  type?: ShipmentType;
  armadaId?: string;
  driverId?: string;
  tally?: string;
  internalNote?: string;
  plateNumber?: string;
  items?: UpdateShipmentItem[];
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
  code: string;
  shipmentId: string;
  productId: string;
  weighingMethod: WeighingMethod;
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
    notaTimbangan?: {
      id: string;
      ticketNumber: string;
      documentPath: string;
    };
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

// Add types for shipment and shipment item for Penggunaan di Pengiriman tab
export interface ShipmentItemFromDO {
  id: string;
  requestedQuantity: number;
  product: {
    id: string;
    name: string;
    satuan: string;
  };
}

export interface ShipmentFromDO {
  id: string;
  shipmentNumber: string;
  status: string;
  createdAt: string;
  armada?: {
    id: string;
    model: string;
    plateNumber: string;
  };
  shipmentItems: ShipmentItemFromDO[];
}

export interface StatusBadgeProps {
  status: ShipmentStatus;
}

export interface ChosenProductExtended {
  id: string;
  code: string;
  shipmentId: string;
  productId: string;
  weighingMethod: WeighingMethod;
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
  deliveryOrders: {
    id: string;
    customerId: string;
    customer: {
      id: string;
      name: string;
      address?: string;
    };
  }[];
  customers: {
    id: string;
    name: string;
    address?: string;
  }[];
  shipmentItems: Array<{
    id: string;
    status: string;
    requestedQuantity: number;
    weightedQuantity: number | null;
    locationType: string;
    weighedAt: string | null;
  }>;
  weighings: Array<{
    id: string;
    grossWeight: number;
    netWeight: number;
    tareWeight: number;
    notaTimbangan?: {
      id: string;
      ticketNumber: string;
      documentPath: string;
    };
  }>;
  totalGrossWeight: number;
  totalNetWeight: number;
  totalTareWeight: number;
  totalRequestedQuantity: number;
  locationType: string;
  createdAt: string;
  updatedAt: string;
}

// Interface untuk ShipmentItem dengan locationType
export interface ShipmentItemExtended {
  id: string;
  deliveryOrderId: string;
  productId: string;
  requestedQuantity: number;
  warehouseId: string;
  chosenProduct: boolean;
  locationType?: string;
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
  deliveryOrder: {
    id: string;
    customerId: string;
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

// Define interfaces for the grouped delivery orders
export interface ProductItem {
  id: string;
  name: string;
  satuan: string;
  quantity: number;
  warehouseId: string;
  chosenProduct?: boolean;
  locationType?: string;
  warehouse: {
    id: string;
    name: string;
  };
}

export interface GroupedDeliveryOrder {
  id: string;
  doNumber: string;
  customer: {
    id: string;
    name: string;
    address?: string;
  };
  products: ProductItem[];
}

export interface BulkWeighShipmentInput {
  shipmentId: string;
  productId: string;
  grossWeight: number;
  netWeight?: number;
  tareWeight?: number;
}

export interface IndividualWeighShipmentInput {
  shipmentId: string;
  shipmentItemId: string;
  grossWeight: number;
  netWeight?: number;
  tareWeight?: number;
}

// Individual weighing item interface
export interface IndividualWeighingItem {
  shipmentItemId: string;
  deliveryOrderId: string;
  deliveryOrderNumber: string;
  customerName: string;
  requestedQuantity: number;
  productName: string;
  productUnit: string;
}
