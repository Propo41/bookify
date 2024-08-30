import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'Auth' })
export class Auth {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ type: 'text' })
  accessToken?: string;

  @Column()
  scope?: string;

  @Column({ type: 'text' })
  idToken?: string;

  @Column()
  tokenType?: string;

  @Column({ type: 'bigint' })
  expiryDate?: number;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;
}
