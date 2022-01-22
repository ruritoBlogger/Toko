import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { FinantialStatements, IncomeStatement } from '../entities'
import { IncomeStatementController } from './income-statement.controller'
import { IncomeStatementService } from './income-statement.service'

@Module({
  controllers: [IncomeStatementController],
  imports: [TypeOrmModule.forFeature([IncomeStatement, FinantialStatements])],
  providers: [IncomeStatementService],
})
export class IncomeStatementModule {}
