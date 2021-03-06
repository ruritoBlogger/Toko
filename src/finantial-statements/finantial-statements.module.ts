import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import {
  BalanceSheet,
  Cashflow,
  Company,
  FinantialStatements,
  IncomeStatement,
  Index,
} from './../entities'
import { FinantialStatementsController } from './finantial-statements.controller'
import { FinantialStatementsService } from './finantial-statements.service'

@Module({
  controllers: [FinantialStatementsController],
  imports: [
    TypeOrmModule.forFeature([
      FinantialStatements,
      Company,
      IncomeStatement,
      Cashflow,
      BalanceSheet,
      Index,
    ]),
  ],
  providers: [FinantialStatementsService],
})
export class FinantialStatementsModule {}
