import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

import { Company } from '.'

@Entity()
export class StockPrice {
  @PrimaryGeneratedColumn()
  readonly id: number

  @Column()
  companyID: number

  @ManyToOne(() => Company, (company) => company.stockPrice)
  @JoinColumn([{ name: 'companyID', referencedColumnName: 'id' }])
  company: Company

  @Column({ type: 'double' })
  openingPrice: number

  @Column({ type: 'double' })
  closingPrice: number

  @Column({ type: 'double' })
  highPrice: number

  @Column({ type: 'double' })
  lowPrice: number

  @Column()
  date: Date

  @CreateDateColumn()
  readonly createdAt: Date

  @UpdateDateColumn()
  readonly updatedAt: Date
}
