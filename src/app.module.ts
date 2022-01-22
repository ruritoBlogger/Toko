import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { CompanyModule } from './company/company.module'
import {
  Company,
  FinantialStatements,
  IncomeStatement,
  Industry,
  IndustryAveIndex,
} from './entities'
import { FinantialStatementsModule } from './finantial-statements/finantial-statements.module'
import { IncomeStatementModule } from './income-statement/income-statement.module'
import { IndustryModule } from './industry/industry.module'
import { IndustryAveIndexModule } from './industry-ave-index/industry-ave-index.module'

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
      ],
      synchronize: true,
    }),
    IndustryModule,
    IndustryAveIndexModule,
    CompanyModule,
    FinantialStatementsModule,
    IncomeStatementModule,
  ],
})
export class AppModule {}
