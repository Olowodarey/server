import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsOptional, MinLength } from 'class-validator';
import { ModerationStatus } from '@app/database/entities/gallery-project.entity';

export class ModerateProjectDto {
    @ApiProperty({ enum: ModerationStatus, description: 'New moderation status' })
    @IsEnum(ModerationStatus)
    status: ModerationStatus;

    @ApiProperty({ description: 'Admin notes or rejection reason' })
    @IsOptional()
    @IsString()
    @MinLength(1)
    notes?: string;
}
