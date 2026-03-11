import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min, Max } from 'class-validator';

export class MintCertificateDto {
  @ApiProperty({ example: 3, description: 'Course module ID (1-6)' })
  @IsInt()
  @Min(1)
  @Max(6)
  moduleId: number;

  @ApiProperty({ example: 92, description: 'Final assessment score (0-100)' })
  @IsInt()
  @Min(0)
  @Max(100)
  score: number;
}
