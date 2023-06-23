import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import DocOption from './doc-option.entity';
import Document from './document.entity';

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

  @Column({ default: 0 })
  sort: number;

  @CreateDateColumn()
  createAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => DocOption, (docOption) => docOption.category)
  docOption: DocOption[];

  @OneToMany(() => Document, (document) => document.category)
  documents: Document[];
}
