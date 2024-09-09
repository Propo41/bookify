import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { ForbiddenException } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { winstonInstance } from './config/winston.config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: WinstonModule.createLogger({
      instance: winstonInstance,
    }),
  });

  const config = app.get(ConfigService);
  const port = config.get('app').appPort;
  const env = config.get('app').environment;

  const whitelist = [config.get('app').appDomain];
  
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || whitelist.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new ForbiddenException('Not allowed by CORS'));
      }
    },
  });

  await app.listen(port);

  console.log(`Application environment: ${env}`);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
