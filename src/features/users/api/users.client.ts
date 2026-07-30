import { fetcher } from "@/shared/lib/http";
import {
  UsersApiResponseSchema,
  UsersListData,
} from "../contracts/users.contract";

export const getUsers = async (): Promise<UsersListData> => {
  const raw = await fetcher<unknown>("/api/v1/users");
  const parsed = UsersApiResponseSchema.parse(raw);
  return parsed.data;
};
