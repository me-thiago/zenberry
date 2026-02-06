import { IsEmail, IsString, MinLength, Matches, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterShopifyDto {
  @IsEmail()
  @ApiProperty({ 
    example: 'user@example.com',
    description: 'Email address for the customer'
  })
  email: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/, {
    message: 'Password must contain uppercase, lowercase and number',
  })
  @ApiProperty({ 
    example: 'SecurePass123!',
    description: 'Password (minimum 8 characters, must contain uppercase, lowercase and number)'
  })
  password: string;

  @IsString()
  @MinLength(1)
  @ApiProperty({ 
    example: 'John',
    description: 'Customer first name'
  })
  firstName: string;

  @IsString()
  @MinLength(1)
  @ApiProperty({ 
    example: 'Doe',
    description: 'Customer last name'
  })
  lastName: string;

  @IsOptional()
  @IsString()
  @Matches(/^\+1\d{10}$/, {
    message: 'Phone must be in US format: +1XXXXXXXXXX (e.g., +12125551234)',
  })
  @ApiProperty({ 
    example: '+12125551234', 
    required: false,
    description: 'Customer phone number in US format: +1XXXXXXXXXX'
  })
  phone?: string;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ 
    example: true, 
    required: false, 
    default: false,
    description: 'Whether customer accepts marketing emails'
  })
  acceptsMarketing?: boolean;
}
