import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

import type { Props } from '../industry-ave-index/type'

@Entity()
export class IndustryAveIndex {
  @PrimaryGeneratedColumn()
  readonly id: number

  @Column()
  industryID: number

  @Column()
  announcementDate: Date

  @Column()
  capitalAdequacyRatio: number

  @Column()
  roe: number

  @Column()
  roa: number

  @Column()
  per: number

  @Column()
  pbr: number

  @Column()
  eps: number

  @Column()
  pcfr: number

  @Column()
  yieldGap: number

  @Column()
  ebitda: number

  @Column()
  ev: number

  @Column()
  ev_ebitda: number

  @CreateDateColumn()
  readonly createdAt: Date

  @UpdateDateColumn()
  readonly updatedAt: Date

  constructor({
    industryID,
    announcementDate,
    capitalAdequacyRatio,
    roe,
    roa,
    per,
    pbr,
    eps,
    pcfr,
    yieldGap,
    ebitda,
    ev,
    ev_ebitda,
  }: Props) {
    this.industryID = industryID
    this.announcementDate = announcementDate
    this.capitalAdequacyRatio = capitalAdequacyRatio
    this.roe = roe
    this.roa = roa
    this.per = per
    this.pbr = pbr
    this.eps = eps
    this.pcfr = pcfr
    this.yieldGap = yieldGap
    this.ebitda = ebitda
    this.ev = ev
    this.ev_ebitda = ev_ebitda
  }
}
