import { Controller, Get, Post, Query } from '@nestjs/common'

import { IndustryService } from './industry.service'

@Controller('industry')
export class IndustryController {
  constructor(private readonly service: IndustryService) {}

  @Get()
  getIndustryList() {
    return this.service.getIndustyList()
  }

  @Post()
  addIndustry(@Query() query: { name: string }) {
    return this.service.addIndustry(query.name)
  }
}
