import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import {
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
    ]),
  ],
  providers: [IndustryService],
})
export class IndustryModule {}
