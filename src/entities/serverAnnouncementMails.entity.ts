import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ database: 'homepage' })
export class Email {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;
}
