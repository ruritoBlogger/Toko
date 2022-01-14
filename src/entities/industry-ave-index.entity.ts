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

  @Column({ type: 'double' })
  pcfr: number

  @Column({ type: 'double' })
  yieldGap: number

  @Column({ type: 'double' })
  ebitda: number

  @Column({ type: 'double' })
  ev: number

  @Column({ type: 'double' })
  ev_ebitda: number

  @CreateDateColumn()
  readonly createdAt: Date

  @UpdateDateColumn()
  readonly updatedAt: Date
}
