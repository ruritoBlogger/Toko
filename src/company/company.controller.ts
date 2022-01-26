import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'

import { Company } from '../entities'
import { returnWithThrowHttpException } from '../utils'
import { CompanyService } from './company.service'
import type { Props } from './type'

@Controller('company')
export class CompanyController {
  constructor(private readonly service: CompanyService) {}

  @Get()
  async getCompanyList(): Promise<Company[]> {
    return await this.service
      .getCompanyList()()
      .then((result) => returnWithThrowHttpException(result))
  }

  @Post()
  async addCompany(@Body() body: { props: Props }): Promise<Company> {
    console.log(body)
    return await this.service
      .addCompany(body.props)()
      .then((result) => returnWithThrowHttpException(result))
  }

  @Put()
  async updateCompany(
    @Body() body: { props: Props; id: number },
  ): Promise<Company> {
    return await this.service
      .updateCompany(body.props, body.id)()
      .then((result) => returnWithThrowHttpException(result))
  }

  @Get(':id')
  async getCompany(@Param() param: { id: number }): Promise<Company> {
    return await this.service
      .getCompany(param.id)()
      .then((result) => returnWithThrowHttpException(result))
  }

  @Delete(':id')
  async deleteCompany(@Param() param: { id: number }): Promise<number> {
    return await this.service
      .deleteCompany(param.id)()
      .then((result) => returnWithThrowHttpException(result))
  }
}
