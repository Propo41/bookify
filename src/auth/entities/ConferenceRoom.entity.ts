import { Column, CreateDateColumn, Entity, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'ConferenceRooms' })
export class ConferenceRoom {
  @PrimaryColumn()
  id?: string;

  @Column()
  name?: string;

  @Column()
  seats?: number;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column()
  floor?: number;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;
}
