import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import Document from './document.entity';
import Vote from './vote.entity';

@Entity()
export default class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  intraId: string;

  @Column({ unique: true })
  email: string;

  @Column({ default: false })
  isAdmin: boolean;

  @Column({ default: 0 })
  wallet: number;

  @Column({ default: null })
  accessToken: string;

  @Column({ default: null })
  accessTokenExpiredAt: Date;

  @Column({ default: null })
  refreshToken: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Document, (document) => document.author)
  documents: Document[];

  @OneToMany(() => Vote, (vote) => vote.user)
  votes: Vote[];
}
