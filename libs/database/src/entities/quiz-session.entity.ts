import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';

export enum QuizFormat {
  MULTI_CHOICE = 'multi_choice',
  OPEN_ENDED = 'open_ended',
  MIXED = 'mixed',
}

@Entity('quiz_sessions')
export class QuizSession extends BaseEntity {
  @Column({ name: 'user_id' })
  userId: string;

  @Column({ length: 255 })
  topic: string;

  @Column({ type: 'enum', enum: QuizFormat })
  format: QuizFormat;

  @Column({ name: 'include_advanced', default: false })
  includeAdvanced: boolean;

  @Column({ type: 'jsonb', nullable: true })
  questions: object;

  @Column({ nullable: true })
  score: number;

  @Column({ name: 'graded_at', nullable: true })
  gradedAt: Date;

  @ManyToOne(() => User, (u) => u.quizSessions)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
