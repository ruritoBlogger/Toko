import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

import { Company, IndustryAveIndex } from '.'

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

  @OneToMany(
    () => IndustryAveIndex,
    (industryAveIndex) => industryAveIndex.industry,
  )
  industryAveIndex: IndustryAveIndex

  @OneToMany(() => Company, (company) => company.industry)
  company: Company
}
