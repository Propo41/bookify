import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CalenderModule } from './calender/calender.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import typeOrmConfig from './config/orm.config';
import { ConfigModule } from '@nestjs/config';
import appConfig from './config/env/app.config';
import dbConfig from './config/env/db.config';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: process.env.NODE_ENV === 'development' ? `.env.development` : `.env`,
      load: [appConfig, dbConfig],
    }),
    AuthModule,
    CalenderModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
