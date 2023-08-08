import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { Player } from './player.entity';

@Entity({ database: 'player' })
export class Guild {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  sp: string;

  @Column()
  master: string;

  @Column()
  level: string;

  @Column()
  exp: string;

  @Column()
  skill_point: string;

  @Column()
  skill: string;

  @Column()
  win: string;

  @Column()
  draw: string;

  @Column()
  loss: string;

  @Column()
  ladder_point: string;

  @Column()
  gold: string;

  @OneToOne(() => Player)
  @JoinColumn({ name: 'master', referencedColumnName: 'id' })
  player: Player;
}
