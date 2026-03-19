import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { UserBadge } from "./user-badge.entity";

@Entity("badges")
export class Badge {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ unique: true, length: 100 })
  slug: string;

  @Column({ length: 100 })
  name: string;

  @Column({ type: "text" })
  description: string;

  @Column({ name: "image_url" })
  imageUrl: string;

  @Column({ name: "xp_reward", default: 0 })
  xpReward: number;

  @Column({ name: "trigger_condition", length: 255 })
  triggerCondition: string;

  @OneToMany(() => UserBadge, (ub) => ub.badge)
  earnedBy: UserBadge[];
}
