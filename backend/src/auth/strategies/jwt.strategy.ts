// Core Nest and Other Core
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

// Import Services
import { PrismaService } from '@prisma/prisma.service';

// Import Interfaces and Types
import { JwtPayload } from '@common/interfaces/jwt-payload.interface';

// Import Others (Common etc)

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  // Inject config service and prisma service
  constructor(
    config: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  /**
   * Validate JWT token
   * @param payload - JWT payload
   * @returns Validated JWT payload
   */
  async validate(payload: JwtPayload): Promise<JwtPayload> {
    // Check user is valid
    const user = await this.prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, name: true, email: true, role: true },
    });

    // If user is not found, throw UnauthorizedException
    if (!user) throw new UnauthorizedException();

    // Return validated user
    return { id: user.id, name: user.name, email: user.email, role: user.role };
  }
}
