import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Auth } from './Auth.entity';

@Entity({ name: 'Users' })
export class User {
  @PrimaryColumn()
  id?: string;

  @Column()
  authId?: number;

  @OneToOne(() => Auth, { cascade: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'authId' })
  auth: Auth;

  @Column({ nullable: false })
  email?: string;

  @Column({ nullable: false })
  name?: string;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;
}
