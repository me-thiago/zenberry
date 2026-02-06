import { Controller, Post, Get, Body, Headers, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { ShopifyAuthService } from './shopify-auth.service';
import { RegisterShopifyDto } from './dto/register-shopify.dto';
import { LoginShopifyDto } from './dto/login-shopify.dto';
import { ShopifyAuthResponseDto } from './dto/shopify-auth-response.dto';
import { ShopifyJwtGuard } from './guards/shopify-jwt.guard';

@ApiTags('Authentication - Shopify')
@Controller('auth/shopify')
export class ShopifyAuthController {
  constructor(private readonly shopifyAuthService: ShopifyAuthService) {}
  
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Register a new customer',
    description: 'Creates a new customer in Shopify and returns access token'
  })
  @ApiBody({ type: RegisterShopifyDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Customer successfully registered',
    type: ShopifyAuthResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input or customer already exists',
  })
  async register(@Body() dto: RegisterShopifyDto) {
    return this.shopifyAuthService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Login customer',
    description: 'Authenticates customer with Shopify and returns access token'
  })
  @ApiBody({ type: LoginShopifyDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Customer successfully authenticated',
    type: ShopifyAuthResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid credentials',
  })
  async login(@Body() dto: LoginShopifyDto) {
    return this.shopifyAuthService.login(dto);
  }

  @Get('customer')
  @UseGuards(ShopifyJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Get current customer',
    description: 'Returns current authenticated customer information'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Customer information retrieved',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or expired token',
  })
  async getCurrentCustomer(@Headers('authorization') auth: string) {
    const token = auth.split(' ')[1];
    return this.shopifyAuthService.getCurrentCustomer(token);
  }

  @Post('logout')
  @UseGuards(ShopifyJwtGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Logout customer',
    description: 'Invalidates customer access token'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Customer successfully logged out',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Logged out successfully' }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or expired token',
  })
  async logout(@Headers('authorization') auth: string) {
    const token = auth.split(' ')[1];
    return this.shopifyAuthService.logout(token);
  }
}
