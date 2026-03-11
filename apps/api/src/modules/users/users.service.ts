import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@app/database/entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async findById(id: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  async findByWalletAddress(walletAddress: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { walletAddress } });
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<User> {
    const user = await this.findById(userId);
    Object.assign(user, dto);
    return this.userRepo.save(user);
  }

  async getStats(userId: string) {
    const user = await this.findById(userId);
    return {
      xpTotal: user.xpTotal,
      level: user.level,
      streakDays: user.streakDays,
      longestStreak: user.longestStreak,
      lastActivityAt: user.lastActivityAt,
    };
  }
}
