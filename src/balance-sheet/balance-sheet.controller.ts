import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'

import { BalanceSheet } from '../entities'
import { returnWithThrowHttpException } from '../utils'
import { BalanceSheetService } from './balance-sheet.service'
import type { Props } from './type'

@Controller('company/:companyID/finantial/:finantialID')
export class BalanceSheetController {
  constructor(private readonly service: BalanceSheetService) {}

  @Get('sheet')
  async getSheetList(
    @Param() param: { finantialID: number },
  ): Promise<BalanceSheet[]> {
    return await this.service
      .getSheetList(param.finantialID)()
      .then((result) => returnWithThrowHttpException(result))
  }

  @Post('sheet')
  async addSheet(
    @Body() body: { props: Props },
    @Param() param: { finantialID: number },
  ): Promise<BalanceSheet> {
    return await this.service
      .addSheet(body.props, param.finantialID)()
      .then((result) => returnWithThrowHttpException(result))
  }

  @Put('sheet')
  async updateSheet(
    @Body() body: { id: number; props: Props },
    @Param() param: { finantialID: number },
  ): Promise<BalanceSheet> {
    return await this.service
      .updateSheet(body.props, body.id, param.finantialID)()
      .then((result) => returnWithThrowHttpException(result))
  }

  @Get('sheet/:id')
  async getSheet(
    @Param() param: { id: number; finantialID: number },
  ): Promise<BalanceSheet> {
    return await this.service
      .getSheet(param.id, param.finantialID)()
      .then((result) => returnWithThrowHttpException(result))
  }

  @Delete('sheet/:id')
  async deleteSheet(
    @Param() param: { id: number; finantialID: number },
  ): Promise<number> {
    return await this.service
      .deleteSheet(param.id, param.finantialID)()
      .then((result) => returnWithThrowHttpException(result))
  }
}
