import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

import { Industry } from './industry.entity'

@Entity()
export class Company {
  @PrimaryGeneratedColumn()
  readonly id: number

  @Column()
  industryID: number

  @ManyToOne(() => Industry, (industry) => industry.company)
  @JoinColumn([{ name: 'industryID', referencedColumnName: 'id' }])
  industry: Industry

  @Column({ length: 60, unique: true })
  name: string

  @Column({ unique: true })
  identificationCode: number

  @CreateDateColumn()
  readonly createdAt: Date

  @UpdateDateColumn()
  readonly updatedAt: Date
}
