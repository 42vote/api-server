import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import Category from './category.entity';
import Document from './document.entity';

@Entity()
export default class DocOption {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  goal: number;

  @Column()
  voteStart: Date;

  @Column()
  voteExpire: Date;

  @Column()
  docStart: Date;

  @Column()
  docExpire: Date;

  @ManyToOne(() => Category)
  category: Category;

  @OneToMany(() => Document, (document) => document.option)
  documents: Document[];
}
