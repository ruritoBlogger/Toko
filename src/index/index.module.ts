import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import {
  BalanceSheet,
  Cashflow,
  FinantialStatements,
  IncomeStatement,
  Index,
} from '../entities'
import { IndexController } from './index.controller'
import { IndexService } from './index.service'

@Module({
  controllers: [IndexController],
  imports: [
    TypeOrmModule.forFeature([
      IncomeStatement,
      FinantialStatements,
      Cashflow,
      BalanceSheet,
      Index,
    ]),
  ],
  providers: [IndexService],
})
export class IndexModule {}
