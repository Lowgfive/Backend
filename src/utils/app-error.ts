export class AppError extends Error {
  status: number;
  code: string;
  messageKey: string;
  details?: unknown;

  constructor(
    status: number,
    code: string,
    messageKey: string,
    message?: string,
    details?: unknown
  ) {
    super(message || code);
    this.name = "AppError";
    this.status = status;
    this.code = code;
    this.messageKey = messageKey;
    this.details = details;
  }
}
