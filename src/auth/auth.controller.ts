import { Controller, Get, Post, Body, HttpCode } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import { ApiBadRequestResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResponseMessage } from '../common/decorators/response-message.decorator';
import { RefreshTokenDto } from './dto/refresh-token.dto';


@Controller('auth')
@ApiTags('authentication')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Log in and receive access and refresh tokens' })
  @ResponseMessage('Login successful.')
  @ApiBadRequestResponse({ description: 'Email or password is invalid.' })
  @ApiOkResponse({
    description: 'Authenticated user and bearer token pair.',
    schema: {
      example: {
        message: 'Login successful.',
        data: {
          tokenPair: {
            accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.access.signature',
            refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh.signature',
          },
        },
      },
    },
  })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Get a new access token without rotating the refresh token' })
  @ApiOkResponse({
    schema: {
      example: {
        message: 'Access token refreshed successfully.',
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.access.signature',
      },
    },
  })
  refreshToken(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto.refreshToken);
  }

}
