import { Injectable, NotImplementedException } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    throw new NotImplementedException('xxx');
  }
}
