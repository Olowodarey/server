import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsOptional, IsString, MinLength } from "class-validator";

export class ChatMessageDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  message: string;

  @ApiProperty({ required: false, description: "Resume existing session" })
  @IsOptional()
  @IsString()
  sessionId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  currentCourseId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  currentLessonId?: number;
}
