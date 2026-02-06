import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';

export class UserDTO {
    @ApiProperty({
        description: 'Unique identifier for the user',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    id: string;

    @ApiProperty({
        description: 'Shopify Customer ID',
        example: 'gid://shopify/Customer/123456'
    })
    shopifyCustomerId: string;

    @ApiProperty({
        description: 'Email address of the user',
        example: 'john.doe@example.com'
    })
    email: string;

    @ApiProperty({
        description: 'First name of the user',
        example: 'John'
    })
    firstName: string;

    @ApiProperty({
        description: 'Last name of the user',
        example: 'Doe'
    })
    lastName: string;

    @ApiProperty({
        description: 'Phone number of the user',
        example: '+1234567890',
        nullable: true
    })
    phone: string | null;

    @ApiProperty({
        description: 'Whether the user accepts marketing emails',
        example: true
    })
    acceptsMarketing: boolean;

    @ApiProperty({
        description: 'Date when the user was created',
        example: '2023-01-01T00:00:00.000Z'
    })
    createdAt: Date;

    @ApiProperty({
        description: 'Date when the user was last updated',
        example: '2023-01-02T00:00:00.000Z'
    })
    updatedAt: Date;
}

export class UpdateUserSettingsDTO {
    @IsEmail()
    @IsOptional()
    @ApiProperty({
        description: 'Email address for the user',
        example: 'user@example.com',
        required: false
    })
    email?: string;

    @IsString()
    @IsOptional()
    @ApiProperty({
        description: 'First name of the user',
        example: 'John',
        required: false,
    })
    firstName?: string;

    @IsString()
    @IsOptional()
    @ApiProperty({
        description: 'Last name of the user',
        example: 'Doe',
        required: false,
    })
    lastName?: string;

    @IsString()
    @IsOptional()
    @ApiProperty({
        description: 'Phone number of the user (E.164)',
        example: '+15551234567',
        required: false,
    })
    phone?: string;

    @IsBoolean()
    @IsOptional()
    @ApiProperty({
        description: 'Whether the user accepts marketing emails',
        example: true,
        required: false,
    })
    acceptsMarketing?: boolean;
}

export class UpdateUserSettingsResponseDTO {
    @ApiProperty({
        description: 'Updated customer information (Shopify)',
        example: {
            id: 'gid://shopify/Customer/123456789',
            email: 'user@example.com',
            firstName: 'John',
            lastName: 'Doe',
            phone: '+15551234567',
            acceptsMarketing: true,
        },
    })
    customer: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        acceptsMarketing: boolean;
    };

    @ApiProperty({
        description: 'Success message',
        example: 'User settings updated successfully'
    })
    message: string;

    @ApiProperty({
        description: 'New customer access token (if rotated by Shopify)',
        example: 'shpat_abc123',
        required: false,
        nullable: true,
    })
    accessToken?: string;

    @ApiProperty({
        description: 'New token expiration (if rotated)',
        example: '2025-12-04T16:42:00.000Z',
        required: false,
        nullable: true,
    })
    expiresAt?: string;
}