import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Request, Response } from "express";

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : "Internal server error";

    const errorMessage =
      typeof message === "string"
        ? message
        : (message as any)?.message || "An error occurred";

    // Log at appropriate level based on status code
    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      // 500 errors are critical - log as error with full details
      this.logger.error(
        `${request.method} ${request.url} → ${status}: ${errorMessage}`,
      );
      this.logger.error("Exception details:", exception);
      if (exception instanceof Error) {
        this.logger.error("Stack trace:", exception.stack);
      }
    } else if (status === HttpStatus.NOT_FOUND) {
      // 404 errors are expected - log as debug/info only
      this.logger.debug(
        `${request.method} ${request.url} → ${status}: ${errorMessage}`,
      );
    } else if (status >= 400 && status < 500) {
      // Other 4xx errors are client errors - log as warning
      this.logger.warn(
        `${request.method} ${request.url} → ${status}: ${errorMessage}`,
      );
    } else {
      // Other errors - log as error
      this.logger.error(
        `${request.method} ${request.url} → ${status}: ${errorMessage}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    response.status(status).json({
      success: false,
      error: {
        statusCode: status,
        message: errorMessage,
        timestamp: new Date().toISOString(),
        path: request.url,
      },
    });
  }
}
