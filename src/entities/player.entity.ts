import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ database: 'player' })
export class Player {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  account_id: number;

  @Column()
  name: string;

  @Column()
  job: string;

  @Column()
  voice: string;

  @Column()
  dir: string;

  @Column()
  x: string;

  @Column()
  y: string;

  @Column()
  z: string;

  @Column()
  map_index: string;

  @Column()
  exit_x: string;

  @Column()
  exit_y: string;

  @Column()
  exit_map_index: string;

  @Column()
  hp: string;

  @Column()
  mp: string;

  @Column()
  stamina: string;

  @Column()
  random_hp: string;

  @Column()
  random_sp: string;

  @Column()
  playtime: string;

  @Column()
  level: string;

  @Column()
  level_step: string;

  @Column()
  st: string;

  @Column()
  ht: string;

  @Column()
  dx: string;

  @Column()
  iq: string;

  @Column()
  exp: string;

  @Column()
  gold: number;

  @Column()
  stat_point: string;

  @Column()
  skill_point: string;

  @Column()
  quickslot: string;

  @Column()
  ip: string;

  @Column()
  part_main: string;

  @Column()
  part_base: string;

  @Column()
  part_hair: string;

  @Column()
  part_sash: string;

  @Column()
  skill_group: string;

  @Column()
  skill_level: string;

  @Column()
  alignment: string;

  @Column()
  last_play: string;

  @Column()
  change_name: string;

  @Column()
  mobile: string;

  @Column()
  sub_skill_point: string;

  @Column()
  stat_reset_count: string;

  @Column()
  horse_hp: string;

  @Column()
  horse_stamina: string;

  @Column()
  horse_level: string;

  @Column()
  horse_hp_droptime: string;

  @Column()
  horse_riding: string;

  @Column()
  horse_skill_point: string;
}
