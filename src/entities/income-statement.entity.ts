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
export class IncomeStatement {
  @PrimaryGeneratedColumn()
  readonly id: number

  @Column()
  finantialID: number

  @ManyToOne(
    () => FinantialStatements,
    (finantialStatements) => finantialStatements.incomeStatement,
  )
  @JoinColumn([{ name: 'finantialID', referencedColumnName: 'id' }])
  finantialStatements: FinantialStatements

  @Column({ type: 'double' })
  totalSales: number

  @Column({ type: 'double' })
  operatingIncome: number

  @Column({ type: 'double' })
  ordinaryIncome: number

  @Column({ type: 'double' })
  netIncome: number

  @CreateDateColumn()
  readonly createdAt: Date

  @UpdateDateColumn()
  readonly updatedAt: Date
}
