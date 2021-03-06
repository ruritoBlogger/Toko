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
export class Index {
  @PrimaryGeneratedColumn()
  readonly id: number

  @Column()
  finantialID: number

  @ManyToOne(
    () => FinantialStatements,
    (finantialStatements) => finantialStatements.index,
  )
  @JoinColumn([{ name: 'finantialID', referencedColumnName: 'id' }])
  finantialStatements: FinantialStatements

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
