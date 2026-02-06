import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginShopifyDto {
  @IsEmail()
  @ApiProperty({ 
    example: 'user@example.com',
    description: 'Customer email address'
  })
  email: string;

  @IsString()
  @MinLength(8)
  @ApiProperty({ 
    example: 'SecurePass123!',
    description: 'Customer password'
  })
  password: string;
}
