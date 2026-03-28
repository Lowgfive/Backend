import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/app-error";

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
    console.error("[Backend Error]", {
        method: req.method,
        path: req.originalUrl,
        status: err?.status || 500,
        code: err?.code || "INTERNAL_SERVER_ERROR",
        message: err?.message || "Internal Server Error",
        stack: err?.stack,
    });

    const isAppError = err instanceof AppError;
    const status = isAppError ? err.status : err.status || 500;
    const code = isAppError ? err.code : err.code || "INTERNAL_SERVER_ERROR";
    const messageKey = isAppError ? err.messageKey : err.messageKey || "errors.internalServerError";
    const message = err.message || "Internal Server Error";

    res.status(status).json({
        success: false,
        code,
        messageKey,
        message,
        ...(err.details !== undefined ? { details: err.details } : {}),
    });
}
