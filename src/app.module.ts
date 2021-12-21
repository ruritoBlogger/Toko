import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { Industry } from './entities/industry.entity'
import { IndustryModule } from './industry/industry.module'
import { IndustryAveIndexController } from './industry-ave-index/industry-ave-index.controller'
import { IndustryAveIndexModule } from './industry-ave-index/industry-ave-index.module'
import { IndustryAveIndexService } from './industry-ave-index/industry-ave-index.service'

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'password',
      database: 'nestday7',
      entities: [Industry],
      synchronize: true,
    }),
    IndustryModule,
    IndustryAveIndexModule,
  ],
  providers: [IndustryAveIndexService],
  controllers: [IndustryAveIndexController],
})
export class AppModule {}
