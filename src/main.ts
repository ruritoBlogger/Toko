import { NestFactory } from '@nestjs/core'

import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // TODO: 正確な値に設定する
  app.enableCors({
    origin: process.env.TOKO_ORIGIN,
    allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept',
  })

  await app.listen(parseInt(process.env.TOKO_PORT))
}
bootstrap()
