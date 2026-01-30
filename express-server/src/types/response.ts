import { CustomError } from "./customError";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
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