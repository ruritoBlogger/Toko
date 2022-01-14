import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'

import { IndustryAveIndex } from '../entities'
import { returnWithThrowHttpException } from '../utils'
import { IndustryAveIndexService } from './industry-ave-index.service'
import type { Props } from './type'

// NOTE: industryAveIndexはIndustryに依存している
// なので、routingもindustryから生やす
// Industryのcontrollerに生やすと数が多すぎてつらいのでこっちに分割しました
@Controller('industry/:id')
export class IndustryAveIndexController {
  constructor(private readonly service: IndustryAveIndexService) {}

  @Get('index')
  async getIndexList(): Promise<IndustryAveIndex[]> {
    return await this.service
      .getIndexList()()
      .then((result) => returnWithThrowHttpException(result))
  }

  @Post('index')
  async addIndex(@Body() body: { props: Props }): Promise<IndustryAveIndex> {
    return await this.service
      .addIndex(body.props)()
      .then((result) => returnWithThrowHttpException(result))
  }

  @Put('index')
  async updateIndex(
    @Body() body: { id: number; props: Props },
  ): Promise<IndustryAveIndex> {
    return await this.service
      .updateIndex(body.id, body.props)()
      .then((result) => returnWithThrowHttpException(result))
  }

  /*
		TODO: 実装をやる
	@Get('index/current')
	async getCurrentIndex(): Promise<IndustryAveIndex> {
		return await this.service
	}
	*/

  @Get('index/:id')
  async getIndex(@Param() param: { id: number }): Promise<IndustryAveIndex> {
    return await this.service
      .getIndex(param.id)()
      .then((result) => returnWithThrowHttpException(result))
  }

  @Delete('index/:id')
  async deleteIndex(@Param() param: { id: number }): Promise<number> {
    return await this.service
      .deleteIndex(param.id)()
      .then((result) => returnWithThrowHttpException(result))
  }
}
