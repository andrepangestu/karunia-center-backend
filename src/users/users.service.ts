import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { FindOptionsWhere, ILike, QueryFailedError, Repository } from 'typeorm';
import { BCRYPT_SALT_ROUNDS } from '../common/constants/auth.constants';
import {
  PaginatedResult,
  buildPaginationMeta,
} from '../common/dto/pagination-meta.dto';
import { UserRole } from '../common/enums/user-role.enum';
import { CreateUserDto } from './dto/create-user.dto';
import { QueryUsersDto } from './dto/query-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService implements OnModuleInit {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.seedBootstrapAdmin();
  }

  async create(dto: CreateUserDto): Promise<UserResponseDto> {
    const email = this.normalizeEmail(dto.email);
    await this.assertEmailAvailable(email);

    const user = this.usersRepository.create({
      name: dto.name.trim(),
      email,
      passwordHash: await this.hashPassword(dto.password),
      role: dto.role,
      address: dto.address?.trim() ?? null,
      description: dto.description?.trim() ?? null,
    });

    const saved = await this.saveSafely(user);
    return this.toResponse(saved);
  }

  async findAll(
    query: QueryUsersDto,
  ): Promise<PaginatedResult<UserResponseDto>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const where: FindOptionsWhere<User>[] = [];

    if (query.search?.trim()) {
      const term = `%${query.search.trim()}%`;
      where.push({ name: ILike(term) }, { email: ILike(term) });
    }

    const [users, total] = await this.usersRepository.findAndCount({
      where: where.length
        ? where.map((item) =>
            query.role ? { ...item, role: query.role } : item,
          )
        : query.role
          ? { role: query.role }
          : undefined,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: users.map((user) => this.toResponse(user)),
      meta: buildPaginationMeta(page, limit, total),
    };
  }

  async findById(id: string): Promise<UserResponseDto> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.toResponse(user);
  }

  async findAuthByEmail(email: string): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('LOWER(user.email) = :email', {
        email: this.normalizeEmail(email),
      })
      .getOne();
  }

  async findAuthById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.email) {
      const email = this.normalizeEmail(dto.email);
      await this.assertEmailAvailable(email, id);
      user.email = email;
    }

    if (dto.name !== undefined) {
      user.name = dto.name.trim();
    }
    if (dto.role !== undefined) {
      user.role = dto.role;
    }
    if (dto.address !== undefined) {
      user.address = dto.address?.trim() ?? null;
    }
    if (dto.description !== undefined) {
      user.description = dto.description?.trim() ?? null;
    }
    if (dto.password) {
      user.passwordHash = await this.hashPassword(dto.password);
    }

    const saved = await this.saveSafely(user);
    return this.toResponse(saved);
  }

  async remove(id: string): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    try {
      await this.usersRepository.remove(user);
    } catch (error) {
      this.rethrowConstraint(error);
    }
  }

  async verifyPassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.passwordHash);
  }

  toResponse(user: User): UserResponseDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      address: user.address,
      description: user.description,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private async seedBootstrapAdmin(): Promise<void> {
    const count = await this.usersRepository.count();
    if (count > 0) {
      return;
    }

    const email = this.configService.get<string>('ADMIN_EMAIL');
    const password = this.configService.get<string>('ADMIN_PASSWORD');
    const name = this.configService.get<string>('ADMIN_NAME', 'Administrator');

    if (!email || !password) {
      this.logger.warn(
        'No users found. Set ADMIN_EMAIL and ADMIN_PASSWORD to seed the first admin.',
      );
      return;
    }

    await this.create({
      name,
      email,
      password,
      role: UserRole.ADMIN,
    });
    this.logger.log(`Bootstrap admin created: ${this.normalizeEmail(email)}`);
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private async assertEmailAvailable(
    email: string,
    excludeId?: string,
  ): Promise<void> {
    const existing = await this.usersRepository.findOne({ where: { email } });
    if (existing && existing.id !== excludeId) {
      throw new ConflictException('Email is already registered');
    }
  }

  private async saveSafely(user: User): Promise<User> {
    try {
      return await this.usersRepository.save(user);
    } catch (error) {
      this.rethrowConstraint(error);
    }
  }

  private rethrowConstraint(error: unknown): never {
    if (error instanceof QueryFailedError) {
      const driverError = error.driverError as { code?: string };
      if (driverError?.code === '23505') {
        throw new ConflictException('Email is already registered');
      }
      if (driverError?.code === '23503') {
        throw new ConflictException(
          'User cannot be deleted because related records still exist',
        );
      }
    }
    throw error;
  }
}
