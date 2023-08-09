import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ database: 'player' })
export class GuildMember {
  @PrimaryGeneratedColumn({ name: 'pid', type: 'int', unsigned: true })
  id: number;

  @Column({ name: 'pid', type: 'int', unsigned: true })
  pid: number;

  @Column({ name: 'guild_id', type: 'int', unsigned: true })
  guildId: number;

  @Column({ name: 'grade', type: 'tinyint', nullable: true })
  grade: number;

  @Column({ name: 'is_general', type: 'tinyint' })
  isGeneral: boolean;

  @Column({ name: 'offer', type: 'int', unsigned: true, nullable: true })
  offer: number;
}
