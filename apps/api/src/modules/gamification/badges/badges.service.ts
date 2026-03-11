import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Badge } from '@app/database/entities/badge.entity';
import { UserBadge } from '@app/database/entities/user-badge.entity';
import { User } from '@app/database/entities/user.entity';

@Injectable()
export class BadgesService {
  constructor(
    @InjectRepository(Badge)
    private readonly badgeRepo: Repository<Badge>,
    @InjectRepository(UserBadge)
    private readonly userBadgeRepo: Repository<UserBadge>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async getAll() {
    return this.badgeRepo.find({ order: { id: 'ASC' } });
  }

  async getUserBadges(userId: string) {
    return this.userBadgeRepo.find({
      where: { userId },
      relations: ['badge'],
      order: { earnedAt: 'DESC' },
    });
  }

  async checkAndAward(userId: string, triggerCondition: string) {
    const badge = await this.badgeRepo.findOne({ where: { triggerCondition } });
    if (!badge) return null;

    const existing = await this.userBadgeRepo.findOne({
      where: { userId, badgeId: badge.id },
    });
    if (existing) return null; // already earned

    const ub = this.userBadgeRepo.create({ userId, badgeId: badge.id });
    await this.userBadgeRepo.save(ub);
    return badge;
  }
}
