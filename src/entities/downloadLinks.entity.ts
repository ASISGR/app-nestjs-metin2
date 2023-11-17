import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ database: 'homepage' })
export class Downloadlinks {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  downloadUrl: string;
}
