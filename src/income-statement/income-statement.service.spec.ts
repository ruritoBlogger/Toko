import { TestingModule } from '@nestjs/testing'
import * as E from 'fp-ts/Either'
import { pipe } from 'fp-ts/function'

import { CompanyService } from '../company/company.service'
import { FinantialStatementsService } from '../finantial-statements/finantial-statements.service'
import { IndustryService } from '../industry/industry.service'
import { generateTestingModule } from '../utils'
import { IncomeStatementService } from './income-statement.service'
import { Props } from './type'

describe('IncomeStatementService', () => {
  let service: IncomeStatementService
  const finantialID = 1
  const props: Props = {
    totalSales: 221.23,
    operatingIncome: 123.12,
    ordinaryIncome: 53.21,
    netIncome: 21.12,
  }

  beforeEach(async () => {
    const module: TestingModule = await generateTestingModule(
      IndustryService,
      CompanyService,
      FinantialStatementsService,
      IncomeStatementService,
    )

    await module.init()
    service = await module.get<IncomeStatementService>(IncomeStatementService)

    // NOTE: リレーショナルな関係のデータを生成しておく
    const statementService = await module.get<IndustryService>(IndustryService)
    await statementService.addIndustry({ name: 'test' })()
    await statementService.addIndustry({ name: 'another' })()

    const companyService = await module.get<CompanyService>(CompanyService)
    await companyService.addCompany({
      name: 'test',
      industryID: 1,
      identificationCode: 2222,
    })()
    await companyService.addCompany({
      name: 'another',
      industryID: 2,
      identificationCode: 4242,
    })()

    const finantialService = await module.get<FinantialStatementsService>(
      FinantialStatementsService,
    )
    await finantialService.addStatements(
      {
        announcementDate: '2021/1/1',
        isFiscal: true,
      },
      1,
    )()
    await finantialService.addStatements(
      {
        announcementDate: '2020/1/1',
        isFiscal: true,
      },
      2,
    )()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  // for addStatement
  it('should not created with null param', async () => {
    const result = await service.addStatement(null, 1)()
    expect(E.isLeft(result)).toBe(true)
  })

  it('should not created with invalid finantialID param', async () => {
    const invalidFinantialID = 3

    const result = await service.addStatement(props, invalidFinantialID)()
    expect(E.isLeft(result)).toBe(true)
  })

  it('should add statement with correct param', async () => {
    const result = await service.addStatement(props, finantialID)()

    // FIXME: ここで削除したくもないし、magic numberも使いたくもない
    await service.deleteStatement(1, finantialID)()

    expect(E.isRight(result)).toBe(true)
    expect(
      pipe(
        result,
        E.map((result) => result.netIncome),
        E.getOrElseW(() => 'this test will fail'),
      ),
    ).toBe(props.netIncome)
  })

  it('should not add statement with same announcementDate param', async () => {
    await service.addStatement(props, finantialID)()
    const secondStatements = await service.addStatement(props, finantialID)()

    // FIXME: ここで削除したくもないし、magic numberも使いたくもない
    await service.deleteStatement(1, finantialID)()

    expect(E.isLeft(secondStatements)).toBe(true)
  })

  // for updateStatement
  it('should not updated with null param', async () => {
    const id = pipe(
      await service.addStatement(props, finantialID)(),
      E.map((result) => result.id),
      E.getOrElseW(() => -100),
    )
    const result = await service.updateStatement(null, id, finantialID)()

    await service.deleteStatement(id, finantialID)()

    expect(E.isLeft(result)).toBe(true)
  })

  it('should not updated with same finantialID param', async () => {
    await service.addStatement(props, finantialID)()
    const id = pipe(
      await service.addStatement(props, finantialID)(),
      E.map((result) => result.id),
      E.getOrElseW(() => -100),
    )
    const result = await service.updateStatement(props, id, finantialID)()

    await service.deleteStatement(1, finantialID)()
    await service.deleteStatement(id, finantialID)()

    expect(E.isLeft(result)).toBe(true)
  })

  it('should updated with correct param', async () => {
    const id = pipe(
      await service.addStatement(props, finantialID)(),
      E.map((result) => result.id),
      E.getOrElseW(() => -100),
    )
    const result = await service.updateStatement(
      { ...props, netIncome: 333.33 },
      id,
      finantialID,
    )()

    await service.deleteStatement(id, finantialID)()

    expect(E.isRight(result)).toBe(true)
    expect(
      pipe(
        result,
        E.map((statement) => statement.id),
        E.getOrElseW(() => 'this test will fail'),
      ),
    ).toBe(id)
  })

  // for getStatementList
  it('should get empty array with no data', async () => {
    const result = await service.getStatementList(finantialID)()
    expect(E.isRight(result)).toBe(true)
    expect(
      pipe(
        result,
        E.getOrElseW(() => 'this test will fail'),
      ),
    ).toEqual([])
  })

  it('should get correct statement data', async () => {
    const index = await service.addStatement(props, finantialID)()
    const result = await service.getStatementList(finantialID)()

    // FIXME: ここで削除したくもないし、magic numberも使いたくもない
    await service.deleteStatement(1, finantialID)()

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

  it('should get correct statement data with same finantialID', async () => {
    await service.addStatement(props, finantialID)()
    await service.addStatement(props, finantialID + 1)()
    const result = await service.getStatementList(finantialID)()

    // FIXME: ここで削除したくもないし、magic numberも使いたくもない
    await service.deleteStatement(1, finantialID)()
    await service.deleteStatement(2, finantialID + 1)()

    expect(E.isRight(result)).toBe(true)
    expect(
      pipe(
        result,
        E.map((result) => result.length),
        E.getOrElse(() => -1),
      ),
    ).toEqual(1)
  })

  // for deleteStatement
  it('should not deleted with no data', async () => {
    const result = await service.deleteStatement(1, finantialID)()
    expect(E.isLeft(result)).toBe(true)
  })

  it('should not deleted with invalid finantialID data', async () => {
    await service.addStatement(props, finantialID)()
    const result = await service.deleteStatement(1, finantialID + 1)()
    expect(E.isLeft(result)).toBe(true)

    await service.deleteStatement(1, finantialID)()
  })

  it('should delete with correct data', async () => {
    const statementID = pipe(
      await service.addStatement(props, finantialID)(),
      E.map((result) => result.id),
      E.getOrElse(() => -100),
    )
    const result = await service.deleteStatement(statementID, finantialID)()
    expect(E.isRight(result)).toBe(true)
    expect(
      pipe(
        result,
        E.getOrElseW(() => 'this test will fail'),
      ),
    ).toBe(statementID)
  })

  // for getStatement
  it('should not get data with no data', async () => {
    const result = await service.getStatement(1, finantialID)()
    expect(E.isLeft(result)).toBe(true)
  })

  it('should not get data with invalid finantialID', async () => {
    await service.addStatement(props, finantialID)
    const result = await service.getStatement(1, finantialID + 1)()
    expect(E.isLeft(result)).toBe(true)

    await service.deleteStatement(1, finantialID)
  })

  it('should get correct data', async () => {
    const statementID = pipe(
      await service.addStatement(props, finantialID)(),
      E.map((result) => result.id),
      E.getOrElseW(() => -100),
    )
    const result = await service.getStatement(statementID, finantialID)()

    // FIXME: ここで削除したくもない
    await service.deleteStatement(statementID, finantialID)()

    expect(E.isRight(result)).toBe(true)
    expect(
      pipe(
        result,
        E.map((result) => result.id),
        E.getOrElseW(() => 'this test will fail'),
      ),
    ).toBe(statementID)
  })
})
