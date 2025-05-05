import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserDetails } from '../entities/user.entity';

export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserDetails => {
    const request = ctx.switchToHttp().getRequest<{ user: UserDetails }>();
    return request.user;
  },
);
