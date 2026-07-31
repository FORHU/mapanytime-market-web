import { fetcher } from "@/shared/lib/http";
import {
  CatalogRole,
  RolesCatalogResponseSchema,
  User,
  UserResponseSchema,
  UsersApiResponseSchema,
  UsersListData,
} from "../contracts/users.contract";

export const getUsers = async (): Promise<UsersListData> => {
  const raw = await fetcher<unknown>("/api/v1/users");
  const parsed = UsersApiResponseSchema.parse(raw);
  return parsed.data;
};

export const getRoles = async (): Promise<CatalogRole[]> => {
  const raw = await fetcher<unknown>("/api/v1/rbac/roles");
  const parsed = RolesCatalogResponseSchema.parse(raw);
  return parsed.data;
};

export const getUser = async (userId: string): Promise<User> => {
  const raw = await fetcher<unknown>(`/api/v1/users/${userId}`);
  const parsed = UserResponseSchema.parse(raw);
  return parsed.data;
};

export const replaceUserRoles = async (
  userId: string,
  roleNames: string[],
): Promise<User> => {
  const raw = await fetcher<unknown>(`/api/v1/users/${userId}/roles`, {
    method: "PUT",
    body: JSON.stringify({ roleNames }),
  });
  const parsed = UserResponseSchema.parse(raw);
  return parsed.data.roles ? parsed.data : getUser(userId);
};
