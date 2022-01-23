import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

import { Cashflow, Company, IncomeStatement } from '.'

@Entity()
export class FinantialStatements {
  @PrimaryGeneratedColumn()
  readonly id: number

  @Column()
  companyID: number

  @ManyToOne(() => Company, (company) => company.finantialStatements)
  @JoinColumn([{ name: 'companyID', referencedColumnName: 'id' }])
  company: Company

  @OneToMany(
    () => IncomeStatement,
    (incomeStatement) => incomeStatement.finantialStatements,
  )
  incomeStatement: IncomeStatement

  @OneToMany(() => Cashflow, (cashflow) => cashflow.finantialStatements)
  cashflow: Cashflow

  @Column({ unique: true })
  announcementDate: Date

  @Column()
  isFiscal: boolean

  @CreateDateColumn()
  readonly createdAt: Date

  @UpdateDateColumn()
  readonly updatedAt: Date
}
