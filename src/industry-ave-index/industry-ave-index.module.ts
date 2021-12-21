import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { IndustryAveIndex } from './../entities/industry-ave-index.entity'
import { IndustryAveIndexController } from './industry-ave-index.controller'
import { IndustryAveIndexService } from './industry-ave-index.service'

@Module({
  controllers: [IndustryAveIndexController],
  imports: [TypeOrmModule.forFeature([IndustryAveIndex])],
  providers: [IndustryAveIndexService],
})
export class IndustryAveIndexModule {}
