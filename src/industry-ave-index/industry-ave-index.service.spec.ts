import { Test, TestingModule } from '@nestjs/testing'
import { TypeOrmModule } from '@nestjs/typeorm'
import * as E from 'fp-ts/Either'
import { pipe } from 'fp-ts/function'

import { IndustryAveIndex } from '../entities'
import { IndustryAveIndexService } from './industry-ave-index.service'
import { Props } from './type'

describe('IndustryAveIndexService', () => {
  let service: IndustryAveIndexService
  const props: Props = {
    industryID: 1,
    announcementDate: new Date(),
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
          entities: [IndustryAveIndex],
          synchronize: true,
          keepConnectionAlive: true,
        }),
        TypeOrmModule.forFeature([IndustryAveIndex]),
      ],
      providers: [IndustryAveIndexService],
    }).compile()

    await module.init()
    service = await module.get<IndustryAveIndexService>(IndustryAveIndexService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  // for addIndex
  it('should not created with null param', async () => {
    const result = await service.addIndex(null)()
    expect(E.isLeft(result)).toBe(true)
  })

  it('should add index with correct param', async () => {
    const result = await service.addIndex(props)()

    // FIXME: ここで削除したくもないし、magic numberも使いたくもない
    await service.deleteIndex(1)()

    expect(E.isRight(result)).toBe(true)
    expect(
      pipe(
        result,
        E.map((result) => result.announcementDate),
        E.getOrElseW(() => 'this test will fail'),
      ),
    ).toBe(props.announcementDate)
  })

  it('should not add industry with same announcementDate param', async () => {
    await service.addIndex(props)()
    const secondIndex = await service.addIndex(props)()

    // FIXME: ここで削除したくもないし、magic numberも使いたくもない
    await service.deleteIndex(2)()

    expect(E.isLeft(secondIndex)).toBe(true)
  })

  // for getIndexList
  it('should get empty array with no data', async () => {
    const result = await service.getIndexList()()
    expect(E.isRight(result)).toBe(true)
    expect(
      pipe(
        result,
        E.getOrElseW(() => 'this test will fail'),
      ),
    ).toEqual([])
  })

  it('should get correct index data', async () => {
    const index = pipe(
      await service.addIndex(props)(),
      E.getOrElseW(() => 'addIndex failed...'),
    )
    const result = await service.getIndexList()()

    // FIXME: ここで削除したくもないし、magic numberも使いたくもない
    await service.deleteIndex(3)()

    expect(E.isRight(result)).toBe(true)
    expect(
      pipe(
        result,
        E.getOrElseW(() => 'this test will fail'),
      ),
    ).toEqual([index])
  })

  // for deleteIndex
  it('should not deleted with no data', async () => {
    const result = await service.deleteIndex(1)()
    expect(E.isLeft(result)).toBe(true)
  })

  it('should delete with correct data', async () => {
    const indexID = pipe(
      await service.addIndex(props)(),
      E.map((result) => result.id),
      E.getOrElseW(() => -100),
    )
    const result = await service.deleteIndex(indexID)()
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
    const result = await service.getIndex(1)()
    expect(E.isLeft(result)).toBe(true)
  })

  it('should get correct data', async () => {
    const indexID = pipe(
      await service.addIndex(props)(),
      E.map((result) => result.id),
      E.getOrElseW(() => -100),
    )
    const result = await service.getIndex(indexID)()

    // FIXME: ここで削除したくもない
    await service.deleteIndex(indexID)()

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
