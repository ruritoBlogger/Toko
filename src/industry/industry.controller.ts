import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common'

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
  async addIndustry(@Body() body: { name: string }): Promise<Industry> {
    return await this.service
      .addIndustry(body.name)()
      .then((result) => returnWithThrowHttpException(result))
  }

  @Put()
  async updateIndustry(
    @Body() body: { id: number; name: string },
  ): Promise<Industry> {
    return await this.service
      .updateIndustry(body.id, body.name)()
      .then((result) => returnWithThrowHttpException(result))
  }

  @Get(':id')
  async getIndustry(@Param() param: { id: number }): Promise<Industry> {
    return await this.service
      .getIndustry(param.id)()
      .then((result) => returnWithThrowHttpException(result))
  }
}
