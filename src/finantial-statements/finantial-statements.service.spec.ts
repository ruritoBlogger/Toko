import { Test, TestingModule } from '@nestjs/testing'
import { TypeOrmModule } from '@nestjs/typeorm'
import * as E from 'fp-ts/Either'
import { pipe } from 'fp-ts/function'

import { CompanyService } from '../company/company.service'
import {
  Company,
  FinantialStatements,
  Industry,
  IndustryAveIndex,
} from '../entities'
import { IndustryService } from '../industry/industry.service'
import { FinantialStatementsService } from './finantial-statements.service'
import { Props } from './type'

describe('FinantialStatementsService', () => {
  let service: FinantialStatementsService
  const companyID = 1
  const props: Props = {
    announcementDate: '2021/1/1',
    isFiscal: true,
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          // FIXME: 本当はmysqlでやりたい
          type: 'sqlite',
          database: ':memory:',
          entities: [Industry, IndustryAveIndex, Company, FinantialStatements],
          synchronize: true,
          keepConnectionAlive: true,
        }),
        TypeOrmModule.forFeature([
          Industry,
          IndustryAveIndex,
          Company,
          FinantialStatements,
        ]),
      ],
      providers: [IndustryService, CompanyService, FinantialStatementsService],
    }).compile()

    await module.init()
    service = await module.get<FinantialStatementsService>(
      FinantialStatementsService,
    )

    // NOTE: リレーショナルな関係のデータを生成しておく
    const parent_service = await module.get<IndustryService>(IndustryService)
    await parent_service.addIndustry({ name: 'test' })()
    await parent_service.addIndustry({ name: 'another' })()

    const near_parent_service = await module.get<CompanyService>(CompanyService)
    await near_parent_service.addCompany({
      name: 'test',
      industryID: 1,
      identificationCode: 2222,
    })()
    await near_parent_service.addCompany({
      name: 'another',
      industryID: 2,
      identificationCode: 4242,
    })
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  // for addStatements
  it('should not created with null param', async () => {
    const result = await service.addStatements(null, 1)()
    expect(E.isLeft(result)).toBe(true)
  })

  it('should not created with invalid companyID param', async () => {
    const invalidCompanyID = 3

    const result = await service.addStatements(props, invalidCompanyID)()
    expect(E.isLeft(result)).toBe(true)
  })

  it('should add statements with correct param', async () => {
    const result = await service.addStatements(props, companyID)()

    // FIXME: ここで削除したくもないし、magic numberも使いたくもない
    await service.deleteStatements(1, companyID)()

    expect(E.isRight(result)).toBe(true)
    expect(
      pipe(
        result,
        E.map((result) => result.announcementDate),
        E.getOrElseW(() => 'this test will fail'),
      ),
    ).toStrictEqual(new Date(props.announcementDate))
  })

  it('should not add statements with same announcementDate param', async () => {
    await service.addStatements(props, companyID)()
    const secondStatements = await service.addStatements(props, companyID)()

    // FIXME: ここで削除したくもないし、magic numberも使いたくもない
    await service.deleteStatements(1, companyID)()

    expect(E.isLeft(secondStatements)).toBe(true)
  })

  // for getStatementsList
  it('should get empty array with no data', async () => {
    const result = await service.getStatementsList(companyID)()
    expect(E.isRight(result)).toBe(true)
    expect(
      pipe(
        result,
        E.getOrElseW(() => 'this test will fail'),
      ),
    ).toEqual([])
  })

  it('should get correct statements data', async () => {
    const index = await service.addStatements(props, companyID)()
    const result = await service.getStatementsList(companyID)()

    // FIXME: ここで削除したくもないし、magic numberも使いたくもない
    await service.deleteStatements(1, companyID)()

    expect(E.isRight(result)).toBe(true)
    expect(
      pipe(
        result,
        E.map((result) => result.shift()),
        E.getOrElseW(() => 'this test will fail'),
      ),
    ).toEqual(
      pipe(
        index,
        E.map((index) => index),
        E.getOrElseW(() => 'THIS TEST WILL FAIL'),
      ),
    )
  })

  it('should get correct statements data with same companyID', async () => {
    await service.addStatements(props, companyID)()
    await service.addStatements(props, companyID + 1)()
    const result = await service.getStatementsList(companyID)()

    // FIXME: ここで削除したくもないし、magic numberも使いたくもない
    await service.deleteStatements(1, companyID)()
    await service.deleteStatements(2, companyID + 1)()

    expect(E.isRight(result)).toBe(true)
    expect(
      pipe(
        result,
        E.map((result) => result.length),
        E.getOrElse(() => -1),
      ),
    ).toEqual(1)
  })

  // for deleteStatements
  it('should not deleted with no data', async () => {
    const result = await service.deleteStatements(1, companyID)()
    expect(E.isLeft(result)).toBe(true)
  })

  it('should not deleted with invalid companyID data', async () => {
    await service.addStatements(props, companyID)()
    const result = await service.deleteStatements(1, companyID + 1)()
    expect(E.isLeft(result)).toBe(true)

    await service.deleteStatements(1, companyID)()
  })

  it('should delete with correct data', async () => {
    const statementsID = pipe(
      await service.addStatements(props, companyID)(),
      E.map((result) => result.id),
      E.getOrElse(() => -100),
    )
    const result = await service.deleteStatements(statementsID, companyID)()
    expect(E.isRight(result)).toBe(true)
    expect(
      pipe(
        result,
        E.getOrElseW(() => 'this test will fail'),
      ),
    ).toBe(statementsID)
  })

  // for getStatements
  it('should not get data with no data', async () => {
    const result = await service.getStatements(1, companyID)()
    expect(E.isLeft(result)).toBe(true)
  })

  it('should not get data with invalid companyID', async () => {
    await service.addStatements(props, companyID)
    const result = await service.getStatements(1, companyID + 1)()
    expect(E.isLeft(result)).toBe(true)

    await service.deleteStatements(1, companyID)
  })

  it('should get correct data', async () => {
    const statementsID = pipe(
      await service.addStatements(props, companyID)(),
      E.map((result) => result.id),
      E.getOrElseW(() => -100),
    )
    const result = await service.getStatements(statementsID, companyID)()

    // FIXME: ここで削除したくもない
    await service.deleteStatements(statementsID, companyID)()

    expect(E.isRight(result)).toBe(true)
    expect(
      pipe(
        result,
        E.map((result) => result.id),
        E.getOrElseW(() => 'this test will fail'),
      ),
    ).toBe(statementsID)
  })

  // for getCurrentStatements
  it('should not get current data with no data', async () => {
    const result = await service.getCurrentStatements(companyID)()
    expect(E.isLeft(result)).toBe(true)
  })

  it('should not get current data with invalid companyID', async () => {
    await service.addStatements(props, companyID)
    const result = await service.getCurrentStatements(companyID + 1)()
    expect(E.isLeft(result)).toBe(true)

    await service.deleteStatements(1, companyID)
  })

  it('should get correct current data', async () => {
    const oldProps: Props = {
      announcementDate: '2000/1/1',
      isFiscal: true,
    }

    const payload = await service.addStatements(props, companyID)()
    await service.addStatements(oldProps, companyID)()
    const statementsID = pipe(
      payload,
      E.map((result) => result.id),
      E.getOrElseW(() => 'this test will fail'),
    )

    const result = await service.getCurrentStatements(companyID)()

    // FIXME: ここで削除したくもない
    await service.deleteStatements(1, companyID)()
    await service.deleteStatements(2, companyID)()

    expect(E.isRight(result)).toBe(true)
    expect(
      pipe(
        result,
        E.map((result) => result.id),
        E.getOrElseW(() => 'this test will fail'),
      ),
    ).toBe(statementsID)
  })
})
