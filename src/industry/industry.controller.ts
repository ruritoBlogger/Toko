import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'

import { Industry } from '../entities'
import { returnWithThrowHttpException } from '../utils'
import { IndustryService } from './industry.service'
import type { Props } from './type'

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
  async addIndustry(@Body() body: { props: Props }): Promise<Industry> {
    return await this.service
      .addIndustry(body.props)()
      .then((result) => returnWithThrowHttpException(result))
  }

  @Put()
  async updateIndustry(
    @Body() body: { id: number; props: Props },
  ): Promise<Industry> {
    return await this.service
      .updateIndustry(body.id, body.props)()
      .then((result) => returnWithThrowHttpException(result))
  }

  @Get(':id')
  async getIndustry(@Param() param: { id: number }): Promise<Industry> {
    return await this.service
      .getIndustry(param.id)()
      .then((result) => returnWithThrowHttpException(result))
  }

  @Delete(':id')
  async deleteIndustry(@Param() param: { id: number }): Promise<number> {
    return await this.service
      .deleteIndustry(param.id)()
      .then((result) => returnWithThrowHttpException(result))
  }
}
