import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export enum QuizFormatDto {
  MULTI_CHOICE = 'multi_choice',
  OPEN_ENDED = 'open_ended',
  MIXED = 'mixed',
}

export class GenerateQuizDto {
  @ApiProperty({ example: 'Clarity smart contracts' })
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  topic: string;

  @ApiProperty({ enum: QuizFormatDto })
  @IsEnum(QuizFormatDto)
  format: QuizFormatDto;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  includeAdvanced?: boolean;
}
