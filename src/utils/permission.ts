import { PERMISSION } from "@/constant/PERMISSION";

/**
 * Helper functions untuk manajemen izin
 */

type Permission = { resource: string; action: string; id?: string };

/**
 * Menghitung perubahan izin antara pilihan awal dan saat ini
 */
export function getChangedPermissions(initialPermissions: string[], selectedPermissions: string[]) {
  return {
    added: selectedPermissions.filter((id) => !initialPermissions.includes(id)),
    removed: initialPermissions.filter((id) => !selectedPermissions.includes(id)),
  };
}

/**
 * Memeriksa apakah ada perubahan pada izin
 */
export function hasPermissionChanges(initialPermissions: string[], selectedPermissions: string[]) {
  const { added, removed } = getChangedPermissions(initialPermissions, selectedPermissions);
  return added.length > 0 || removed.length > 0;
}

/**
 * Mengelompokkan izin berdasarkan resource
 */
export function groupPermissionsByResource<T extends { resource: string }>(permissions: T[]): Record<string, T[]> {
  return permissions.reduce((acc, permission) => {
    const { resource } = permission;
    if (!acc[resource]) acc[resource] = [];
    acc[resource].push(permission);
    return acc;
  }, {} as Record<string, T[]>);
}

/**
 * Memeriksa apakah pengguna memiliki izin tertentu
 */
export function hasPermission(userPermissions: Permission[] | undefined | null, resource: string, action: string): boolean {
  if (!userPermissions) return false;
  return userPermissions.some((p) => p.resource === resource && p.action === action);
}

/**
 * Mendapatkan daftar resource yang tersedia
 */
export function getAvailableResources() {
  return Object.values(PERMISSION.RESOURCES);
}

/**
 * Mendapatkan daftar actions yang tersedia
 */
export function getAvailableActions() {
  return Object.values(PERMISSION.ACTIONS);
}

/**
 * Membuat permission ID dari resource dan action
 */
export function createPermissionId(resource: string, action: string): string {
  return `${resource}:${action}`;
}

/**
 * Parse permission ID menjadi resource dan action
 */
export function parsePermissionId(permissionId: string): { resource: string; action: string } | null {
  const parts = permissionId.split(":");
  if (parts.length !== 2) return null;

  return {
    resource: parts[0],
    action: parts[1],
  };
}
