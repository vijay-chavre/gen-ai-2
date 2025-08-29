import { ErrorResponse } from "./types";

import axios, { AxiosError } from "axios";
import { toast } from "sonner";
export const errorHandler = (error: ErrorResponse) => {
  return error;
};

export const errorHandlerResponse = (error: AxiosError | ErrorResponse) => {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message || error.message;

    switch (error.response?.status) {
      case 400:
        toast.error(`Bad Request: ${message}`);
        break;
      case 401:
        toast.error(`Unauthorized: ${message}`);
        break;
      case 403:
        toast.error(`Forbidden: ${message}`);
        break;
      case 404:
        toast.error(`Not Found: ${message}`);
        break;
      case 500:
        toast.error(`Server Error: ${message}`);
        break;
      default:
        toast.error(`Error: ${message}`);
    }
  } else {
    if (error.statusCode === "ERR_CANCELED") {
      // toast.error("Request was canceled");
    } else {
      toast.error(error.message || "An unexpected error occurred");
    }
  }

  return error;
};
