import { Module } from '@nestjs/common'
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
} from './entities'
import { FinantialStatementsModule } from './finantial-statements/finantial-statements.module'
import { IncomeStatementModule } from './income-statement/income-statement.module'
import { IndexModule } from './index/index.module'
import { IndustryModule } from './industry/industry.module'
import { IndustryAveIndexModule } from './industry-ave-index/industry-ave-index.module'
import { StockPriceModule } from './stock-price/stock-price.module'

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'password',
      database: 'nestday7',
      entities: [
        Industry,
        IndustryAveIndex,
        Company,
        FinantialStatements,
        IncomeStatement,
        Cashflow,
        BalanceSheet,
        Index,
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
