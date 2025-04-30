/**
 * Helper functions for managing permissions
 */

/**
 * Calculate changed permissions from initial and current selections
 */
export function getChangedPermissions(
  initialPermissions: string[],
  selectedPermissions: string[]
) {
  const added = selectedPermissions.filter(
    (id) => !initialPermissions.includes(id)
  );
  const removed = initialPermissions.filter(
    (id) => !selectedPermissions.includes(id)
  );

  return {
    added,
    removed,
  };
}

/**
 * Check if there are any changes to permissions
 */
export function hasPermissionChanges(
  initialPermissions: string[],
  selectedPermissions: string[]
) {
  const { added, removed } = getChangedPermissions(
    initialPermissions,
    selectedPermissions
  );
  return added.length > 0 || removed.length > 0;
}

/**
 * Group permissions by resource
 */
export function groupPermissionsByResource<T extends { resource: string }>(
  permissions: T[]
) {
  return permissions.reduce((acc, permission) => {
    const resource = permission.resource;
    if (!acc[resource]) {
      acc[resource] = [];
    }
    acc[resource].push(permission);
    return acc;
  }, {} as Record<string, T[]>);
}
