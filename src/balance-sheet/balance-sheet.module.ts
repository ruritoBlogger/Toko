import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import {
  BalanceSheet,
  Cashflow,
  FinantialStatements,
  IncomeStatement,
  Index,
} from '../entities'
import { BalanceSheetController } from './balance-sheet.controller'
import { BalanceSheetService } from './balance-sheet.service'

@Module({
  controllers: [BalanceSheetController],
  imports: [
    TypeOrmModule.forFeature([
      IncomeStatement,
      FinantialStatements,
      Cashflow,
      BalanceSheet,
      Index,
    ]),
  ],
  providers: [BalanceSheetService],
})
export class BalanceSheetModule {}
