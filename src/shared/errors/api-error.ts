export type ErrorCategory =
  | "AUTH"
  | "FORBIDDEN"
  | "VALIDATION"
  | "NOT_FOUND"
  | "NETWORK"
  | "SERVER"
  | "UNKNOWN";

export interface ApiErrorShape {
  message: string;
  code?: string;
  details?: Record<string, string[]>;
}

export class ApiError extends Error {
  category: ErrorCategory;
  status?: number;
  code?: string;
  details?: Record<string, string[]>;
  retryAfter?: number;

  constructor(
    message: string,
    category: ErrorCategory = "UNKNOWN",
    opts?: {
      status?: number;
      code?: string;
      details?: Record<string, string[]>;
      retryAfter?: number;
    },
  ) {
    super(message);

    this.name = "ApiError";
    this.category = category;
    this.status = opts?.status;
    this.code = opts?.code;
    this.details = opts?.details;
    this.retryAfter = opts?.retryAfter;
  }
}
