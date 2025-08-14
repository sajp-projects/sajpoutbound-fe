// Readable label mapping for shipment log fields
export const SHIPMENT_LOG_FIELD_LABELS: Record<string, string> = {
  shipmentNumber: "Nomor Pengiriman",
  type: "Tipe",
  plateNumber: "Nomor Polisi",
  armadaId: "Armada",
  internalNote: "Catatan Internal",
  status: "Status",
  isVerified: "Terverifikasi",
  requestedQuantity: "Jumlah Diminta",
  pendingQuantity: "Jumlah Pending",
  processedQuantity: "Jumlah Diproses",
  completedQuantity: "Jumlah Selesai",
  productId: "Produk (ID)",
  productName: "Produk",
  deliveryOrderId: "DO (ID)",
  deliveryOrderNumber: "Nomor DO",
  locationType: "Tipe Lokasi",
  weighingMethod: "Metode Timbang",
  grossWeight: "Berat Kotor",
  tareWeight: "Berat Tara",
  netWeight: "Berat Bersih",
};

export const prettifyField = (rawPath: string): string => {
  // Remove array identifiers: [uuid] or [index]
  const noIds = rawPath.replace(/\[[^\]]+\]/g, "");

  // Special prefixes for items.*
  const replacements: Record<string, string> = {
    "items.added": "Item Ditambahkan",
    "items.removed": "Item Dihapus",
    "items.updated": "Item Diubah",
  };

  let path = noIds;
  for (const [k, v] of Object.entries(replacements)) {
    if (path.startsWith(k)) {
      path = path.replace(k, v);
      break;
    }
  }

  const tokens = path.split(".").filter(Boolean);
  const mapped = tokens.map((t) => SHIPMENT_LOG_FIELD_LABELS[t] ?? t);
  return mapped.join(" • ");
};

export const stringifyValue = (val: unknown): string => {
  if (val === null || val === undefined) return "";
  if (typeof val === "string" || typeof val === "number" || typeof val === "boolean") {
    return String(val);
  }
  try {
    return JSON.stringify(val);
  } catch {
    return String(val);
  }
};

export const isPlainObject = (val: unknown): val is Record<string, unknown> =>
  val !== null && typeof val === "object" && !Array.isArray(val);

export interface ChangeRow {
  field: string;
  oldValue: unknown;
  newValue: unknown;
}

export const buildDiffRows = (
  oldVal: unknown,
  newVal: unknown,
  path: string = "",
): ChangeRow[] => {
  // If both are objects (not arrays), recurse on keys
  if (isPlainObject(oldVal) || isPlainObject(newVal)) {
    const oldObj = (isPlainObject(oldVal) ? oldVal : {}) as Record<string, unknown>;
    const newObj = (isPlainObject(newVal) ? newVal : {}) as Record<string, unknown>;
    const keys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);
    let rows: ChangeRow[] = [];
    keys.forEach((key) => {
      const childPath = path ? `${path}.${key}` : key;
      rows = rows.concat(buildDiffRows(oldObj[key], newObj[key], childPath));
    });
    return rows;
  }

  // If either is an array, handle arrays (including array of objects)
  if (Array.isArray(oldVal) || Array.isArray(newVal)) {
    const oldArr = Array.isArray(oldVal) ? oldVal : [];
    const newArr = Array.isArray(newVal) ? newVal : [];

    const areAllPrimitive = (arr: unknown[]) =>
      arr.every((v) => v === null || ["string", "number", "boolean"].includes(typeof v));

    if (areAllPrimitive(oldArr) && areAllPrimitive(newArr)) {
      const maxLen = Math.max(oldArr.length, newArr.length);
      const rows: ChangeRow[] = [];
      for (let i = 0; i < maxLen; i++) {
        const o = oldArr[i];
        const n = newArr[i];
        if (JSON.stringify(o) !== JSON.stringify(n)) {
          rows.push({ field: `${path}[${i}]`, oldValue: o, newValue: n });
        }
      }
      return rows;
    }

    // For arrays of objects, try to match by stable keys, fallback to index
    const keyFields = ["id", "deliveryOrderId", "productId", "code"];
    const keyFor = (item: unknown, index: number) => {
      if (isPlainObject(item)) {
        for (const k of keyFields) {
          if (k in item && (item as Record<string, unknown>)[k]) {
            return String((item as Record<string, unknown>)[k]);
          }
        }
      }
      return String(index);
    };

    const indexMap = (arr: unknown[]) => {
      const map = new Map<string, unknown>();
      arr.forEach((item, idx) => map.set(keyFor(item, idx), item));
      return map;
    };

    const oldMap = indexMap(oldArr);
    const newMap = indexMap(newArr);
    const allKeys = new Set([...oldMap.keys(), ...newMap.keys()]);
    let rows: ChangeRow[] = [];
    allKeys.forEach((k) => {
      const o = oldMap.get(k);
      const n = newMap.get(k);
      if (JSON.stringify(o) === JSON.stringify(n)) return;
      const childPath = `${path}[${k}]`;
      rows = rows.concat(buildDiffRows(o as unknown, n as unknown, childPath));
    });
    return rows;
  }

  // Primitive comparison
  if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
    return [
      {
        field: path,
        oldValue: oldVal,
        newValue: newVal,
      },
    ];
  }
  return [];
};