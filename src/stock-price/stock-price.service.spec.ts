import { Test, TestingModule } from '@nestjs/testing'

import { StockPriceService } from './stock-price.service'

describe('StockPriceService', () => {
  let service: StockPriceService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StockPriceService],
    }).compile()

    service = module.get<StockPriceService>(StockPriceService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
