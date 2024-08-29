import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors();
  const config = app.get(ConfigService);

  const port = config.get('app').appPort;
  await app.listen(port);
  const env = config.get('app').environment;

  console.log(`Application environment: ${env}`);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
