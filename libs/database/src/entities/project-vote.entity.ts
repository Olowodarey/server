import { CreateDateColumn, Entity, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';
import { GalleryProject } from './gallery-project.entity';

@Entity('project_votes')
export class ProjectVote {
  @PrimaryColumn({ name: 'user_id' })
  userId: string;

  @PrimaryColumn({ name: 'project_id' })
  projectId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => GalleryProject, (p) => p.votes)
  @JoinColumn({ name: 'project_id' })
  project: GalleryProject;
}
