import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn
} from "typeorm";
import User from "./user.entity";
import Document from "./document.entity";


@Entity()
export default class Vote {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Document)
  document: Document;

  @CreateDateColumn()
  createAt: number;
}