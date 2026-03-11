import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';

export enum BuilderCategory {
  ECOSYSTEM = 'Ecosystem',
  DEFI = 'DeFi',
  NFTS = 'NFTs',
  TOOLING = 'Tooling',
  EDUCATION = 'Education',
}

@Entity('builder_profiles')
export class BuilderProfile extends BaseEntity {
  @Column({ length: 100 })
  name: string;

  @Column({ length: 100 })
  handle: string;

  @Column({ length: 200 })
  role: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ name: 'twitter_url', nullable: true })
  twitterUrl: string;

  @Column({ name: 'website_url', nullable: true })
  websiteUrl: string;

  @Column({ type: 'enum', enum: BuilderCategory })
  category: BuilderCategory;

  @Column({ nullable: true, length: 50 })
  followers: string;

  @Column({ name: 'avatar_gradient', length: 100 })
  avatarGradient: string;

  @Column({ length: 10 })
  initials: string;

  @Column({ name: 'is_approved', default: false })
  isApproved: boolean;

  @Column({ name: 'submitted_by', nullable: true })
  submittedBy: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'submitted_by' })
  submitter: User;
}
