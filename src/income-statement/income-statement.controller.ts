import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'

import { IncomeStatement } from '../entities'
import { returnWithThrowHttpException } from '../utils'
import { IncomeStatementService } from './income-statement.service'
import type { Props } from './type'

@Controller('company/:companyID/finantial/:finantialID')
export class IncomeStatementController {
  constructor(private readonly service: IncomeStatementService) {}

  @Get('income')
  async getStatementList(
    @Param() param: { finantialID: number },
  ): Promise<IncomeStatement[]> {
    return await this.service
      .getStatementList(param.finantialID)()
      .then((result) => returnWithThrowHttpException(result))
  }

  @Post('income')
  async addStatement(
    @Body() body: { props: Props },
    @Param() param: { finantialID: number },
  ): Promise<IncomeStatement> {
    return await this.service
      .addStatement(body.props, param.finantialID)()
      .then((result) => returnWithThrowHttpException(result))
  }

  @Put('income')
  async updateStatement(
    @Body() body: { id: number; props: Props },
    @Param() param: { finantialID: number },
  ): Promise<IncomeStatement> {
    return await this.service
      .updateStatement(body.props, body.id, param.finantialID)()
      .then((result) => returnWithThrowHttpException(result))
  }

  @Get('income/:id')
  async getStatement(
    @Param() param: { id: number; finantialID: number },
  ): Promise<IncomeStatement> {
    return await this.service
      .getStatement(param.id, param.finantialID)()
      .then((result) => returnWithThrowHttpException(result))
  }

  @Delete('income/:id')
  async deleteStatement(
    @Param() param: { id: number; finantialID: number },
  ): Promise<number> {
    return await this.service
      .deleteStatement(param.id, param.finantialID)()
      .then((result) => returnWithThrowHttpException(result))
  }
}
