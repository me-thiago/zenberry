import { User } from '@prisma/client';
import { UserDTO } from '../dto/user.dto';

export class UserMapper {
    /**
     * Converts a Prisma User entity to UserDTO
     * @param {User} user - The user entity from Prisma
     * @returns {UserDTO} The formatted user DTO
     */
    static toDTO(user: User): UserDTO {
        return {
            id: user.id,
            shopifyCustomerId: user.shopifyCustomerId,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            acceptsMarketing: user.acceptsMarketing,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }
}