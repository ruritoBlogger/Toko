import { Test, TestingModule } from '@nestjs/testing'

import { IndustryAveIndexService } from './industry-ave-index.service'

describe('IndustryAveIndexService', () => {
  let service: IndustryAveIndexService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IndustryAveIndexService],
    }).compile()

    service = module.get<IndustryAveIndexService>(IndustryAveIndexService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
