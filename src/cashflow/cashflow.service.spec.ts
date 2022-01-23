import { TestingModule } from '@nestjs/testing'
import * as E from 'fp-ts/Either'
import { pipe } from 'fp-ts/function'

import { CompanyService } from '../company/company.service'
import { FinantialStatementsService } from '../finantial-statements/finantial-statements.service'
import { IndustryService } from '../industry/industry.service'
import { generateTestingModule } from '../utils'
import { CashflowService } from './cashflow.service'
import { Props } from './type'

describe('CashflowService', () => {
  let service: CashflowService
  const finantialID = 1
  const props: Props = {
    salesCF: 2.21,
    investmentCF: 3.23,
    financialCF: 1.21,
    cashEquivalent: 3.31,
  }

  beforeEach(async () => {
    const module: TestingModule = await generateTestingModule(
      IndustryService,
      CompanyService,
      FinantialStatementsService,
      CashflowService,
    )

    await module.init()
    service = await module.get<CashflowService>(CashflowService)

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

  // for addCashflow
  it('should not created with null param', async () => {
    const result = await service.addCashflow(null, 1)()
    expect(E.isLeft(result)).toBe(true)
  })

  it('should not created with invalid finantialID param', async () => {
    const invalidFinantialID = 3

    const result = await service.addCashflow(props, invalidFinantialID)()
    expect(E.isLeft(result)).toBe(true)
  })

  it('should add cashflow with correct param', async () => {
    const result = await service.addCashflow(props, finantialID)()

    // FIXME: ここで削除したくもないし、magic numberも使いたくもない
    await service.deleteCashflow(1, finantialID)()

    expect(E.isRight(result)).toBe(true)
    expect(
      pipe(
        result,
        E.map((result) => result.salesCF),
        E.getOrElseW(() => 'this test will fail'),
      ),
    ).toBe(props.salesCF)
  })

  it('should not add cashflow with same announcementDate param', async () => {
    await service.addCashflow(props, finantialID)()
    const secondCashflow = await service.addCashflow(props, finantialID)()

    // FIXME: ここで削除したくもないし、magic numberも使いたくもない
    await service.deleteCashflow(1, finantialID)()

    expect(E.isLeft(secondCashflow)).toBe(true)
  })

  // for updateCashflow
  it('should not updated with null param', async () => {
    const id = pipe(
      await service.addCashflow(props, finantialID)(),
      E.map((result) => result.id),
      E.getOrElseW(() => -100),
    )
    const result = await service.updateCashflow(null, id, finantialID)()

    await service.deleteCashflow(id, finantialID)()

    expect(E.isLeft(result)).toBe(true)
  })

  it('should not updated with same finantialID param', async () => {
    await service.addCashflow(props, finantialID)()
    const id = pipe(
      await service.addCashflow(props, finantialID)(),
      E.map((result) => result.id),
      E.getOrElseW(() => -100),
    )
    const result = await service.updateCashflow(props, id, finantialID)()

    await service.deleteCashflow(1, finantialID)()
    await service.deleteCashflow(id, finantialID)()

    expect(E.isLeft(result)).toBe(true)
  })

  it('should updated with correct param', async () => {
    const id = pipe(
      await service.addCashflow(props, finantialID)(),
      E.map((result) => result.id),
      E.getOrElseW(() => -100),
    )
    const result = await service.updateCashflow(
      { ...props, salesCF: 333.33 },
      id,
      finantialID,
    )()

    await service.deleteCashflow(id, finantialID)()

    expect(E.isRight(result)).toBe(true)
    expect(
      pipe(
        result,
        E.map((cashflow) => cashflow.id),
        E.getOrElseW(() => 'this test will fail'),
      ),
    ).toBe(id)
  })

  // for getCashflowList
  it('should get empty array with no data', async () => {
    const result = await service.getCashflowList(finantialID)()
    expect(E.isRight(result)).toBe(true)
    expect(
      pipe(
        result,
        E.getOrElseW(() => 'this test will fail'),
      ),
    ).toEqual([])
  })

  it('should get correct cashflow data', async () => {
    const index = await service.addCashflow(props, finantialID)()
    const result = await service.getCashflowList(finantialID)()

    // FIXME: ここで削除したくもないし、magic numberも使いたくもない
    await service.deleteCashflow(1, finantialID)()

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

  it('should get correct cashflow data with same finantialID', async () => {
    await service.addCashflow(props, finantialID)()
    await service.addCashflow(props, finantialID + 1)()
    const result = await service.getCashflowList(finantialID)()

    // FIXME: ここで削除したくもないし、magic numberも使いたくもない
    await service.deleteCashflow(1, finantialID)()
    await service.deleteCashflow(2, finantialID + 1)()

    expect(E.isRight(result)).toBe(true)
    expect(
      pipe(
        result,
        E.map((result) => result.length),
        E.getOrElse(() => -1),
      ),
    ).toEqual(1)
  })

  // for deleteCashflow
  it('should not deleted with no data', async () => {
    const result = await service.deleteCashflow(1, finantialID)()
    expect(E.isLeft(result)).toBe(true)
  })

  it('should not deleted with invalid finantialID data', async () => {
    await service.addCashflow(props, finantialID)()
    const result = await service.deleteCashflow(1, finantialID + 1)()
    expect(E.isLeft(result)).toBe(true)

    await service.deleteCashflow(1, finantialID)()
  })

  it('should delete with correct data', async () => {
    const cashflowID = pipe(
      await service.addCashflow(props, finantialID)(),
      E.map((result) => result.id),
      E.getOrElse(() => -100),
    )
    const result = await service.deleteCashflow(cashflowID, finantialID)()
    expect(E.isRight(result)).toBe(true)
    expect(
      pipe(
        result,
        E.getOrElseW(() => 'this test will fail'),
      ),
    ).toBe(cashflowID)
  })

  // for getCashflow
  it('should not get data with no data', async () => {
    const result = await service.getCashflow(1, finantialID)()
    expect(E.isLeft(result)).toBe(true)
  })

  it('should not get data with invalid finantialID', async () => {
    await service.addCashflow(props, finantialID)
    const result = await service.getCashflow(1, finantialID + 1)()
    expect(E.isLeft(result)).toBe(true)

    await service.deleteCashflow(1, finantialID)
  })

  it('should get correct data', async () => {
    const cashflowID = pipe(
      await service.addCashflow(props, finantialID)(),
      E.map((result) => result.id),
      E.getOrElseW(() => -100),
    )
    const result = await service.getCashflow(cashflowID, finantialID)()

    // FIXME: ここで削除したくもない
    await service.deleteCashflow(cashflowID, finantialID)()

    expect(E.isRight(result)).toBe(true)
    expect(
      pipe(
        result,
        E.map((result) => result.id),
        E.getOrElseW(() => 'this test will fail'),
      ),
    ).toBe(cashflowID)
  })
})
