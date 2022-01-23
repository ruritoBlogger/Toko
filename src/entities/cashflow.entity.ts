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
export class Cashflow {
  @PrimaryGeneratedColumn()
  readonly id: number

  @Column()
  finantialID: number

  @ManyToOne(
    () => FinantialStatements,
    (finantialStatements) => finantialStatements.cashflow,
  )
  @JoinColumn([{ name: 'finantialID', referencedColumnName: 'id' }])
  finantialStatements: FinantialStatements

  @Column({ type: 'double' })
  salesCF: number

  @Column({ type: 'double' })
  investmentCF: number

  @Column({ type: 'double' })
  financialCF: number

  @Column({ type: 'double' })
  cashEquivalent: number

  @CreateDateColumn()
  readonly createdAt: Date

  @UpdateDateColumn()
  readonly updatedAt: Date
}
