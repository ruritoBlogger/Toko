import { Test, TestingModule } from '@nestjs/testing'

import { IndustryController } from './industry.controller'

describe('IndustryController', () => {
  let controller: IndustryController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IndustryController],
    }).compile()

    controller = module.get<IndustryController>(IndustryController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
