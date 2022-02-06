import { TestingModule } from '@nestjs/testing'
import * as E from 'fp-ts/Either'
import { pipe } from 'fp-ts/function'

import { CompanyService } from '../company/company.service'
import { FinantialStatementsService } from '../finantial-statements/finantial-statements.service'
import { IndustryService } from '../industry/industry.service'
import { generateTestingModule } from '../utils'
import { IndexService } from './index.service'
import { Props } from './type'

describe('IndexService', () => {
  let service: IndexService
  const finantialID = 1
  const props: Props = {
    capitalAdequacyRatio: 1.0,
    roe: 1.1,
    roa: 1.2,
    per: 1.3,
    pbr: 1.4,
    eps: 1.5,
    pcfr: 1.6,
    yieldGap: 1.7,
  }

  beforeEach(async () => {
    const module: TestingModule = await generateTestingModule(
      IndustryService,
      CompanyService,
      FinantialStatementsService,
      IndexService,
    )

    await module.init()
    service = await module.get<IndexService>(IndexService)

    // NOTE: リレーショナルな関係のデータを生成しておく
    const indexService = await module.get<IndustryService>(IndustryService)
    await indexService.addIndustry({ name: 'test' })()
    await indexService.addIndustry({ name: 'another' })()

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

  // for addIndex
  it('should not created with null param', async () => {
    const result = await service.addIndex(null, 1)()
    expect(E.isLeft(result)).toBe(true)
  })

  it('should not created with invalid finantialID param', async () => {
    const invalidFinantialID = 3

    const result = await service.addIndex(props, invalidFinantialID)()
    expect(E.isLeft(result)).toBe(true)
  })

  it('should add index with correct param', async () => {
    const result = await service.addIndex(props, finantialID)()

    // FIXME: ここで削除したくもないし、magic numberも使いたくもない
    await service.deleteIndex(1, finantialID)()

    expect(E.isRight(result)).toBe(true)
    expect(
      pipe(
        result,
        E.map((result) => result.roe),
        E.getOrElseW(() => 'this test will fail'),
      ),
    ).toBe(props.roe)
  })

  it('should not add index with same finantialID param', async () => {
    await service.addIndex(props, finantialID)()
    const secondStatements = await service.addIndex(props, finantialID)()

    // FIXME: ここで削除したくもないし、magic numberも使いたくもない
    await service.deleteIndex(1, finantialID)()

    expect(E.isLeft(secondStatements)).toBe(true)
  })

  // for updateIndex
  it('should not updated with null param', async () => {
    const id = pipe(
      await service.addIndex(props, finantialID)(),
      E.map((result) => result.id),
      E.getOrElseW(() => -100),
    )
    const result = await service.updateIndex(null, id, finantialID)()

    await service.deleteIndex(id, finantialID)()

    expect(E.isLeft(result)).toBe(true)
  })

  it('should not updated with same finantialID param', async () => {
    await service.addIndex(props, finantialID)()
    const id = pipe(
      await service.addIndex(props, finantialID)(),
      E.map((result) => result.id),
      E.getOrElseW(() => -100),
    )
    const result = await service.updateIndex(props, id, finantialID)()

    await service.deleteIndex(1, finantialID)()
    await service.deleteIndex(id, finantialID)()

    expect(E.isLeft(result)).toBe(true)
  })

  it('should updated with correct param', async () => {
    const id = pipe(
      await service.addIndex(props, finantialID)(),
      E.map((result) => result.id),
      E.getOrElseW(() => -100),
    )
    const result = await service.updateIndex(
      { ...props, roe: 333.33 },
      id,
      finantialID,
    )()

    await service.deleteIndex(id, finantialID)()

    expect(E.isRight(result)).toBe(true)
    expect(
      pipe(
        result,
        E.map((index) => index.id),
        E.getOrElseW(() => 'this test will fail'),
      ),
    ).toBe(id)
  })

  // for getIndexList
  it('should get empty array with no data', async () => {
    const result = await service.getIndexList(finantialID)()
    expect(E.isRight(result)).toBe(true)
    expect(
      pipe(
        result,
        E.getOrElseW(() => 'this test will fail'),
      ),
    ).toEqual([])
  })

  it('should get correct index data', async () => {
    const index = await service.addIndex(props, finantialID)()
    const result = await service.getIndexList(finantialID)()

    // FIXME: ここで削除したくもないし、magic numberも使いたくもない
    await service.deleteIndex(1, finantialID)()

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

  it('should get correct index data with same finantialID', async () => {
    await service.addIndex(props, finantialID)()
    await service.addIndex(props, finantialID + 1)()
    const result = await service.getIndexList(finantialID)()

    // FIXME: ここで削除したくもないし、magic numberも使いたくもない
    await service.deleteIndex(1, finantialID)()
    await service.deleteIndex(2, finantialID + 1)()

    expect(E.isRight(result)).toBe(true)
    expect(
      pipe(
        result,
        E.map((result) => result.length),
        E.getOrElse(() => -1),
      ),
    ).toEqual(1)
  })

  // for deleteIndex
  it('should not deleted with no data', async () => {
    const result = await service.deleteIndex(1, finantialID)()
    expect(E.isLeft(result)).toBe(true)
  })

  it('should not deleted with invalid finantialID data', async () => {
    await service.addIndex(props, finantialID)()
    const result = await service.deleteIndex(1, finantialID + 1)()
    expect(E.isLeft(result)).toBe(true)

    await service.deleteIndex(1, finantialID)()
  })

  it('should delete with correct data', async () => {
    const indexID = pipe(
      await service.addIndex(props, finantialID)(),
      E.map((result) => result.id),
      E.getOrElse(() => -100),
    )
    const result = await service.deleteIndex(indexID, finantialID)()
    expect(E.isRight(result)).toBe(true)
    expect(
      pipe(
        result,
        E.getOrElseW(() => 'this test will fail'),
      ),
    ).toBe(indexID)
  })

  // for getIndex
  it('should not get data with no data', async () => {
    const result = await service.getIndex(1, finantialID)()
    expect(E.isLeft(result)).toBe(true)
  })

  it('should not get data with invalid finantialID', async () => {
    await service.addIndex(props, finantialID)
    const result = await service.getIndex(1, finantialID + 1)()
    expect(E.isLeft(result)).toBe(true)

    await service.deleteIndex(1, finantialID)
  })

  it('should get correct data', async () => {
    const indexID = pipe(
      await service.addIndex(props, finantialID)(),
      E.map((result) => result.id),
      E.getOrElseW(() => -100),
    )
    const result = await service.getIndex(indexID, finantialID)()

    // FIXME: ここで削除したくもない
    await service.deleteIndex(indexID, finantialID)()

    expect(E.isRight(result)).toBe(true)
    expect(
      pipe(
        result,
        E.map((result) => result.id),
        E.getOrElseW(() => 'this test will fail'),
      ),
    ).toBe(indexID)
  })
})
