import { IErrorMessage } from "../types/errors.types";
import handleDuplicateError from "./handleDuplicateError";

export default function handleMongooseServerError(error: any) {
  if (error.code === 11000) {
    return handleDuplicateError(error);
  }

  const message = error.message || "Database operation failed.";
  const errorMessages: IErrorMessage[] = [
    { path: "", message: message }
  ];

  return { code: 500, message, errorMessages };
}