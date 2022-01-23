import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { Cashflow, FinantialStatements, IncomeStatement } from '../entities'
import { CashflowController } from './cashflow.controller'
import { CashflowService } from './cashflow.service'

@Module({
  controllers: [CashflowController],
  imports: [
    TypeOrmModule.forFeature([IncomeStatement, FinantialStatements, Cashflow]),
  ],
  providers: [CashflowService],
})
export class CashflowModule {}
