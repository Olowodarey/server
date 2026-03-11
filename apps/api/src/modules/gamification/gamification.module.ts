import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@app/database/entities/user.entity';
import { XpEvent } from '@app/database/entities/xp-event.entity';
import { Badge } from '@app/database/entities/badge.entity';
import { UserBadge } from '@app/database/entities/user-badge.entity';
import { GamificationController } from './gamification.controller';
import { GamificationService } from './gamification.service';
import { XpService } from './xp/xp.service';
import { BadgesService } from './badges/badges.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, XpEvent, Badge, UserBadge])],
  controllers: [GamificationController],
  providers: [GamificationService, XpService, BadgesService],
  exports: [XpService, BadgesService],
})
export class GamificationModule {}
