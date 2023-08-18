import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ database: 'homepage' })
export class News {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  title: string;

  @Column({
    name: 'post_content',
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  postContent: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  author: string;

  @Column({ name: 'created_at', type: 'varchar', length: 255, nullable: false })
  created_at: Date;

  @Column({ name: 'updated_at', type: 'varchar', length: 255, nullable: false })
  updated_at: Date;
}
