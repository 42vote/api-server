import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany
} from 'typeorm';
import DocOption from './doc_option.entity';
import Document from './document.entity';



@Entity()
export default class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  disabled: boolean;


  @Column()
  multipleVote: boolean;

  @Column()
  anonymousVote: boolean;

  @CreateDateColumn()
  createAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => DocOption, docOption => docOption.category)
  docOption: DocOption;

  @OneToMany(() => Document, document => document.category)
  documents: Document [];
}