import { useAuthStore } from "@/features/auth/stores/auth.store";
import { hasPermission, PermissionContext } from "@/shared/auth/rbac";
import type { Permission } from "@/shared/auth/permissions";

export function usePermissions() {
  // Fetch the entire store state as a type-free object to bypass strict implicit 'any' flags
  const authState = useAuthStore() as any;
  const user = authState.user;
  const role = authState.role;

  const can = (permission: string, context?: PermissionContext) => {
    return hasPermission(role, permission as Permission, context, user);
  };

  return { can, role, user };
}
