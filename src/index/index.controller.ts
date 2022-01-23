import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'

import { Index } from '../entities'
import { returnWithThrowHttpException } from '../utils'
import { IndexService } from './index.service'
import type { Props } from './type'

@Controller('company/:companyID/finantial/:finantialID')
export class IndexController {
  constructor(private readonly service: IndexService) {}

  @Get('index')
  async getIndexList(
    @Param() param: { finantialID: number },
  ): Promise<Index[]> {
    return await this.service
      .getIndexList(param.finantialID)()
      .then((result) => returnWithThrowHttpException(result))
  }

  @Post('index')
  async addIndex(
    @Body() body: { props: Props },
    @Param() param: { finantialID: number },
  ): Promise<Index> {
    return await this.service
      .addIndex(body.props, param.finantialID)()
      .then((result) => returnWithThrowHttpException(result))
  }

  @Put('index')
  async updateIndex(
    @Body() body: { id: number; props: Props },
    @Param() param: { finantialID: number },
  ): Promise<Index> {
    return await this.service
      .updateIndex(body.props, body.id, param.finantialID)()
      .then((result) => returnWithThrowHttpException(result))
  }

  @Get('index/:id')
  async getIndex(
    @Param() param: { id: number; finantialID: number },
  ): Promise<Index> {
    return await this.service
      .getIndex(param.id, param.finantialID)()
      .then((result) => returnWithThrowHttpException(result))
  }

  @Delete('index/:id')
  async deleteIndex(
    @Param() param: { id: number; finantialID: number },
  ): Promise<number> {
    return await this.service
      .deleteIndex(param.id, param.finantialID)()
      .then((result) => returnWithThrowHttpException(result))
  }
}
