import { Controller, Get, Post, Query } from '@nestjs/common'
import * as E from 'fp-ts/Either'
import { pipe } from 'fp-ts/function'

import { Industry } from '../entities'
import { IndustryService } from './industry.service'

@Controller('industry')
export class IndustryController {
  constructor(private readonly service: IndustryService) {}

  @Get()
  getIndustryList() {
    return this.service.getIndustyList()
  }

  @Post()
  async addIndustry(@Query() query: { name: string }): Promise<Industry> {
    return this.service
      .addIndustry(query.name)()
      .then((result) => {
        return pipe(
          result,
          E.getOrElseW((e) => {
            throw e
          }),
        )
      })
  }
}
