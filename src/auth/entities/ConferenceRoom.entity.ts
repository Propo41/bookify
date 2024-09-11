import { Column, CreateDateColumn, Entity, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'ConferenceRooms' })
export class ConferenceRoom {
  @PrimaryColumn()
  id?: string;

  @Column()
  domain?: string;

  @Column()
  name?: string;

  @Column({ type: 'text', unique: true })
  email?: string;

  @Column()
  seats?: number;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column()
  floor?: string;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;
}
