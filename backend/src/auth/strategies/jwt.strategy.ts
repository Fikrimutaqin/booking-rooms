import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PrismaService } from "src/prisma/prisma.service";
import { JwtPayload } from "src/common/interfaces/jwt-payload.interface";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    // Inject config service and prisma service
    constructor(config: ConfigService, private prisma: PrismaService) {

        // Initialize strategy with config
        // jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken() - Extract JWT from Authorization header
        // ignoreExpiration: false - JWT must be valid
        // secretOrKey: config.getOrThrow<string>('JWT_SECRET') - Secret key for JWT
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