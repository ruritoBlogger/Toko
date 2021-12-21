import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { Industry } from './../entities/industry.entity'
import { IndustryController } from './industry.controller'
import { IndustryService } from './industry.service'

@Module({
  controllers: [IndustryController],
  imports: [TypeOrmModule.forFeature([Industry])],
  providers: [IndustryService],
})
export class IndustryModule {}
