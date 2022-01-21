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
import { CompanyService } from './company.service'
import type { Props } from './type'

describe('CompanyService', () => {
  let service: CompanyService
  const props: Props = {
    name: 'test',
    identificationCode: 2032,
    industryID: 1,
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          // FIXME: 本当はmysqlでやりたい
          type: 'sqlite',
          database: ':memory:',
          entities: [Industry, Company, IndustryAveIndex, FinantialStatements],
          synchronize: true,
          keepConnectionAlive: true,
        }),
        TypeOrmModule.forFeature([
          Industry,
          Company,
          IndustryAveIndex,
          FinantialStatements,
        ]),
      ],
      providers: [CompanyService, IndustryService],
    }).compile()

    await module.init()
    service = module.get<CompanyService>(CompanyService)

    // NOTE: リレーショナルな関係のIndustryのデータを生成しておく
    const parent_service = await module.get<IndustryService>(IndustryService)
    await parent_service.addIndustry({ name: 'test' })()
    await parent_service.addIndustry({ name: 'another' })()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  // for addCompany
  it('should not created with null param', async () => {
    const result = await service.addCompany(null)()
    expect(E.isLeft(result)).toBe(true)
  })

  it('should not created with invalid industryID param', async () => {
    const invalidIndustryID = 3

    const result = await service.addCompany({
      ...props,
      industryID: invalidIndustryID,
    })()
    expect(E.isLeft(result)).toBe(true)
  })

  it('should add company with correct param', async () => {
    const result = await service.addCompany(props)()

    // FIXME: ここで削除したくもないし、magic numberも使いたくもない
    await service.deleteCompany(1)()

    expect(E.isRight(result)).toBe(true)
    expect(
      pipe(
        result,
        E.map((result) => result.name),
        E.getOrElseW(() => 'this test will fail'),
      ),
    ).toStrictEqual(props.name)
  })

  it('should not add company with same name param', async () => {
    await service.addCompany(props)()
    const secondIndex = await service.addCompany({
      ...props,
      identificationCode: 4242,
    })()

    // FIXME: ここで削除したくもないし、magic numberも使いたくもない
    await service.deleteCompany(1)()

    expect(E.isLeft(secondIndex)).toBe(true)
  })

  it('should not add company with same identificationCode param', async () => {
    await service.addCompany(props)()
    const secondIndex = await service.addCompany({
      ...props,
      name: 'another',
    })()

    // FIXME: ここで削除したくもないし、magic numberも使いたくもない
    await service.deleteCompany(1)()

    expect(E.isLeft(secondIndex)).toBe(true)
  })

  // for updateCompany
  it('should not updated with null param', async () => {
    const id = pipe(
      await service.addCompany(props)(),
      E.map((result) => result.id),
      E.getOrElseW(() => -100),
    )
    const result = await service.updateCompany(null, id)()

    await service.deleteCompany(id)()

    expect(E.isLeft(result)).toBe(true)
  })

  it('should not updated with same name param', async () => {
    await service.addCompany(props)()
    const id = pipe(
      await service.addCompany({
        name: 'another',
        identificationCode: 9999,
        industryID: props.industryID,
      })(),
      E.map((result) => result.id),
      E.getOrElseW(() => -100),
    )
    const result = await service.updateCompany(
      { ...props, identificationCode: 8888 },
      id,
    )()

    await service.deleteCompany(1)()
    await service.deleteCompany(id)()

    expect(E.isLeft(result)).toBe(true)
  })

  it('should not updated with same identificationCode param', async () => {
    await service.addCompany(props)()
    const id = pipe(
      await service.addCompany({
        name: 'another',
        identificationCode: 9999,
        industryID: props.industryID,
      })(),
      E.map((result) => result.id),
      E.getOrElseW(() => -100),
    )
    const result = await service.updateCompany(
      { ...props, name: 'another_another' },
      id,
    )()

    await service.deleteCompany(1)()
    await service.deleteCompany(id)()

    expect(E.isLeft(result)).toBe(true)
  })

  it('should updated with correct param', async () => {
    const id = pipe(
      await service.addCompany(props)(),
      E.map((result) => result.id),
      E.getOrElseW(() => -100),
    )
    const anotherProps: Props = {
      name: 'another ',
      identificationCode: 9999,
      industryID: props.industryID,
    }
    const result = await service.updateCompany(anotherProps, id)()

    await service.deleteCompany(id)()

    expect(E.isRight(result)).toBe(true)
    expect(
      pipe(
        result,
        E.map((industry) => industry.name),
        E.getOrElseW(() => 'this test will fail'),
      ),
    ).toBe(anotherProps.name)
  })

  // for getCompanyList
  it('should get empty array with no data', async () => {
    const result = await service.getCompanyList()()
    expect(E.isRight(result)).toBe(true)
    expect(
      pipe(
        result,
        E.getOrElseW(() => 'this test will fail'),
      ),
    ).toEqual([])
  })

  it('should get correct company data', async () => {
    const company = await service.addCompany(props)()
    const result = await service.getCompanyList()()

    // FIXME: ここで削除したくもないし、magic numberも使いたくもない
    await service.deleteCompany(1)()

    expect(E.isRight(result)).toBe(true)
    expect(
      pipe(
        result,
        E.map((result) => result.shift()),
        E.getOrElseW(() => 'this test will fail'),
      ),
    ).toEqual(
      pipe(
        company,
        E.map((index) => index),
        E.getOrElseW(() => 'THIS TEST WILL FAIL'),
      ),
    )
  })

  // for deleteCompany
  it('should not deleted with no data', async () => {
    const result = await service.deleteCompany(1)()
    expect(E.isLeft(result)).toBe(true)
  })

  it('should delete with correct data', async () => {
    const indexID = pipe(
      await service.addCompany(props)(),
      E.map((result) => result.id),
      E.getOrElse(() => -100),
    )
    const result = await service.deleteCompany(indexID)()
    expect(E.isRight(result)).toBe(true)
    expect(
      pipe(
        result,
        E.getOrElseW(() => 'this test will fail'),
      ),
    ).toBe(indexID)
  })

  // for getCompany
  it('should not get data with no data', async () => {
    const result = await service.getCompany(1)()
    expect(E.isLeft(result)).toBe(true)
  })

  it('should not get data with invalid industryID', async () => {
    const invalidIndustryID = 3
    await service.addCompany({ ...props, industryID: invalidIndustryID })
    const result = await service.getCompany(1)()
    expect(E.isLeft(result)).toBe(true)

    await service.deleteCompany(1)
  })

  it('should get correct data', async () => {
    const indexID = pipe(
      await service.addCompany(props)(),
      E.map((result) => result.id),
      E.getOrElseW(() => -100),
    )
    const result = await service.getCompany(indexID)()

    // FIXME: ここで削除したくもない
    await service.deleteCompany(indexID)()

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
