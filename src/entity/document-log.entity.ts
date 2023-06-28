import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export default class DocumentLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ length: 500 })
  context: string;

  @Column()
  author: string;

  @Column()
  category: string;

  @Column()
  createdAt: Date;

  @CreateDateColumn()
  deletedAt: Date;
}
