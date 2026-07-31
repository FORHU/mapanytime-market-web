import { z } from "zod";

const AccountStatusSchema = z
  .union([z.string(), z.number(), z.boolean(), z.null(), z.undefined()])
  .transform((value) => (value == null ? "" : String(value)));

const BooleanLikeSchema = z
  .union([z.boolean(), z.string(), z.number(), z.null(), z.undefined()])
  .transform((value) => {
    if (typeof value === "boolean") return value;
    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();
      return (
        normalized === "true" || normalized === "1" || normalized === "yes"
      );
    }
    if (typeof value === "number") return value === 1;
    return false;
  });

export const UserRoleSchema = z.object({
  id: z.string(),
  roleName: z.string(),
  description: z.string().nullable().optional(),
});

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  firstName: z.string().nullable().optional(),
  lastName: z.string().nullable().optional(),
  phoneNumber: z.string().nullable().optional(),
  countryCode: z.string().nullable().optional(),
  lastLoginAt: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  roles: z.array(UserRoleSchema).optional(),
});

export const UsersListDataSchema = z.object({
  users: z.array(UserSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export const UsersApiResponseSchema = z.object({
  status: z.string().optional(),
  statusCode: z.number().optional(),
  data: UsersListDataSchema,
});

export type UserRole = z.infer<typeof UserRoleSchema>;
export type User = z.infer<typeof UserSchema>;
export type UsersListData = z.infer<typeof UsersListDataSchema>;
export type UsersApiResponse = z.infer<typeof UsersApiResponseSchema>;
