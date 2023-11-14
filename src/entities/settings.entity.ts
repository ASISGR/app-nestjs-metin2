import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ database: 'homepage' })
export class Settings {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  register: number;

  @Column()
  registerEmailVerification: number;

  @Column()
  downloadLink: string;
}
