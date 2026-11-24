// Core Nest and Other Core
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

// Import Services
import { PrismaService } from '../prisma/prisma.service';

// Import DTOs
import { CreateUserDto } from './dto/create-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

// Import Interfaces and Types
import { SafeUser } from './interfaces/user.interface';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';

// Import Others (Common etc)
import { hashPassword } from '../common/utils/hash.util';
import { PaginationParams } from '../common/decorators/paginate.decorator';

// Omit password and refreshToken from the response
const SAFE_OMIT = { password: true, refreshToken: true } as const;

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new user
   * @param dto Create user DTO
   * @returns Created user (safe)
   */
  async create(dto: CreateUserDto): Promise<SafeUser> {
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (exists) {
      throw new ConflictException('Email has already been registered');
    }
    return this.prisma.user.create({
      data: { ...dto, password: await hashPassword(dto.password) },
      omit: SAFE_OMIT,
    });
  }

  /**
   * Find all users with query filters and pagination
   * @param query Query user filter
   * @param pagination Pagination parameters
   * @returns Paginated list of users
   */
  async findAll(
    query: QueryUserDto,
    pagination: PaginationParams,
  ): Promise<PaginatedResult<SafeUser>> {
    const where: Prisma.UserWhereInput = {
      ...(query?.role && { role: query.role }),
      ...(query?.search && {
        OR: [
          { name: { contains: query.search, mode: 'insensitive' } },
          { email: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        omit: SAFE_OMIT,
        take: pagination.limit || 20,
        skip: pagination.skip,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page: pagination.page,
        limit: pagination.limit,
      },
    };
  }

  /**
   * Find user by id
   * @param id User ID
   * @returns Found user (safe)
   */
  async findOne(id: string): Promise<SafeUser> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      omit: SAFE_OMIT,
    });
    if (!user) {
      throw new NotFoundException('User not found...');
    }
    return user;
  }

  /**
   * Update user by id
   * @param id User ID
   * @param dto Update user DTO
   * @returns Updated user (safe)
   */
  async update(id: string, dto: UpdateUserDto): Promise<SafeUser> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!user) {
      throw new NotFoundException('User not found...');
    }

    const updateData: Prisma.UserUpdateInput = {
      ...(dto.name && { name: dto.name }),
      ...(dto.role && { role: dto.role }),
      ...(dto.password && { password: await hashPassword(dto.password) }),
    };

    return this.prisma.user.update({
      where: { id },
      data: updateData,
      omit: SAFE_OMIT,
    });
  }

  /**
   * Remove user by id
   * @param id User ID
   * @returns Deleted user (safe)
   */
  async remove(id: string): Promise<SafeUser> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!user) {
      throw new NotFoundException('User not found...');
    }

    return this.prisma.user.delete({
      where: { id },
      omit: SAFE_OMIT,
    });
  }
}
