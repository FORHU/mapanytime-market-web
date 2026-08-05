export interface SellerRegistrationInput {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  storeName: string;
  businessEmail: string;
  businessPhone: string;
  sellerPlan: string;
  agentNotes?: string;
}

export interface SellerRegistrationResult {
  sellerId: string;
  userId: string;
  email: string;
  storeName: string;
  businessEmail: string;
  businessPhone: string;
  temporaryPassword: string;
  requiresOnboarding: boolean;
}

export interface AgentRecruit {
  sellerId: string;
  sellerName: string;
  dateRecruited: string;
  status: "Pending Onboarding" | "Active" | "Incomplete";
}

export interface AgentOnboardingInput {
  storeData: {
    storeName: string;
    categoryIds: string[];
    email: string;
    phone: string;
  };
  locationData: {
    currentAddress: string;
    homeAddress: string;
    city: string;
    province: string;
    zipCode: string;
    country: string;
    latitude: number;
    longitude: number;
  };
  hoursData: Array<{
    dayOfWeek: number;
    openMinutes: number;
    closeMinutes: number;
    isClosed: boolean;
  }>;
}

export interface AgentOnboardingResult {
  sellerId: string;
  storeId: string;
  onboardingStep: number;
  isOnboarded: boolean;
  status: string;
}
