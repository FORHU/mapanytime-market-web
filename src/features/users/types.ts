export interface UserRole {
  id: string;
  roleName: string;
  description: string | null;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string | null;
  avatarId: string | null;
  accountStatus: string;
  isEmailVerified: boolean;
  isOnBoarding: boolean;
  countryCode: string;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  roles?: UserRole[];
}

export interface UsersListData {
  items: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
