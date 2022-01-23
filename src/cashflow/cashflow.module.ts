import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import {
  BalanceSheet,
  Cashflow,
  FinantialStatements,
  IncomeStatement,
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
    ]),
  ],
  providers: [CashflowService],
})
export class CashflowModule {}
