import { Controller, Get, Head } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { Public } from "@app/common/decorators/public.decorator";

@ApiTags("health")
@Controller()
export class HealthController {
  @Public()
  @Get()
  @Head()
  @ApiOperation({ summary: "Root health check endpoint" })
  @ApiResponse({
    status: 200,
    description: "Service is healthy",
    schema: {
      type: "object",
      properties: {
        status: { type: "string", example: "ok" },
        timestamp: { type: "string", example: "2026-03-19T12:00:00.000Z" },
        uptime: { type: "number", example: 123.456 },
      },
    },
  })
  rootCheck() {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  @Public()
  @Get("health")
  @ApiOperation({ summary: "Health check endpoint" })
  @ApiResponse({
    status: 200,
    description: "Service is healthy",
    schema: {
      type: "object",
      properties: {
        status: { type: "string", example: "ok" },
        timestamp: { type: "string", example: "2026-03-19T12:00:00.000Z" },
        uptime: { type: "number", example: 123.456 },
      },
    },
  })
  check() {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
