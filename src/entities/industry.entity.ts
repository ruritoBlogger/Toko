import {
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

@Entity()
export class Industry {
  @PrimaryGeneratedColumn()
  readonly id: number

  @PrimaryColumn({ length: 60, unique: true })
  name: string

  @CreateDateColumn()
  readonly createdAt: Date

  @UpdateDateColumn()
  readonly updatedAt: Date

  constructor(name: string) {
    this.name = name
  }
}
