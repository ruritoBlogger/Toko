import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

import { FinantialStatements } from '.'

@Entity()
export class BalanceSheet {
  @PrimaryGeneratedColumn()
  readonly id: number

  @Column()
  finantialID: number

  @ManyToOne(
    () => FinantialStatements,
    (finantialStatements) => finantialStatements.balanceSheet,
  )
  @JoinColumn([{ name: 'finantialID', referencedColumnName: 'id' }])
  finantialStatements: FinantialStatements

  @Column({ type: 'double' })
  totalAssets: number

  @Column({ type: 'double' })
  netAssets: number

  @Column({ type: 'double' })
  capitalStock: number

  @Column({ type: 'double' })
  profitSurplus: number

  @Column({ type: 'double' })
  cashEquivalent: number

  @Column({ type: 'double' })
  netCash: number

  @Column({ type: 'double' })
  depreciation: number

  @Column({ type: 'double' })
  capitalInvestment: number

  @Column({ type: 'double' })
  liabilities: number

  @CreateDateColumn()
  readonly createdAt: Date

  @UpdateDateColumn()
  readonly updatedAt: Date
}
