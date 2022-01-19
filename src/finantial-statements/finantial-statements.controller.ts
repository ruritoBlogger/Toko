import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'

import { FinantialStatements } from '../entities'
import { returnWithThrowHttpException } from '../utils'
import { FinantialStatementsService } from './finantial-statements.service'
import type { Props } from './type'

@Controller('company/:companyID')
export class FinantialStatementsController {
  constructor(private readonly service: FinantialStatementsService) {}

  @Get('finantial')
  async getStatementsList(
    @Param() param: { companyID: number },
  ): Promise<FinantialStatements[]> {
    return await this.service
      .getStatementsList(param.companyID)()
      .then((result) => returnWithThrowHttpException(result))
  }

  @Post('finantial')
  async addStatements(
    @Body() body: { props: Props },
    @Param() param: { companyID: number },
  ): Promise<FinantialStatements> {
    return await this.service
      .addStatements(param.companyID, body.props)()
      .then((result) => returnWithThrowHttpException(result))
  }

  @Put('finantial')
  async updateStatements(
    @Body() body: { id: number; props: Props },
    @Param() param: { companyID: number },
  ): Promise<FinantialStatements> {
    return await this.service
      .updateStatements(body.id, param.companyID, body.props)()
      .then((result) => returnWithThrowHttpException(result))
  }

  @Get('finantial/current')
  async getCurrentStatements(
    @Param() param: { companyID: number },
  ): Promise<FinantialStatements> {
    return await this.service
      .getCurrentStatements(param.companyID)()
      .then((result) => returnWithThrowHttpException(result))
  }

  @Get('finantial/:id')
  async getIndex(
    @Param() param: { id: number; companyID: number },
  ): Promise<FinantialStatements> {
    return await this.service
      .getStatements(param.id, param.companyID)()
      .then((result) => returnWithThrowHttpException(result))
  }

  @Delete('finantial/:id')
  async deleteIndex(
    @Param() param: { id: number; companyID: number },
  ): Promise<number> {
    return await this.service
      .deleteStatements(param.id, param.companyID)()
      .then((result) => returnWithThrowHttpException(result))
  }
}
