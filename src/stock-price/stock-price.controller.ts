import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'

import { StockPrice } from '../entities'
import { returnWithThrowHttpException } from '../utils'
import { StockPriceService } from './stock-price.service'
import type { Props } from './type'

@Controller('company/:companyID')
export class StockPriceController {
  constructor(private readonly service: StockPriceService) {}

  @Get('stock')
  async getPriceList(
    @Param() param: { companyID: number },
  ): Promise<StockPrice[]> {
    return await this.service
      .getPriceList(param.companyID)()
      .then((result) => returnWithThrowHttpException(result))
  }

  @Post('stock')
  async addPrice(
    @Body() body: { props: Props },
    @Param() param: { companyID: number },
  ): Promise<StockPrice> {
    return await this.service
      .addPrice(body.props, param.companyID)()
      .then((result) => returnWithThrowHttpException(result))
  }

  @Put('stock')
  async updatePrice(
    @Body() body: { id: number; props: Props },
    @Param() param: { companyID: number },
  ): Promise<StockPrice> {
    return await this.service
      .updatePrice(body.props, body.id, param.companyID)()
      .then((result) => returnWithThrowHttpException(result))
  }

  @Get('stock/current')
  async getCurrentPrice(
    @Param() param: { companyID: number },
  ): Promise<StockPrice> {
    return await this.service
      .getCurrentPrice(param.companyID)()
      .then((result) => returnWithThrowHttpException(result))
  }

  @Get('stock/:id')
  async getIndex(
    @Param() param: { id: number; companyID: number },
  ): Promise<StockPrice> {
    return await this.service
      .getPrice(param.id, param.companyID)()
      .then((result) => returnWithThrowHttpException(result))
  }

  @Delete('stock/:id')
  async deleteIndex(
    @Param() param: { id: number; companyID: number },
  ): Promise<number> {
    return await this.service
      .deletePrice(param.id, param.companyID)()
      .then((result) => returnWithThrowHttpException(result))
  }
}
