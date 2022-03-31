import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'

import { BalanceSheetModule } from './balance-sheet/balance-sheet.module'
import { CashflowModule } from './cashflow/cashflow.module'
import { CompanyModule } from './company/company.module'
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
} from './entities'
import { FinantialStatementsModule } from './finantial-statements/finantial-statements.module'
import { IncomeStatementModule } from './income-statement/income-statement.module'
import { IndexModule } from './index/index.module'
import { IndustryModule } from './industry/industry.module'
import { IndustryAveIndexModule } from './industry-ave-index/industry-ave-index.module'
import { StockPriceModule } from './stock-price/stock-price.module'

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      // TODO: mariadbに移行する
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      entities: [
        Industry,
        IndustryAveIndex,
        Company,
        FinantialStatements,
        IncomeStatement,
        Cashflow,
        BalanceSheet,
        Index,
        StockPrice,
      ],
      synchronize: true,
    }),
    IndustryModule,
    IndustryAveIndexModule,
    CompanyModule,
    FinantialStatementsModule,
    IncomeStatementModule,
    CashflowModule,
    BalanceSheetModule,
    IndexModule,
    StockPriceModule,
  ],
})
export class AppModule {}
