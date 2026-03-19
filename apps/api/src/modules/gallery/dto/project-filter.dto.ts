import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsOptional } from "class-validator";
import { ProjectCategory } from "@app/database/entities/gallery-project.entity";

export class ProjectFilterDto {
  @ApiProperty({ enum: ProjectCategory, required: false })
  @IsOptional()
  @IsEnum(ProjectCategory)
  category?: ProjectCategory;
}
