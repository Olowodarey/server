import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsOptional, MinLength } from "class-validator";

export class ApproveBuilderDto {
  @ApiProperty({ description: "Optional admin notes for approval" })
  @IsOptional()
  @IsString()
  @MinLength(1)
  notes?: string;
}

export class RejectBuilderDto {
  @ApiProperty({ description: "Reason for rejection" })
  @IsString()
  @MinLength(5)
  reason: string;
}
