import { Module } from '@nestjs/common';
import { GoogleApiService } from './google-api.service';
import { GoogleApiMockService } from './google-api-mock.service';
import appConfig from 'src/config/env/app.config';
import { ConfigType } from '@nestjs/config';

@Module({
  providers: [
    {
      provide: 'GoogleApiService',
      inject: [appConfig.KEY],
      useFactory: (config: ConfigType<typeof appConfig>) => {
        return config.environment === 'production' ? new GoogleApiService(config) : new GoogleApiMockService();
      },
    },
  ],
  exports: ['GoogleApiService'],
})
export class GoogleApiModule {}
