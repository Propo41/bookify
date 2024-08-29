import { DataSource, DataSourceOptions } from 'typeorm';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import dbConfiguration from './env/db.config';

ConfigModule.forRoot({
  isGlobal: true,
  cache: true,
  envFilePath:
    process.env.NODE_ENV === 'development' ? `.env.development` : `.env`,
  load: [dbConfiguration],
});

const typeOrmConfig: TypeOrmModuleOptions = {
  ...dbConfiguration(),
  type: 'mysql',
  entities: [__dirname + '/../**/*.entity.{js,ts}'],
  migrations: ['dist/**/migrations/*{.js,.ts}'],
};

export default typeOrmConfig;
export const connectionSource = new DataSource(
  typeOrmConfig as DataSourceOptions,
);
