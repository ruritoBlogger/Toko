import { Test, TestingModule } from '@nestjs/testing'

import { FinantialStatementsService } from './finantial-statements.service'

describe('FinantialStatementsService', () => {
  let service: FinantialStatementsService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FinantialStatementsService],
    }).compile()

    service = module.get<FinantialStatementsService>(FinantialStatementsService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
