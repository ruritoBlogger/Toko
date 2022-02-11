import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import {
  Company,
  FinantialStatements,
  Index,
  Industry,
  StockPrice,
} from './../entities'
import { CompanyController } from './company.controller'
import { CompanyService } from './company.service'

@Module({
  controllers: [CompanyController],
  imports: [
    TypeOrmModule.forFeature([
      Company,
      Industry,
      FinantialStatements,
      Index,
      StockPrice,
    ]),
  ],
  providers: [CompanyService],
})
export class CompanyModule {}
