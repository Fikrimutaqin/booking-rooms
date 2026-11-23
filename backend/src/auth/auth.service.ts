import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { hashPassword, verifyPassword } from 'src/common/utils/hash.util';
import { UserRole } from 'src/common/enums/user-role.enum';
import { UserSignToken } from './interfaces/auth.interface';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtPayload } from 'src/common/interfaces/jwt-payload.interface';
import { ConfigService } from '@nestjs/config';
import token from 'src/common/utils/token.util';

@Injectable()
export class AuthService {
    // Constructor for prisma and jwt service and config
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private config: ConfigService,
    ) { }

    /**
     * @param dto - register dto 
     * @returns 
     * @description register new user 
     * @throw ConflictException if email is already registered
     */
    async register(dto: RegisterDto) {
        // Find user by email
        const existUsers = await this.findUserByEmail(dto.email);

        // Validation exist email and throw conflict exception
        if (existUsers) throw new ConflictException('Email has been registered...');

        // Hash password
        const passwordHash = await hashPassword(dto.password);

        // Create user
        const user = await this.prisma.user.create({
            data: {
                name: dto.name,
                email: dto.email,
                password: passwordHash,
                role: UserRole.EMPLOYEE
            },
            omit: { password: true }
        })

        // Return user and access token
        return { user, accessToken: await this.signToken(user) }
    }

    /**
     * @param dto - login dto 
     * @returns 
     * @description login user 
     * @throw UnauthorizedException if email or password is wrong
     */
    async login(dto: LoginDto) {
        // Find user by email
        const user = await this.findUserByEmail(dto.email);

        // Verify User
        const valid = user && (await verifyPassword(user.password, dto.password))
        if (!user || !valid) {
            throw new UnauthorizedException('Email and Password is wrong...')
        }

        // Destructure user object to exclude the password field
        const { password: _, refreshToken: __, ...safeUser } = user;

        // Return user and access token and refresh token

        const tokens = await token.issueToken(user, {
            jwt: this.jwtService,
            config: this.config,
            prisma: this.prisma,
        });
        return { user: safeUser, ...tokens }
    }

    /**
     * @param dto - refresh token dto 
     * @returns 
     * @description refresh token 
     * @throw UnauthorizedException if refresh token is invalid
     */
    async refreshToken(dto: RefreshTokenDto) {
        let payload: JwtPayload;

        console.log('Data Refresh Token', dto);

        // Verify JWT token with refresh secret
        try {
            payload = await this.jwtService.verifyAsync<JwtPayload>(dto.refreshToken, {
                secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET')
            })
        } catch (error) {
            console.log('Verify Failed:', error.message);
            throw new UnauthorizedException('Invalid refresh token...')
        }

        // Get user and check user and refresh token
        const user = await this.prisma.user.findUnique({
            where: { id: payload.id }
        })

        if (!user || !user.refreshToken) {
            throw new UnauthorizedException('Session has expired, please login again...')
        }

        const match = await verifyPassword(user.refreshToken, dto.refreshToken);
        if (!match) {
            await token.revokeRefreshToken(user.id, this.prisma);
            throw new UnauthorizedException('Invalid refresh token, please login again...')
        }

        const tokens = await token.issueToken(user, {
            jwt: this.jwtService,
            config: this.config,
            prisma: this.prisma,
        });

        return tokens;
    }

    /**
     * @param email - user email
     * @returns user or null
     * @description find user by email
     */
    private async findUserByEmail(email: string) {
        // Return user or null
        return await this.prisma.user.findUnique({
            where: { email }
        });
    }

    /**
     * @param user 
     * @returns string 
     * @description make JWT token.
     */
    private signToken(user: UserSignToken) {
        // Make JWT Token
        const payload = {
            id: user.id,
            email: user.email,
            role: user.role
        }
        // Return JWT Token
        return this.jwtService.signAsync(payload);
    }
}
