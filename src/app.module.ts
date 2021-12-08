import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { AppController } from './app.controller'
import { AppService } from './app.service'
import { Industry } from './entities/industry.entity'
import { IndustryModule } from './industry/industry.module'

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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
