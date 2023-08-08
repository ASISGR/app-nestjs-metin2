import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ database: 'player' })
export class Safebox {
  @PrimaryGeneratedColumn()
  account_id: number;

  @Column()
  size: number;

  @Column()
  password: string;

  @Column()
  gold: number;
}
