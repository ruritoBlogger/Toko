import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { Industry, IndustryAveIndex } from './entities'
import { IndustryModule } from './industry/industry.module'
import { IndustryAveIndexModule } from './industry-ave-index/industry-ave-index.module'

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'password',
      database: 'nestday7',
      entities: [Industry, IndustryAveIndex],
      synchronize: true,
    }),
    IndustryModule,
    IndustryAveIndexModule,
  ],
})
export class AppModule {}
