import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { Company, StockPrice } from './../entities'
import { StockPriceController } from './stock-price.controller'
import { StockPriceService } from './stock-price.service'

@Module({
  controllers: [StockPriceController],
  imports: [TypeOrmModule.forFeature([StockPrice, Company])],
  providers: [StockPriceService],
})
export class StockPriceModule {}
