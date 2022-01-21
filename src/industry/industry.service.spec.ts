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
import { IndustryService } from './industry.service'
import type { Props } from './type'

describe('IndustryService', () => {
  let service: IndustryService
  const props: Props = { name: 'correct_param' }

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
      providers: [IndustryService],
    }).compile()

    await module.init()
    service = await module.get<IndustryService>(IndustryService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  // for addIndustry
  it('should not created with null param', async () => {
    const result = await service.addIndustry(null)()
    expect(E.isLeft(result)).toBe(true)
  })

  it('should add industry with correct param', async () => {
    const result = await service.addIndustry(props)()

    // FIXME: ここで削除したくもないし、magic numberも使いたくもない
    await service.deleteIndustry(1)()

    expect(E.isRight(result)).toBe(true)
    expect(
      pipe(
        result,
        E.map((result) => result.name),
        E.getOrElse(() => 'this test will fail'),
      ),
    ).toBe(props.name)
  })

  it('should not add industry with same name param', async () => {
    await service.addIndustry(props)()
    const secondIndustry = await service.addIndustry(props)()

    // FIXME: ここで削除したくもないし、magic numberも使いたくもない
    await service.deleteIndustry(1)()

    expect(E.isLeft(secondIndustry)).toBe(true)
  })

  // for updateIndustry
  it('should not updated with null param', async () => {
    const industryID = pipe(
      await service.addIndustry(props)(),
      E.map((result) => result.id),
      E.getOrElseW(() => -100),
    )
    const result = await service.updateIndustry(null, industryID)()

    await service.deleteIndustry(industryID)()

    expect(E.isLeft(result)).toBe(true)
  })

  it('should not updated with same name param', async () => {
    await service.addIndustry(props)()
    const industryID = pipe(
      await service.addIndustry({ name: 'another' })(),
      E.map((result) => result.id),
      E.getOrElseW(() => -100),
    )
    const result = await service.updateIndustry(props, industryID)()

    await service.deleteIndustry(1)()
    await service.deleteIndustry(industryID)()

    expect(E.isLeft(result)).toBe(true)
  })

  it('should updated with correct param', async () => {
    const industryID = pipe(
      await service.addIndustry(props)(),
      E.map((result) => result.id),
      E.getOrElseW(() => -100),
    )
    const anotherProps: Props = { name: 'another ' }
    const result = await service.updateIndustry(anotherProps, industryID)()

    await service.deleteIndustry(industryID)()

    expect(E.isRight(result)).toBe(true)
    expect(
      pipe(
        result,
        E.map((industry) => industry.name),
        E.getOrElseW(() => 'this test will fail'),
      ),
    ).toBe(anotherProps.name)
  })

  // for getIndustryList
  it('should get empty array with no data', async () => {
    const result = await service.getIndustyList()()
    expect(E.isRight(result)).toBe(true)
    expect(
      pipe(
        result,
        E.getOrElseW(() => 'this test will fail'),
      ),
    ).toEqual([])
  })

  it('should get correct industry data', async () => {
    const industry = pipe(
      await service.addIndustry(props)(),
      E.getOrElseW(() => 'addIndustry failed...'),
    )
    const result = await service.getIndustyList()()

    // FIXME: ここで削除したくもないし、magic numberも使いたくもない
    await service.deleteIndustry(1)()

    expect(E.isRight(result)).toBe(true)
    expect(
      pipe(
        result,
        E.getOrElseW(() => 'this test will fail'),
      ),
    ).toEqual([industry])
  })

  // for deleteIndustry
  it('should not deleted with no data', async () => {
    const result = await service.deleteIndustry(1)()
    expect(E.isLeft(result)).toBe(true)
  })

  it('should delete with correct data', async () => {
    const industryID = pipe(
      await service.addIndustry(props)(),
      E.map((result) => result.id),
      E.getOrElseW(() => -100),
    )
    const result = await service.deleteIndustry(industryID)()
    expect(E.isRight(result)).toBe(true)
    expect(
      pipe(
        result,
        E.getOrElseW(() => 'this test will fail'),
      ),
    ).toBe(industryID)
  })

  // for getIndustry
  it('should not get data with no data', async () => {
    const result = await service.getIndustry(1)()
    expect(E.isLeft(result)).toBe(true)
  })

  it('should get correct data', async () => {
    const industryID = pipe(
      await service.addIndustry(props)(),
      E.map((result) => result.id),
      E.getOrElseW(() => -100),
    )
    const result = await service.getIndustry(industryID)()

    // FIXME: ここで削除したくもない
    await service.deleteIndustry(industryID)()

    expect(E.isRight(result)).toBe(true)
    expect(
      pipe(
        result,
        E.map((result) => result.id),
        E.getOrElseW(() => 'this test will fail'),
      ),
    ).toBe(industryID)
  })
})
