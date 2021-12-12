import { Controller, Get, Post, Query } from '@nestjs/common'
import * as E from 'fp-ts/Either'
import { pipe } from 'fp-ts/function'

import { Industry } from '../entities'
import { returnWithThrowHttpException } from '../utils/returnWithThrowHttpException'
import { IndustryService } from './industry.service'

@Controller('industry')
export class IndustryController {
  constructor(private readonly service: IndustryService) {}

  @Get()
  async getIndustryList(): Promise<Industry[]> {
    return await this.service
      .getIndustyList()()
      .then((result) => returnWithThrowHttpException(result))
  }

  @Post()
  async addIndustry(@Query() query: { name: string }): Promise<Industry> {
    return await this.service
      .addIndustry(query.name)()
      .then((result) => returnWithThrowHttpException(result))
  }
}
