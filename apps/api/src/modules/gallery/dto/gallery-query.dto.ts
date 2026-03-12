import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ProjectCategory } from '@app/database/entities/gallery-project.entity';

export class GalleryQueryDto {
  @ApiProperty({ default: 1, description: 'Page number (1-indexed)', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ default: 20, description: 'Items per page (max 100)', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiProperty({ enum: ProjectCategory, required: false })
  @IsOptional()
  @IsEnum(ProjectCategory)
  category?: ProjectCategory;

  get skip(): number {
    return ((this.page ?? 1) - 1) * (this.limit ?? 20);
  }
}
