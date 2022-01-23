import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import {
  BalanceSheet,
  Company,
  FinantialStatements,
  Index,
  Industry,
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
      BalanceSheet,
    ]),
  ],
  providers: [CompanyService],
})
export class CompanyModule {}
