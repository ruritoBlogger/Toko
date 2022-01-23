import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { Cashflow, FinantialStatements, IncomeStatement } from '../entities'
import { IncomeStatementController } from './income-statement.controller'
import { IncomeStatementService } from './income-statement.service'

@Module({
  controllers: [IncomeStatementController],
  imports: [
    TypeOrmModule.forFeature([IncomeStatement, FinantialStatements, Cashflow]),
  ],
  providers: [IncomeStatementService],
})
export class IncomeStatementModule {}
