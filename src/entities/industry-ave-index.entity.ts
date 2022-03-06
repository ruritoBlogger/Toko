import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

import { Industry } from '.'

@Entity()
export class IndustryAveIndex {
  @PrimaryGeneratedColumn()
  readonly id: number

  @Column()
  industryID: number

  @ManyToOne(() => Industry, (industry) => industry.industryAveIndex)
  @JoinColumn([{ name: 'industryID', referencedColumnName: 'id' }])
  industry: Industry

  @Column()
  announcementDate: Date

  @Column({ type: 'double' })
  capitalAdequacyRatio: number

  @Column({ type: 'double' })
  roe: number

  @Column({ type: 'double' })
  roa: number

  @Column({ type: 'double' })
  per: number

  @Column({ type: 'double' })
  pbr: number

  @Column({ type: 'double' })
  eps: number

  @CreateDateColumn()
  readonly createdAt: Date

  @UpdateDateColumn()
  readonly updatedAt: Date
}
