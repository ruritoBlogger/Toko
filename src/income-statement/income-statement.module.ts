import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import {
  BalanceSheet,
  Cashflow,
  FinantialStatements,
  IncomeStatement,
  Index,
} from '../entities'
import { IncomeStatementController } from './income-statement.controller'
import { IncomeStatementService } from './income-statement.service'

@Module({
  controllers: [IncomeStatementController],
  imports: [
    TypeOrmModule.forFeature([
      IncomeStatement,
      FinantialStatements,
      Cashflow,
      BalanceSheet,
      Index,
    ]),
  ],
  providers: [IncomeStatementService],
})
export class IncomeStatementModule {}
