import { CustomError } from "./customError";

interface SuccessData {
    // verified: boolean
}

interface ErrorData extends SuccessData {
    error: Error | CustomError
}

interface ReturnResponse {
    success: boolean,
    data: SuccessData | ErrorData
}

export {
    type ReturnResponse
}