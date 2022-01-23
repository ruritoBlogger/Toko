import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import {
  BalanceSheet,
  Cashflow,
  FinantialStatements,
  IncomeStatement,
  Index,
} from '../entities'
import { CashflowController } from './cashflow.controller'
import { CashflowService } from './cashflow.service'

@Module({
  controllers: [CashflowController],
  imports: [
    TypeOrmModule.forFeature([
      IncomeStatement,
      FinantialStatements,
      Cashflow,
      BalanceSheet,
      Index,
    ]),
  ],
  providers: [CashflowService],
})
export class CashflowModule {}
