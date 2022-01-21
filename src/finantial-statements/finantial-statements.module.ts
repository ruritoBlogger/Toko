import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { Company, FinantialStatements } from './../entities'
import { FinantialStatementsController } from './finantial-statements.controller'
import { FinantialStatementsService } from './finantial-statements.service'

@Module({
  controllers: [FinantialStatementsController],
  imports: [TypeOrmModule.forFeature([FinantialStatements, Company])],
  providers: [FinantialStatementsService],
})
export class FinantialStatementsModule {}
