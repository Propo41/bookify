import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const _OAuth2Client = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.oauth2Client;
});
