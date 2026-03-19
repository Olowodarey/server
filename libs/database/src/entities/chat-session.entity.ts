import { Column, Entity, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { BaseEntity } from "./base.entity";
import { User } from "./user.entity";
import { ChatMessage } from "./chat-message.entity";

@Entity("chat_sessions")
export class ChatSession extends BaseEntity {
  @Column({ name: "user_id" })
  userId: string;

  @Column({ nullable: true, length: 255 })
  title: string;

  @Column({ name: "current_course_id", nullable: true })
  currentCourseId: number;

  @Column({ name: "current_lesson_id", nullable: true })
  currentLessonId: number;

  @ManyToOne(() => User, (u) => u.chatSessions)
  @JoinColumn({ name: "user_id" })
  user: User;

  @OneToMany(() => ChatMessage, (m) => m.session)
  messages: ChatMessage[];
}
