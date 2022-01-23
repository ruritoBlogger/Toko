import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import {
  Cashflow,
  Company,
  FinantialStatements,
  IncomeStatement,
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
    ]),
  ],
  providers: [FinantialStatementsService],
})
export class FinantialStatementsModule {}
