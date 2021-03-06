import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import {
  BalanceSheet,
  Cashflow,
  Company,
  FinantialStatements,
  IncomeStatement,
  Index,
  Industry,
  IndustryAveIndex,
  StockPrice,
} from './../entities'
import { IndustryController } from './industry.controller'
import { IndustryService } from './industry.service'

@Module({
  controllers: [IndustryController],
  imports: [
    TypeOrmModule.forFeature([
      Industry,
      IndustryAveIndex,
      Company,
      FinantialStatements,
      IncomeStatement,
      Cashflow,
      BalanceSheet,
      Index,
      StockPrice,
    ]),
  ],
  providers: [IndustryService],
})
export class IndustryModule {}
