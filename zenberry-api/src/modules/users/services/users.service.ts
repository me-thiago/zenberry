import {
    Injectable,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../infra/database/prisma.service';
import { UserMapper } from '../common/user.mapper';
import { UserDTO } from '../dto/user.dto';

@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name);

    constructor(private readonly prisma: PrismaService) {}

    /**
     * Finds a user by its id and returns complete user information
     * @param {string} id - The user id to search for
     * @returns {Promise<UserDTO>} The user entity
     */
    async findById(id: string): Promise<UserDTO> {
        this.logger.debug(`[findById] Searching for user: ${id}`);

        const user = await this.prisma.user.findUnique({
            where: { id },
        });

        if (!user) {
            this.logger.error(`[findById] User not found: ${id}`);
            throw new NotFoundException('User not found');
        }

        this.logger.debug(`[findById] User found: ${user.email}`);
        return UserMapper.toDTO(user);
    }
}
