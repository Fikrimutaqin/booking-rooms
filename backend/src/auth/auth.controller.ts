import { Body, Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Post } from '@nestjs/common';
import { Public } from 'src/common/decorators/public.decorator';
import { RegisterDto } from './dto/register.dto';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { LoginDto } from './dto/login.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtPayload } from 'src/common/interfaces/jwt-payload.interface';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Controller({ version: '1', path: 'auth' })
export class AuthController {
    // Constructor for auth service
    constructor(private auth: AuthService) { }

    /**
     * Register new user
     * @param dto - Register DTO
     */
    @Public()
    @Post('register')
    @ResponseMessage('User successfully registered')
    @HttpCode(HttpStatus.OK)
    register(@Body() dto: RegisterDto) {
        return this.auth.register(dto);
    }

    /**
     * Login existing user
     * @param dto - Login DTO
     */
    @Public()
    @Post('login')
    @ResponseMessage('User successfully logged in')
    @HttpCode(HttpStatus.OK)
    login(@Body() dto: LoginDto) {
        return this.auth.login(dto);
    }

    /**
     * Refresh token
     * @param refreshToken - Refresh token
     */
    @Post('refresh')
    @ResponseMessage('Token successfully refreshed')
    @HttpCode(HttpStatus.OK)
    refreshToken(@Body() dto: RefreshTokenDto) {
        return this.auth.refreshToken(dto);
    }

    /**
     * Get current user
     * @param user - Jwt Payload
     */
    @Get('me')
    me(@CurrentUser() user: JwtPayload) {
        return user
    }
}
