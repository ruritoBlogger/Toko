import { Test, TestingModule } from '@nestjs/testing'

import { IncomeStatementService } from './income-statement.service'

describe('IncomeStatementService', () => {
  let service: IncomeStatementService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IncomeStatementService],
    }).compile()

    service = module.get<IncomeStatementService>(IncomeStatementService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
