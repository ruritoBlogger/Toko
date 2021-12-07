import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { AppController } from './app.controller'
import { AppService } from './app.service'
import { IndustryModule } from './industry/industry.module'

@Module({
  imports: [TypeOrmModule.forRoot(), IndustryModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
