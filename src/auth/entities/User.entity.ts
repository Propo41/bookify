import { Column, CreateDateColumn, Entity, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'Users' })
export class User {
  @PrimaryColumn()
  id?: string;

  @Column({ nullable: false })
  email?: string;

  @Column({ nullable: false })
  name?: string;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;
}
