import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from './User.entity';

@Entity({ name: 'Auth' })
export class Auth {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  userId?: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'text' })
  accessToken?: string;

  @Column()
  scope?: string;

  @Column()
  tokenType?: string;

  @Column({ type: 'int' })
  expiryDate?: number;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;
}
