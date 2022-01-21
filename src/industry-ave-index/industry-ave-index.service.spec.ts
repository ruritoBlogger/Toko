import { Test, TestingModule } from '@nestjs/testing'
import { TypeOrmModule } from '@nestjs/typeorm'
import * as E from 'fp-ts/Either'
import { pipe } from 'fp-ts/function'

import {
  Company,
  FinantialStatements,
  Industry,
  IndustryAveIndex,
} from '../entities'
import { IndustryService } from '../industry/industry.service'
import { IndustryAveIndexService } from './industry-ave-index.service'
import { Props } from './type'

describe('IndustryAveIndexService', () => {
  let service: IndustryAveIndexService
  const industryID = 1
  const props: Props = {
    announcementDate: '2021/1/1',
    capitalAdequacyRatio: 1.0,
    roe: 1.0,
    roa: 1.0,
    per: 1.0,
    pbr: 1.0,
    eps: 1.0,
    pcfr: 1.0,
    yieldGap: 1.0,
    ebitda: 1.0,
    ev: 1.0,
    ev_ebitda: 1.0,
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
      providers: [IndustryAveIndexService, IndustryService],
    }).compile()

    await module.init()
    service = await module.get<IndustryAveIndexService>(IndustryAveIndexService)

    // NOTE: リレーショナルな関係のIndustryのデータを生成しておく
    const parent_service = await module.get<IndustryService>(IndustryService)
    await parent_service.addIndustry({ name: 'test' })()
    await parent_service.addIndustry({ name: 'another' })()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  // for addIndex
  it('should not created with null param', async () => {
    const result = await service.addIndex(null, 1)()
    expect(E.isLeft(result)).toBe(true)
  })

  it('should not created with invalid industryID param', async () => {
    const invalidIndustryID = 3

    const result = await service.addIndex(props, invalidIndustryID)()
    expect(E.isLeft(result)).toBe(true)
  })

  it('should add index with correct param', async () => {
    const result = await service.addIndex(props, industryID)()

    // FIXME: ここで削除したくもないし、magic numberも使いたくもない
    await service.deleteIndex(1, industryID)()

    expect(E.isRight(result)).toBe(true)
    expect(
      pipe(
        result,
        E.map((result) => result.announcementDate),
        E.getOrElseW(() => 'this test will fail'),
      ),
    ).toStrictEqual(new Date(props.announcementDate))
  })

  it('should not add industry with same announcementDate param', async () => {
    await service.addIndex(props, industryID)()
    const secondIndex = await service.addIndex(props, industryID)()

    // FIXME: ここで削除したくもないし、magic numberも使いたくもない
    await service.deleteIndex(1, industryID)()

    expect(E.isLeft(secondIndex)).toBe(true)
  })

  // for updateIndex
  it('should not updated with null param', async () => {
    const id = pipe(
      await service.addIndex(props, industryID)(),
      E.map((result) => result.id),
      E.getOrElseW(() => -100),
    )
    const result = await service.updateIndex(null, id, industryID)()

    await service.deleteIndex(id, industryID)()

    expect(E.isLeft(result)).toBe(true)
  })

  it('should not updated with same announcementDate param', async () => {
    await service.addIndex(props, industryID)()
    const id = pipe(
      await service.addIndex(props, industryID)(),
      E.map((result) => result.id),
      E.getOrElseW(() => -100),
    )
    const result = await service.updateIndex(props, id, industryID)()

    await service.deleteIndex(1, industryID)()
    await service.deleteIndex(id, industryID)()

    expect(E.isLeft(result)).toBe(true)
  })

  it('should not updated with invalid industryID param', async () => {
    const id = pipe(
      await service.addIndex(props, industryID)(),
      E.map((result) => result.id),
      E.getOrElseW(() => -100),
    )
    const result = await service.updateIndex(props, id, industryID + 1)()

    await service.deleteIndex(id, industryID)()

    expect(E.isLeft(result)).toBe(true)
  })

  it('should updated with correct param', async () => {
    const id = pipe(
      await service.addIndex(props, industryID)(),
      E.map((result) => result.id),
      E.getOrElseW(() => -100),
    )
    const anotherDate = '2018/1/1'
    const result = await service.updateIndex(
      { ...props, announcementDate: anotherDate },
      id,
      industryID,
    )()

    await service.deleteIndex(id, industryID)()

    expect(E.isRight(result)).toBe(true)
    expect(
      pipe(
        result,
        E.map((index) => index.announcementDate),
        E.getOrElseW(() => 'this test will fail'),
      ),
    ).toBe(anotherDate)
  })

  // for getIndexList
  it('should get empty array with no data', async () => {
    const result = await service.getIndexList(industryID)()
    expect(E.isRight(result)).toBe(true)
    expect(
      pipe(
        result,
        E.getOrElseW(() => 'this test will fail'),
      ),
    ).toEqual([])
  })

  it('should get correct index data', async () => {
    const index = await service.addIndex(props, industryID)()
    const result = await service.getIndexList(industryID)()

    // FIXME: ここで削除したくもないし、magic numberも使いたくもない
    await service.deleteIndex(1, industryID)()

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

  it('should get correct index data with same industryID', async () => {
    await service.addIndex(props, industryID)()
    await service.addIndex(props, industryID + 1)()
    const result = await service.getIndexList(industryID)()

    // FIXME: ここで削除したくもないし、magic numberも使いたくもない
    await service.deleteIndex(1, industryID)()
    await service.deleteIndex(2, industryID + 1)()

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
    const result = await service.deleteIndex(1, industryID)()
    expect(E.isLeft(result)).toBe(true)
  })

  it('should not deleted with invalid industryID data', async () => {
    await service.addIndex(props, industryID)()
    const result = await service.deleteIndex(1, industryID + 1)()
    expect(E.isLeft(result)).toBe(true)

    await service.deleteIndex(1, industryID)()
  })

  it('should delete with correct data', async () => {
    const indexID = pipe(
      await service.addIndex(props, industryID)(),
      E.map((result) => result.id),
      E.getOrElse(() => -100),
    )
    const result = await service.deleteIndex(indexID, industryID)()
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
    const result = await service.getIndex(1, industryID)()
    expect(E.isLeft(result)).toBe(true)
  })

  it('should not get data with invalid industryID', async () => {
    await service.addIndex(props, industryID)
    const result = await service.getIndex(1, industryID + 1)()
    expect(E.isLeft(result)).toBe(true)

    await service.deleteIndex(1, industryID)
  })

  it('should get correct data', async () => {
    const indexID = pipe(
      await service.addIndex(props, industryID)(),
      E.map((result) => result.id),
      E.getOrElseW(() => -100),
    )
    const result = await service.getIndex(indexID, industryID)()

    // FIXME: ここで削除したくもない
    await service.deleteIndex(indexID, industryID)()

    expect(E.isRight(result)).toBe(true)
    expect(
      pipe(
        result,
        E.map((result) => result.id),
        E.getOrElseW(() => 'this test will fail'),
      ),
    ).toBe(indexID)
  })

  // for getCurrentIndex
  it('should not get current data with no data', async () => {
    const result = await service.getCurrentIndex(industryID)()
    expect(E.isLeft(result)).toBe(true)
  })

  it('should not get current data with invalid industryID', async () => {
    await service.addIndex(props, industryID)
    const result = await service.getCurrentIndex(industryID + 1)()
    expect(E.isLeft(result)).toBe(true)

    await service.deleteIndex(1, industryID)
  })

  it('should get correct current data', async () => {
    const oldProps: Props = {
      announcementDate: '2000/1/1',
      capitalAdequacyRatio: 1.0,
      roe: 1.0,
      roa: 1.0,
      per: 1.0,
      pbr: 1.0,
      eps: 1.0,
      pcfr: 1.0,
      yieldGap: 1.0,
      ebitda: 1.0,
      ev: 1.0,
      ev_ebitda: 1.0,
    }

    const payload = await service.addIndex(props, industryID)()
    await service.addIndex(oldProps, industryID)()
    const indexID = pipe(
      payload,
      E.map((result) => result.id),
      E.getOrElseW(() => 'this test will fail'),
    )

    const result = await service.getCurrentIndex(industryID)()

    // FIXME: ここで削除したくもない
    await service.deleteIndex(1, industryID)()
    await service.deleteIndex(2, industryID)()

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
