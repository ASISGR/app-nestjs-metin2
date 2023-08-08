import { AttributeTypeRare } from 'src/enums/attribute-type.enum';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ database: 'player' })
export class ItemAttrRare {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: AttributeTypeRare,
  })
  apply: AttributeTypeRare;

  @Column({ type: 'varchar', length: 100 })
  prob: string;

  @Column({ type: 'varchar', length: 100 })
  lv1: string;

  @Column({ type: 'varchar', length: 100 })
  lv2: string;

  @Column({ type: 'varchar', length: 100 })
  lv3: string;

  @Column({ type: 'varchar', length: 100 })
  lv4: string;

  @Column({ type: 'varchar', length: 100 })
  lv5: string;

  @Column({ type: 'varchar', length: 100 })
  weapon: string;

  @Column({ type: 'varchar', length: 100 })
  body: string;

  @Column({ type: 'varchar', length: 100 })
  wrist: string;

  @Column({ type: 'varchar', length: 100 })
  foots: string;

  @Column({ type: 'varchar', length: 100 })
  neck: string;

  @Column({ type: 'varchar', length: 100 })
  head: string;

  @Column({ type: 'varchar', length: 100 })
  shield: string;

  @Column({ type: 'varchar', length: 100 })
  ear: string;
}
