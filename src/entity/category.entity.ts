import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
} from 'typeorm';
import DocOption from './doc-option.entity';
import Document from './document.entity';
import User from './user.entity';

@Entity()
export default class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  multipleVote: boolean;

  @Column()
  anonymousVote: boolean;

  @Column({ default: false })
  whitelistOnly: boolean;

  @Column({ type: 'simple-array' })
  whitelist: string[];

  @Column({ default: 0 })
  sort: number;

  @Column({ default: false})
  hide: boolean;

  @CreateDateColumn()
  createAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => DocOption, (docOption) => docOption.category)
  docOption: DocOption[];

  @OneToMany(() => Document, (document) => document.category)
  documents: Document[];


}
