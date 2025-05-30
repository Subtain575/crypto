import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  UseGuards,
  Req,
  Put,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dtos/register.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { UserRole } from './roles.enum';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { UserDetails } from './entities/user.entity';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({
    summary: 'User Signup',
    description:
      'Use this endpoint to register a new user by providing their details.',
  })
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @ApiOperation({
    summary: 'User Login',
    description:
      'Use this endpoint to authenticate a user and generate a JWT token for subsequent requests.',
  })
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('google')
  @ApiOperation({ summary: 'Google Login' })
  @ApiBody({ schema: { example: { token: 'GOOGLE_ID_TOKEN' } } })
  @ApiResponse({
    status: 200,
    description: 'Successful login',
  })
  @ApiResponse({ status: 401, description: 'Invalid Google token' })
  async googleLogin(@Body('token') token: string) {
    return this.authService.validateGoogleToken(token);
  }

  @Get('users')
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async findAll(@Req() req: Request & { user: UserDetails }) {
    return this.authService.findAll(req.user);
  }

  @Get('users/:id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  async findOne(
    @Param('id') id: string,
    @Req() req: Request & { user: UserDetails },
  ) {
    return this.authService.findOne(id, req.user);
  }

  @Put('users/:id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @Req() req: Request & { user: UserDetails },
  ) {
    return this.authService.update(id, dto, req.user);
  }

  @Delete('users/:id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  async delete(
    @Param('id') id: string,
    @Req() req: Request & { user: UserDetails },
  ) {
    return this.authService.delete(id, req.user);
  }
}
