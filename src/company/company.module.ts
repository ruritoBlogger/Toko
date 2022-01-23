import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import {
  BalanceSheet,
  Company,
  FinantialStatements,
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
      BalanceSheet,
    ]),
  ],
  providers: [CompanyService],
})
export class CompanyModule {}
