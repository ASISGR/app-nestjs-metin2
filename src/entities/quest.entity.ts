import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Player } from './player.entity';

@Entity({ database: 'player' })
export class Quest {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  dwPID: number;

  @Column({ type: 'varchar', length: 32 })
  szName: string;

  @Column({ type: 'varchar', length: 64 })
  szState: string;

  @Column({ type: 'int' })
  lValue: number;

  @JoinColumn({ name: 'dwPID', referencedColumnName: 'id' })
  @ManyToOne(() => Player, (player) => player.quests)
  player: Player;
}
