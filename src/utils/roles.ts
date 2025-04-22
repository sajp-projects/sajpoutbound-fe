/**
 * Get badge variant based on role name
 */
export function getRoleBadgeVariant(
  roleName: string
): 'default' | 'destructive' | 'outline' | 'secondary' | 'info' {
  switch (roleName.toLowerCase()) {
    case 'admin':
      return 'destructive';
    case 'manager':
      return 'info';
    case 'staff':
      return 'secondary';
    default:
      return 'default';
  }
}

/**
 * Get badge color based on role name
 */
export function getRoleBadgeColor(roleName: string): string {
  switch (roleName.toLowerCase()) {
    case 'admin':
      return 'bg-red-100 text-red-700 border-red-200';
    case 'manager':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'staff':
      return 'bg-gray-100 text-gray-700 border-gray-200';
    default:
      return 'bg-purple-100 text-purple-700 border-purple-200';
  }
}
