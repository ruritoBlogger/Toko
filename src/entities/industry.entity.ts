import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

@Entity()
export class Industry {
  @PrimaryGeneratedColumn()
  readonly id: number

  @Column({ length: 60, unique: true })
  name: string

  @CreateDateColumn()
  readonly createdAt: Date

  @UpdateDateColumn()
  readonly updatedAt: Date
}
