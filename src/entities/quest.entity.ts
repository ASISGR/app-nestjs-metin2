import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

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
}
