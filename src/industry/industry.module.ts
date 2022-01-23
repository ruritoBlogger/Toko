import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import {
  Cashflow,
  Company,
  FinantialStatements,
  IncomeStatement,
  Industry,
  IndustryAveIndex,
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
    ]),
  ],
  providers: [IndustryService],
})
export class IndustryModule {}
