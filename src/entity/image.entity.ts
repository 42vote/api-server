import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import Document from './document.entity';


@Entity()
export default class Image {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Document)
  document: Document;

  @Column()
  directory: string;

  @Column()
  filename: string;

  @CreateDateColumn()
  createdAt: Date;
}