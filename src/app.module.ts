import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { CompanyModule } from './company/company.module'
import {
  Company,
  FinantialStatements,
  Industry,
  IndustryAveIndex,
} from './entities'
import { FinantialStatementsModule } from './finantial-statements/finantial-statements.module'
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
      entities: [Industry, IndustryAveIndex, Company, FinantialStatements],
      synchronize: true,
    }),
    IndustryModule,
    IndustryAveIndexModule,
    CompanyModule,
    FinantialStatementsModule,
  ],
})
export class AppModule {}
