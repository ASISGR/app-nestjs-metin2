import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ database: 'player' })
export class PlayerIndex {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  pid1: string;

  @Column()
  pid2: string;

  @Column()
  pid3: string;

  @Column()
  pid4: string;

  @Column()
  empire: string;
}
