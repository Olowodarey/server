import { Column, Entity, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { BaseEntity } from "./base.entity";
import { User } from "./user.entity";
import { ProjectVote } from "./project-vote.entity";

export enum ProjectCategory {
  DEFI = "DeFi",
  NFTS = "NFTs",
  DAOS = "DAOs",
  TOOLING = "Tooling",
  OTHER = "Other",
}

export enum ModerationStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

@Entity("gallery_projects")
export class GalleryProject extends BaseEntity {
  @Column({ name: "user_id" })
  userId: string;

  @Column({ length: 200 })
  title: string;

  @Column({ type: "text" })
  description: string;

  @Column({ type: "enum", enum: ProjectCategory })
  category: ProjectCategory;

  @Column({ name: "repo_url", nullable: true })
  repoUrl: string;

  @Column({ name: "contract_address", nullable: true, length: 100 })
  contractAddress: string;

  @Column({ name: "demo_url", nullable: true })
  demoUrl: string;

  @Column({ name: "vote_count", default: 0 })
  voteCount: number;

  @Column({ name: "is_featured", default: false })
  isFeatured: boolean;

  @Column({
    name: "moderation_status",
    type: "enum",
    enum: ModerationStatus,
    default: ModerationStatus.PENDING,
  })
  moderationStatus: ModerationStatus;

  @ManyToOne(() => User, (u) => u.projects)
  @JoinColumn({ name: "user_id" })
  user: User;

  @OneToMany(() => ProjectVote, (v) => v.project)
  votes: ProjectVote[];
}
