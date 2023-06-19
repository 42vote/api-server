import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export default class VoteLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  documentId: number;

  @Column()
  state: number; // 0: unvote, 1: vote

  @CreateDateColumn()
  createdAt: number;
}
