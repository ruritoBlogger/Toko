import { TestingModule } from '@nestjs/testing'
import * as E from 'fp-ts/Either'
import { pipe } from 'fp-ts/function'

import { CompanyService } from '../company/company.service'
import { FinantialStatementsService } from '../finantial-statements/finantial-statements.service'
import { IndustryService } from '../industry/industry.service'
import { generateTestingModule } from '../utils'
import { BalanceSheetService } from './balance-sheet.service'
import { Props } from './type'

describe('BalanceSheetService', () => {
  let service: BalanceSheetService
  const finantialID = 1
  const props: Props = {
    totalAssets: 1.1,
    netAssets: 1.2,
    capitalStock: 1.3,
    profitSurplus: 1.4,
    cashEquivalent: 1.5,
    netCash: 1.6,
    depreciation: 1.7,
    capitalInvestment: 1.8,
    liabilities: 1.9,
  }

  beforeEach(async () => {
    const module: TestingModule = await generateTestingModule(
      IndustryService,
      CompanyService,
      FinantialStatementsService,
      BalanceSheetService,
    )

    await module.init()
    service = await module.get<BalanceSheetService>(BalanceSheetService)

    // NOTE: リレーショナルな関係のデータを生成しておく
    const sheetService = await module.get<IndustryService>(IndustryService)
    await sheetService.addIndustry({ name: 'test' })()
    await sheetService.addIndustry({ name: 'another' })()

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

  // for addSheet
  it('should not created with null param', async () => {
    const result = await service.addSheet(null, 1)()
    expect(E.isLeft(result)).toBe(true)
  })

  it('should not created with invalid finantialID param', async () => {
    const invalidFinantialID = 3

    const result = await service.addSheet(props, invalidFinantialID)()
    expect(E.isLeft(result)).toBe(true)
  })

  it('should add sheet with correct param', async () => {
    const result = await service.addSheet(props, finantialID)()

    // FIXME: ここで削除したくもないし、magic numberも使いたくもない
    await service.deleteSheet(1, finantialID)()

    expect(E.isRight(result)).toBe(true)
    expect(
      pipe(
        result,
        E.map((result) => result.liabilities),
        E.getOrElseW(() => 'this test will fail'),
      ),
    ).toBe(props.liabilities)
  })

  it('should not add sheet with same announcementDate param', async () => {
    await service.addSheet(props, finantialID)()
    const secondStatements = await service.addSheet(props, finantialID)()

    // FIXME: ここで削除したくもないし、magic numberも使いたくもない
    await service.deleteSheet(1, finantialID)()

    expect(E.isLeft(secondStatements)).toBe(true)
  })

  // for updateSheet
  it('should not updated with null param', async () => {
    const id = pipe(
      await service.addSheet(props, finantialID)(),
      E.map((result) => result.id),
      E.getOrElseW(() => -100),
    )
    const result = await service.updateSheet(null, id, finantialID)()

    await service.deleteSheet(id, finantialID)()

    expect(E.isLeft(result)).toBe(true)
  })

  it('should not updated with same finantialID param', async () => {
    await service.addSheet(props, finantialID)()
    const id = pipe(
      await service.addSheet(props, finantialID)(),
      E.map((result) => result.id),
      E.getOrElseW(() => -100),
    )
    const result = await service.updateSheet(props, id, finantialID)()

    await service.deleteSheet(1, finantialID)()
    await service.deleteSheet(id, finantialID)()

    expect(E.isLeft(result)).toBe(true)
  })

  it('should updated with correct param', async () => {
    const id = pipe(
      await service.addSheet(props, finantialID)(),
      E.map((result) => result.id),
      E.getOrElseW(() => -100),
    )
    const result = await service.updateSheet(
      { ...props, liabilities: 333.33 },
      id,
      finantialID,
    )()

    await service.deleteSheet(id, finantialID)()

    expect(E.isRight(result)).toBe(true)
    expect(
      pipe(
        result,
        E.map((sheet) => sheet.id),
        E.getOrElseW(() => 'this test will fail'),
      ),
    ).toBe(id)
  })

  // for getSheetList
  it('should get empty array with no data', async () => {
    const result = await service.getSheetList(finantialID)()
    expect(E.isRight(result)).toBe(true)
    expect(
      pipe(
        result,
        E.getOrElseW(() => 'this test will fail'),
      ),
    ).toEqual([])
  })

  it('should get correct sheet data', async () => {
    const index = await service.addSheet(props, finantialID)()
    const result = await service.getSheetList(finantialID)()

    // FIXME: ここで削除したくもないし、magic numberも使いたくもない
    await service.deleteSheet(1, finantialID)()

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

  it('should get correct sheet data with same finantialID', async () => {
    await service.addSheet(props, finantialID)()
    await service.addSheet(props, finantialID + 1)()
    const result = await service.getSheetList(finantialID)()

    // FIXME: ここで削除したくもないし、magic numberも使いたくもない
    await service.deleteSheet(1, finantialID)()
    await service.deleteSheet(2, finantialID + 1)()

    expect(E.isRight(result)).toBe(true)
    expect(
      pipe(
        result,
        E.map((result) => result.length),
        E.getOrElse(() => -1),
      ),
    ).toEqual(1)
  })

  // for deleteSheet
  it('should not deleted with no data', async () => {
    const result = await service.deleteSheet(1, finantialID)()
    expect(E.isLeft(result)).toBe(true)
  })

  it('should not deleted with invalid finantialID data', async () => {
    await service.addSheet(props, finantialID)()
    const result = await service.deleteSheet(1, finantialID + 1)()
    expect(E.isLeft(result)).toBe(true)

    await service.deleteSheet(1, finantialID)()
  })

  it('should delete with correct data', async () => {
    const sheetID = pipe(
      await service.addSheet(props, finantialID)(),
      E.map((result) => result.id),
      E.getOrElse(() => -100),
    )
    const result = await service.deleteSheet(sheetID, finantialID)()
    expect(E.isRight(result)).toBe(true)
    expect(
      pipe(
        result,
        E.getOrElseW(() => 'this test will fail'),
      ),
    ).toBe(sheetID)
  })

  // for getSheet
  it('should not get data with no data', async () => {
    const result = await service.getSheet(1, finantialID)()
    expect(E.isLeft(result)).toBe(true)
  })

  it('should not get data with invalid finantialID', async () => {
    await service.addSheet(props, finantialID)
    const result = await service.getSheet(1, finantialID + 1)()
    expect(E.isLeft(result)).toBe(true)

    await service.deleteSheet(1, finantialID)
  })

  it('should get correct data', async () => {
    const sheetID = pipe(
      await service.addSheet(props, finantialID)(),
      E.map((result) => result.id),
      E.getOrElseW(() => -100),
    )
    const result = await service.getSheet(sheetID, finantialID)()

    // FIXME: ここで削除したくもない
    await service.deleteSheet(sheetID, finantialID)()

    expect(E.isRight(result)).toBe(true)
    expect(
      pipe(
        result,
        E.map((result) => result.id),
        E.getOrElseW(() => 'this test will fail'),
      ),
    ).toBe(sheetID)
  })
})
