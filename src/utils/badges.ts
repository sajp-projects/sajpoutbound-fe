export function getRoleBadgeVariant(
  roleName: string
): "default" | "destructive" | "outline" | "secondary" | "info" {
  switch (roleName.toLowerCase()) {
    case "admin":
      return "destructive";
    case "manager":
      return "info";
    case "staff":
      return "secondary";
    default:
      return "default";
  }
}

export function getRoleBadgeColor(roleName: string): string {
  switch (roleName.toLowerCase()) {
    case "admin":
      return "bg-red-100 text-red-700 border-red-200";
    case "manager":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "staff":
      return "bg-gray-100 text-gray-700 border-gray-200";
    default:
      return "bg-purple-100 text-purple-700 border-purple-200";
  }
}

export function getActionBadgeClass(action: string): string {
  switch (action.toUpperCase()) {
    case "CREATE":
      return "bg-green-100 text-green-800";
    case "READ":
      return "bg-blue-100 text-blue-800";
    case "UPDATE":
      return "bg-amber-100 text-amber-800";
    case "DELETE":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export interface ActionLabel {
  label: string;
  color: string;
}

export function getActionLabel(action: string): ActionLabel {
  const labels: Record<string, ActionLabel> = {
    CREATE: {
      label: "Dibuat",
      color: "bg-green-100 text-green-800 border-green-200",
    },
    UPDATE: {
      label: "Diperbarui",
      color: "bg-amber-100 text-amber-800 border-amber-200",
    },
    DELETE: {
      label: "Dihapus",
      color: "bg-red-100 text-red-800 border-red-200",
    },
    RESTORE: {
      label: "Dipulihkan",
      color: "bg-blue-100 text-blue-800 border-blue-200",
    },
  };

  return (
    labels[action] || {
      label: action,
      color: "bg-gray-100 text-gray-800 border-gray-200",
    }
  );
}

export function getShipmentStatusBadgeClass(status: string): string {
  switch (status) {
    case "PENDING":
      return "bg-yellow-50 text-yellow-600 border-yellow-200";
    case "PROSES":
      return "bg-blue-50 text-blue-600 border-blue-200";
    case "COMPLETED":
      return "bg-green-50 text-green-600 border-green-200";
    default:
      return "bg-gray-50 text-gray-600 border-gray-200";
  }
}

export function getShipmentTypeLabel(type: string): string {
  return type === "ANTAR" ? "Antar" : "Jemput";
}
