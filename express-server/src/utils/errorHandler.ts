import { Request, Response, NextFunction } from "express";

import { CustomError } from "../types/customError";
import { boundErrorResponse } from "./buildResponse";

const errorHandler = (err: Error | CustomError, req: Request, res: Response, next: NextFunction) => {
    // console.log(err);
    if (err instanceof CustomError) {
        return res.status(err.statusCode).json(boundErrorResponse(err));
    }
    if (err instanceof Error) {
        const { name, message } = err;
        return res.status(500).json({ name, message });
    }
    return res.status(500).json({ name: 'UnknownError', message: String(err) });
};

export {
    errorHandler
}