import { PERMISSION } from "@/constant/PERMISSION";



type Permission = { resource: string; action: string; id?: string };


export function getChangedPermissions(initialPermissions: string[], selectedPermissions: string[]) {
  return {
    added: selectedPermissions.filter((id) => !initialPermissions.includes(id)),
    removed: initialPermissions.filter((id) => !selectedPermissions.includes(id)),
  };
}


export function hasPermissionChanges(initialPermissions: string[], selectedPermissions: string[]) {
  const { added, removed } = getChangedPermissions(initialPermissions, selectedPermissions);
  return added.length > 0 || removed.length > 0;
}


export function groupPermissionsByResource<T extends { resource: string }>(permissions: T[]): Record<string, T[]> {
  return permissions.reduce((acc, permission) => {
    const { resource } = permission;
    if (!acc[resource]) acc[resource] = [];
    acc[resource].push(permission);
    return acc;
  }, {} as Record<string, T[]>);
}


export function hasPermission(userPermissions: Permission[] | undefined | null, resource: string, action: string): boolean {
  if (!userPermissions) return false;
  return userPermissions.some((p) => p.resource === resource && p.action === action);
}


export function getAvailableResources() {
  return Object.values(PERMISSION.RESOURCES);
}


export function getAvailableActions() {
  return Object.values(PERMISSION.ACTIONS);
}


export function createPermissionId(resource: string, action: string): string {
  return `${resource}:${action}`;
}


export function parsePermissionId(permissionId: string): { resource: string; action: string } | null {
  const parts = permissionId.split(":");
  if (parts.length !== 2) return null;

  return {
    resource: parts[0],
    action: parts[1],
  };
}
