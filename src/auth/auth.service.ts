import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { SignOptions } from 'jsonwebtoken';
import { UserRole } from '../common/enums/user-role.enum';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { AuthTokensDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';

interface AccessPayload {
  sub: string;
  email: string;
  role: UserRole;
}

interface RefreshPayload extends AccessPayload {
  tokenType: 'refresh';
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(dto: LoginDto): Promise<AuthTokensDto> {
    const user = await this.usersService.findAuthByEmail(dto.email);
    const valid =
      user !== null &&
      (await this.usersService.verifyPassword(user, dto.password));

    if (!valid || !user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.issueTokens(user);
  }

  async refresh(refreshToken: string): Promise<AuthTokensDto> {
    let payload: RefreshPayload;

    try {
      payload = await this.jwtService.verifyAsync<RefreshPayload>(
        refreshToken,
        {
          secret: this.getRefreshSecret(),
        },
      );
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (payload.tokenType !== 'refresh') {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.usersService.findAuthById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return this.issueTokens(user);
  }

  private async issueTokens(user: User): Promise<AuthTokensDto> {
    const accessPayload: AccessPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessPayload, {
        secret: this.getAccessSecret(),
        expiresIn: this.toExpiresIn(
          this.configService.get<string>('JWT_ACCESS_EXPIRES_IN', '15m'),
        ),
      }),
      this.jwtService.signAsync(
        { ...accessPayload, tokenType: 'refresh' } satisfies RefreshPayload,
        {
          secret: this.getRefreshSecret(),
          expiresIn: this.toExpiresIn(
            this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
          ),
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
      },
    };
  }

  private getAccessSecret(): string {
    return (
      this.configService.get<string>('JWT_ACCESS_SECRET') ??
      this.configService.getOrThrow<string>('JWT_SECRET')
    );
  }

  private getRefreshSecret(): string {
    return (
      this.configService.get<string>('JWT_REFRESH_SECRET') ??
      this.getAccessSecret()
    );
  }

  private toExpiresIn(value: string): SignOptions['expiresIn'] {
    return value as SignOptions['expiresIn'];
  }
}
