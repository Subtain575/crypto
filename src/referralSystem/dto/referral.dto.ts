import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserWithReferralDto {
  @ApiProperty({
    required: true,
    example: 'John',
    description: 'First name of the user',
  })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({
    required: true,
    example: 'Doe',
    description: 'Last name of the user',
  })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'securePassword123' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password?: string;

  @ApiPropertyOptional({ example: 'ABCD1234' })
  @IsOptional()
  @IsString()
  referralCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  referredBy?: string;

  @ApiPropertyOptional({ default: 'local' })
  @IsOptional()
  @IsString()
  provider?: 'google' | 'local';

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  isGoogleSignup?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  profileImage?: string;
}

export class LoginDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'securePassword123' })
  @IsString()
  @MinLength(6)
  password: string;
}

export class ApplyReferralDto {
  @ApiProperty({ example: 'ABCD1234' })
  @IsNotEmpty()
  @IsString()
  referralCode: string;
}
