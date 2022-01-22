import { Provider } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { TypeOrmModule } from '@nestjs/typeorm'

import {
  Company,
  FinantialStatements,
  IncomeStatement,
  Industry,
  IndustryAveIndex,
} from '../entities'

export const generateTestingModule = async (
  ...services: Provider<any>[]
): Promise<TestingModule> => {
  return await Test.createTestingModule({
    imports: [
      TypeOrmModule.forRoot({
        // FIXME: 本当はmysqlでやりたい
        type: 'sqlite',
        database: ':memory:',
        entities: [
          Industry,
          IndustryAveIndex,
          Company,
          FinantialStatements,
          IncomeStatement,
        ],
        synchronize: true,
        keepConnectionAlive: true,
      }),
      TypeOrmModule.forFeature([
        Industry,
        IndustryAveIndex,
        Company,
        FinantialStatements,
        IncomeStatement,
      ]),
    ],
    providers: services,
  }).compile()
}
