import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserDetails } from '../schema/user.schema';

export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<{ user: UserDetails }>();
    return request.user;
  },
);
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
