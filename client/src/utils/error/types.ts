export interface CustomErrorType extends Error {
  errors(errors: unknown): unknown;
  statusCode?: number;
  code: number;
}

type error = {
  message: string;
  errorDetails?: CustomErrorType;
};

export interface ErrorResponse {
  status: "fail";
  statusCode: number;
  errors: error | error[];
}

export interface SuccessResponse<T> {
  statusCode: number;
  data: T;
}

export interface ApiResponse<T> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}

export interface Pagination {
  currentPage: number;
  nextPage: number | null;
  totalPages: number;
}
