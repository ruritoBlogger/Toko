import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'

import { Cashflow } from '../entities'
import { returnWithThrowHttpException } from '../utils'
import { CashflowService } from './cashflow.service'
import type { Props } from './type'

@Controller('company/:companyID/finantial/:finantialID')
export class CashflowController {
  constructor(private readonly service: CashflowService) {}

  @Get('cashflow')
  async getCashflowList(
    @Param() param: { finantialID: number },
  ): Promise<Cashflow[]> {
    return await this.service
      .getCashflowList(param.finantialID)()
      .then((result) => returnWithThrowHttpException(result))
  }

  @Post('cashflow')
  async addCashflow(
    @Body() body: { props: Props },
    @Param() param: { finantialID: number },
  ): Promise<Cashflow> {
    return await this.service
      .addCashflow(body.props, param.finantialID)()
      .then((result) => returnWithThrowHttpException(result))
  }

  @Put('cashflow')
  async updateCashflow(
    @Body() body: { id: number; props: Props },
    @Param() param: { finantialID: number },
  ): Promise<Cashflow> {
    return await this.service
      .updateCashflow(body.props, body.id, param.finantialID)()
      .then((result) => returnWithThrowHttpException(result))
  }

  @Get('cashflow/:id')
  async getCashflow(
    @Param() param: { id: number; finantialID: number },
  ): Promise<Cashflow> {
    return await this.service
      .getCashflow(param.id, param.finantialID)()
      .then((result) => returnWithThrowHttpException(result))
  }

  @Delete('cashflow/:id')
  async deleteCashflow(
    @Param() param: { id: number; finantialID: number },
  ): Promise<number> {
    return await this.service
      .deleteCashflow(param.id, param.finantialID)()
      .then((result) => returnWithThrowHttpException(result))
  }
}
