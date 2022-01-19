import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { Industry, IndustryAveIndex } from './../entities'
import { IndustryAveIndexController } from './industry-ave-index.controller'
import { IndustryAveIndexService } from './industry-ave-index.service'

@Module({
  controllers: [IndustryAveIndexController],
  imports: [TypeOrmModule.forFeature([IndustryAveIndex, Industry])],
  providers: [IndustryAveIndexService],
})
export class IndustryAveIndexModule {}
