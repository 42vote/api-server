import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import User from './user.entity';
import Category from './category.entity';
import DocOption from './doc-option.entity';
import Vote from './vote.entity';
import Image from './image.entity';

@Entity()
export default class Document {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ length: 500 })
  context: string;

  @ManyToOne(() => User)
  author: User;

  @ManyToOne(() => Category)
  category: Category;

  @ManyToOne(() => DocOption)
  option: DocOption;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Vote, (vote) => vote.document)
  votes: Vote[];

  @OneToMany(() => Image, (image) => image.document)
  images: Image[];
}
