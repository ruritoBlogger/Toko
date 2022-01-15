import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'

import { IndustryAveIndex } from '../entities'
import { returnWithThrowHttpException } from '../utils'
import { IndustryAveIndexService } from './industry-ave-index.service'
import type { Props } from './type'

// NOTE: industryAveIndexはIndustryに依存している
// なので、routingもindustryから生やす
// Industryのcontrollerに生やすと数が多すぎてつらいのでこっちに分割しました
@Controller('industry/:industryID')
export class IndustryAveIndexController {
  constructor(private readonly service: IndustryAveIndexService) {}

  @Get('index')
  async getIndexList(
    @Param() param: { industryID: number },
  ): Promise<IndustryAveIndex[]> {
    return await this.service
      .getIndexList(param.industryID)()
      .then((result) => returnWithThrowHttpException(result))
  }

  @Post('index')
  async addIndex(
    @Body() body: { props: Props },
    @Param() param: { industryID: number },
  ): Promise<IndustryAveIndex> {
    return await this.service
      .addIndex(body.props, param.industryID)()
      .then((result) => returnWithThrowHttpException(result))
  }

  @Put('index')
  async updateIndex(
    @Body() body: { id: number; props: Props },
    @Param() param: { industryID: number },
  ): Promise<IndustryAveIndex> {
    return await this.service
      .updateIndex(body.id, param.industryID, body.props)()
      .then((result) => returnWithThrowHttpException(result))
  }

  @Get('index/current')
  async getCurrentIndex(
    @Param() param: { industryID: number },
  ): Promise<IndustryAveIndex> {
    return await this.service
      .getCurrentIndex(param.industryID)()
      .then((result) => returnWithThrowHttpException(result))
  }

  @Get('index/:id')
  async getIndex(
    @Param() param: { id: number; industryID: number },
  ): Promise<IndustryAveIndex> {
    return await this.service
      .getIndex(param.id, param.industryID)()
      .then((result) => returnWithThrowHttpException(result))
  }

  @Delete('index/:id')
  async deleteIndex(
    @Param() param: { id: number; industryID: number },
  ): Promise<number> {
    return await this.service
      .deleteIndex(param.id, param.industryID)()
      .then((result) => returnWithThrowHttpException(result))
  }
}
