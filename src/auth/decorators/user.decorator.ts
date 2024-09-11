import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../entities';

export const _User = createParamDecorator((data: keyof User, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return data ? request.user?.[data] : request.user;
});
