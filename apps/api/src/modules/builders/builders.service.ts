import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BuilderProfile, BuilderCategory } from '@app/database/entities/builder-profile.entity';
import { SubmitBuilderDto } from './dto/submit-builder.dto';

@Injectable()
export class BuildersService {
  constructor(
    @InjectRepository(BuilderProfile)
    private readonly repo: Repository<BuilderProfile>,
  ) {}

  async findAll(category?: BuilderCategory) {
    const qb = this.repo.createQueryBuilder('b').where('b.is_approved = true');
    if (category) qb.andWhere('b.category = :category', { category });
    return qb.orderBy('b.created_at', 'DESC').getMany();
  }

  async findOne(id: string) {
    const builder = await this.repo.findOne({ where: { id, isApproved: true } });
    if (!builder) throw new NotFoundException('Builder profile not found');
    return builder;
  }

  async submit(userId: string, dto: SubmitBuilderDto) {
    const profile = this.repo.create({ ...dto, submittedBy: userId, isApproved: false });
    return this.repo.save(profile);
  }
}
