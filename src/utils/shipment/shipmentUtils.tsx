import { ShipmentLog } from "../../types/shipmentLog";

/**
 * Get shipment number from log data
 * Tries to extract shipment number from various sources in order of preference
 */
export const getShipmentNumber = (log: ShipmentLog): string => {
  // First try: shipment object
  if (log.shipment?.shipmentNumber) {
    return log.shipment.shipmentNumber;
  }

  // Second try: oldData
  if (
    log.oldData &&
    typeof log.oldData === "object" &&
    "shipmentNumber" in log.oldData
  ) {
    return String(log.oldData.shipmentNumber);
  }

  // Third try: newData
  if (
    log.newData &&
    typeof log.newData === "object" &&
    "shipmentNumber" in log.newData
  ) {
    return String(log.newData.shipmentNumber);
  }

  // Fallback: short ID
  return log.shipment?.id.substring(0, 8) || "";
};

/**
 * Render changes table for shipment logs
 * Handles creation, deletion, and updates with proper formatting
 */
export const renderChanges = (
  oldData: Record<string, unknown> | null,
  newData: Record<string, unknown> | null,
  prettifyField: (field: string) => string,
  _stringifyValue: (val: unknown) => string
) => {
  if (!oldData && !newData) return null;

  // Handle creation (only newData)
  if (!oldData && newData) {
    return (
      <div>
        <div className="mb-1 text-xs font-medium text-gray-600">
          Data pengiriman yang dibuat:
        </div>
        <div className="w-full overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <tbody>
              {Object.entries(newData).map(([key, value]) => {
                if (typeof value === "object" || Array.isArray(value)) return null;
                return (
                  <tr key={key}>
                    <td className="font-medium bg-gray-50 w-[120px] border border-gray-200 p-1">
                      {prettifyField(key)}
                    </td>
                    <td className="max-w-full p-1 overflow-hidden border border-gray-200 whitespace-nowrap text-ellipsis">
                      {String(value)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Handle deletion (only oldData)
  if (oldData && !newData) {
    return (
      <div>
        <div className="mb-1 text-xs font-medium text-gray-600">
          Data pengiriman yang dihapus:
        </div>
        <div className="w-full overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <tbody>
              {Object.entries(oldData).map(([key, value]) => {
                if (typeof value === "object" || Array.isArray(value)) return null;
                return (
                  <tr key={key}>
                    <td className="font-medium bg-gray-50 w-[120px] border border-gray-200 p-1">
                      {prettifyField(key)}
                    </td>
                    <td className="max-w-full p-1 overflow-hidden border border-gray-200 whitespace-nowrap text-ellipsis">
                      {String(value)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Handle updates (both oldData and newData)
  if (oldData && newData) {
    // This will be handled by the component using buildDiffRows
    return null;
  }

  return null;
};
