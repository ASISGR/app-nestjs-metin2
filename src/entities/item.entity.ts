import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ database: 'player' })
export class Item {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  owner_id: string;

  @Column()
  window: string;

  @Column()
  pos: string;

  @Column()
  count: string;

  @Column()
  vnum: string;

  @Column()
  socket0: string;

  @Column()
  socket1: string;

  @Column()
  socket2: string;

  @Column()
  socket3: string;

  @Column()
  socket4: string;

  @Column()
  socket5: string;

  @Column()
  attrtype0: string;

  @Column()
  attrvalue0: string;

  @Column()
  attrtype1: string;

  @Column()
  attrvalue1: string;

  @Column()
  attrtype2: string;

  @Column()
  attrvalue2: string;

  @Column()
  attrtype3: string;

  @Column()
  attrvalue3: string;

  @Column()
  attrtype4: string;

  @Column()
  attrvalue4: string;

  @Column()
  attrtype5: string;

  @Column()
  attrvalue5: string;

  @Column()
  attrtype6: string;

  @Column()
  attrvalue6: string;
}
