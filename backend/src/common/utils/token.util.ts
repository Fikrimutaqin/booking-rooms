// Core Nest and Other Core
import { randomUUID } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { StringValue } from 'ms';

// Import Services
import { PrismaService } from '../../prisma/prisma.service';

// Import Interfaces and Types
import { User } from '../../users/interfaces/user.interface';
import { JwtPayload } from '@common/interfaces/jwt-payload.interface';

// Import Others (Common etc)
import { hashPassword } from './hash.util';

interface TokenDeps {
  jwt: JwtService;
  config: ConfigService;
  prisma: PrismaService;
}

async function issueToken(user: User, deps: TokenDeps) {
  const accessPayload: JwtPayload = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };

  const refreshPayload = {
    id: user.id,
    email: user.email,
    jti: randomUUID(),
  };

  const [accessToken, refreshToken] = await Promise.all([
    deps.jwt.signAsync(accessPayload, {
      secret: deps.config.getOrThrow<string>('JWT_SECRET'),
      expiresIn: (deps.config.get<string>('JWT_EXPIRES_IN') ??
        '15m') as StringValue,
    }),
    deps.jwt.signAsync(refreshPayload, {
      secret: deps.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: (deps.config.get<string>('JWT_REFRESH_EXPIRES_IN') ??
        '7d') as StringValue,
    }),
  ]);

  await deps.prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: await hashPassword(refreshToken) },
  });

  return { accessToken, refreshToken };
}

async function revokeRefreshToken(id: string, prisma: PrismaService) {
  return prisma.user.update({
    where: { id },
    data: { refreshToken: null },
  });
}

export default { issueToken, revokeRefreshToken };
