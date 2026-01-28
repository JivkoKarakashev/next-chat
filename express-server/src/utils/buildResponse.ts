import { CustomError } from "../types/customError";
import { ReturnResponse } from "../types/response";

function successResponse(success: boolean): ReturnResponse {
  return { success, data: {} };
}

function errorResponse(success: boolean, error: CustomError): ReturnResponse {
  const { statusCode, name, message } = error;
  return { success, data: { error: { statusCode, name, message } } };
}

const boundSuccessResponse = successResponse.bind(null, true);
const boundErrorResponse = errorResponse.bind(null, false);

export {
  boundSuccessResponse,
  boundErrorResponse
}