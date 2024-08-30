import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'Auth' })
export class Auth {
  @PrimaryGeneratedColumn()
  id?: number;

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
