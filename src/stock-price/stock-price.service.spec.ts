import { TestingModule } from '@nestjs/testing'
import * as E from 'fp-ts/Either'
import { pipe } from 'fp-ts/function'

import { CompanyService } from '../company/company.service'
import { IndustryService } from '../industry/industry.service'
import { generateTestingModule } from '../utils'
import { StockPriceService } from './stock-price.service'
import { Props } from './type'

describe('StockPriceService', () => {
  let service: StockPriceService
  const companyID = 1
  const props: Props = {
    date: '2021/1/1',
    openingPrice: 124,
    closingPrice: 134,
    highPrice: 139,
    lowPrice: 124,
  }

  beforeEach(async () => {
    const module: TestingModule = await generateTestingModule(
      IndustryService,
      CompanyService,
      StockPriceService,
    )

    await module.init()
    service = await module.get<StockPriceService>(StockPriceService)

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

  // for addPrice
  it('should not created with null param', async () => {
    const result = await service.addPrice(null, 1)()
    expect(E.isLeft(result)).toBe(true)
  })

  it('should not created with invalid companyID param', async () => {
    const invalidCompanyID = 3

    const result = await service.addPrice(props, invalidCompanyID)()
    expect(E.isLeft(result)).toBe(true)
  })

  it('should add price with correct param', async () => {
    const result = await service.addPrice(props, companyID)()

    // FIXME: ここで削除したくもないし、magic numberも使いたくもない
    await service.deletePrice(1, companyID)()

    expect(E.isRight(result)).toBe(true)
    expect(
      pipe(
        result,
        E.map((result) => result.date),
        E.getOrElseW(() => 'this test will fail'),
      ),
    ).toStrictEqual(new Date(props.date))
  })

  it('should not add price with same date param', async () => {
    await service.addPrice(props, companyID)()
    const secondPrice = await service.addPrice(props, companyID)()

    // FIXME: ここで削除したくもないし、magic numberも使いたくもない
    await service.deletePrice(1, companyID)()

    expect(E.isLeft(secondPrice)).toBe(true)
  })

  // for updatePrice
  it('should not updated with null param', async () => {
    const id = pipe(
      await service.addPrice(props, companyID)(),
      E.map((result) => result.id),
      E.getOrElseW(() => -100),
    )
    const result = await service.updatePrice(null, id, companyID)()

    await service.deletePrice(id, companyID)()

    expect(E.isLeft(result)).toBe(true)
  })

  it('should not updated with same date param', async () => {
    await service.addPrice(props, companyID)()
    const id = pipe(
      await service.addPrice({ ...props, date: '2017/1/1' }, companyID)(),
      E.map((result) => result.id),
      E.getOrElseW(() => -100),
    )
    const result = await service.updatePrice(props, id, companyID)()

    await service.deletePrice(1, companyID)()
    await service.deletePrice(id, companyID)()

    expect(E.isLeft(result)).toBe(true)
  })

  it('should updated with correct param', async () => {
    const id = pipe(
      await service.addPrice(props, companyID)(),
      E.map((result) => result.id),
      E.getOrElseW(() => -100),
    )
    const anotherDate = '2016/1/1'
    const result = await service.updatePrice(
      { ...props, date: anotherDate },
      id,
      companyID,
    )()

    await service.deletePrice(id, companyID)()

    expect(E.isRight(result)).toBe(true)
    expect(
      pipe(
        result,
        E.map((industry) => industry.date),
        E.getOrElseW(() => 'this test will fail'),
      ),
    ).toBe(anotherDate)
  })

  // for getPriceList
  it('should get empty array with no data', async () => {
    const result = await service.getPriceList(companyID)()
    expect(E.isRight(result)).toBe(true)
    expect(
      pipe(
        result,
        E.getOrElseW(() => 'this test will fail'),
      ),
    ).toEqual([])
  })

  it('should get correct price data', async () => {
    const index = await service.addPrice(props, companyID)()
    const result = await service.getPriceList(companyID)()

    // FIXME: ここで削除したくもないし、magic numberも使いたくもない
    await service.deletePrice(1, companyID)()

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

  it('should get correct price data with same companyID', async () => {
    await service.addPrice(props, companyID)()
    await service.addPrice(props, companyID + 1)()
    const result = await service.getPriceList(companyID)()

    // FIXME: ここで削除したくもないし、magic numberも使いたくもない
    await service.deletePrice(1, companyID)()
    await service.deletePrice(2, companyID + 1)()

    expect(E.isRight(result)).toBe(true)
    expect(
      pipe(
        result,
        E.map((result) => result.length),
        E.getOrElse(() => -1),
      ),
    ).toEqual(1)
  })

  // for deletePrice
  it('should not deleted with no data', async () => {
    const result = await service.deletePrice(1, companyID)()
    expect(E.isLeft(result)).toBe(true)
  })

  it('should not deleted with invalid companyID data', async () => {
    await service.addPrice(props, companyID)()
    const result = await service.deletePrice(1, companyID + 1)()
    expect(E.isLeft(result)).toBe(true)

    await service.deletePrice(1, companyID)()
  })

  it('should delete with correct data', async () => {
    const priceID = pipe(
      await service.addPrice(props, companyID)(),
      E.map((result) => result.id),
      E.getOrElse(() => -100),
    )
    const result = await service.deletePrice(priceID, companyID)()
    expect(E.isRight(result)).toBe(true)
    expect(
      pipe(
        result,
        E.getOrElseW(() => 'this test will fail'),
      ),
    ).toBe(priceID)
  })

  // for getPrice
  it('should not get data with no data', async () => {
    const result = await service.getPrice(1, companyID)()
    expect(E.isLeft(result)).toBe(true)
  })

  it('should not get data with invalid companyID', async () => {
    await service.addPrice(props, companyID)
    const result = await service.getPrice(1, companyID + 1)()
    expect(E.isLeft(result)).toBe(true)

    await service.deletePrice(1, companyID)
  })

  it('should get correct data', async () => {
    const priceID = pipe(
      await service.addPrice(props, companyID)(),
      E.map((result) => result.id),
      E.getOrElseW(() => -100),
    )
    const result = await service.getPrice(priceID, companyID)()

    // FIXME: ここで削除したくもない
    await service.deletePrice(priceID, companyID)()

    expect(E.isRight(result)).toBe(true)
    expect(
      pipe(
        result,
        E.map((result) => result.id),
        E.getOrElseW(() => 'this test will fail'),
      ),
    ).toBe(priceID)
  })

  // for getCurrentPrice
  it('should not get current data with no data', async () => {
    const result = await service.getCurrentPrice(companyID)()
    expect(E.isLeft(result)).toBe(true)
  })

  it('should not get current data with invalid companyID', async () => {
    await service.addPrice(props, companyID)
    const result = await service.getCurrentPrice(companyID + 1)()
    expect(E.isLeft(result)).toBe(true)

    await service.deletePrice(1, companyID)
  })

  it('should get correct current data', async () => {
    const oldProps: Props = {
      date: '2000/1/1',
      openingPrice: 134,
      closingPrice: 153,
      highPrice: 124,
      lowPrice: 132,
    }

    const payload = await service.addPrice(props, companyID)()
    await service.addPrice(oldProps, companyID)()
    const priceID = pipe(
      payload,
      E.map((result) => result.id),
      E.getOrElseW(() => 'this test will fail'),
    )

    const result = await service.getCurrentPrice(companyID)()

    // FIXME: ここで削除したくもない
    await service.deletePrice(1, companyID)()
    await service.deletePrice(2, companyID)()

    expect(E.isRight(result)).toBe(true)
    expect(
      pipe(
        result,
        E.map((result) => result.id),
        E.getOrElseW(() => 'this test will fail'),
      ),
    ).toBe(priceID)
  })
})
