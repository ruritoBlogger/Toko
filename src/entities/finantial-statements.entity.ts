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
export class FinantialStatements {
  @PrimaryGeneratedColumn()
  readonly id: number

  @Column()
  companyID: number

  @ManyToOne(() => Company, (company) => company.finantialStatements)
  @JoinColumn([{ name: 'companyID', referencedColumnName: 'id' }])
  company: Company

  @Column({ unique: true })
  announcementDate: Date

  @Column()
  isFiscal: boolean

  @CreateDateColumn()
  readonly createdAt: Date

  @UpdateDateColumn()
  readonly updatedAt: Date
}
