import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Patch,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import type { LoginDto } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import type { User, UserRole } from '../schemas/user.schema';

export class ChangePasswordDto {
  oldPassword: string;
  newPassword: string;
}

export class UpdateProfileDto {
  name?: string;
  role?: UserRole;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    try {
      const result = await this.authService.register(createUserDto);
      return {
        message: 'User registered successfully',
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          message: error.message || 'Registration failed',
          error: 'Bad Request',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    try {
      const result = await this.authService.login(loginDto);
      return {
        message: 'Login successful',
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          message: error.message || 'Login failed',
          error: 'Unauthorized',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@CurrentUser() user: User) {
    try {
      const profile = await this.authService.getUserProfile(
        user._id!.toString(),
      );
      return {
        message: 'Profile retrieved successfully',
        data: profile,
      };
    } catch (error) {
      throw new HttpException(
        {
          message: error.message || 'Failed to get profile',
          error: 'Not Found',
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  async updateProfile(
    @CurrentUser() user: User,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    try {
      const updatedUser = await this.authService.updateProfile(
        user._id!.toString(),
        updateProfileDto,
      );
      return {
        message: 'Profile updated successfully',
        data: updatedUser,
      };
    } catch (error) {
      throw new HttpException(
        {
          message: error.message || 'Failed to update profile',
          error: 'Bad Request',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePassword(
    @CurrentUser() user: User,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    try {
      await this.authService.changePassword(
        user._id!.toString(),
        changePasswordDto.oldPassword,
        changePasswordDto.newPassword,
      );
      return {
        message: 'Password changed successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          message: error.message || 'Failed to change password',
          error: 'Bad Request',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('refresh-token')
  async refreshToken(@CurrentUser() user: User) {
    try {
      const newToken = await this.authService.refreshToken(
        user._id!.toString(),
      );
      return {
        message: 'Token refreshed successfully',
        data: { token: newToken },
      };
    } catch (error) {
      throw new HttpException(
        {
          message: error.message || 'Failed to refresh token',
          error: 'Unauthorized',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getCurrentUser(@CurrentUser() user: User) {
    return {
      message: 'Current user retrieved successfully',
      data: user,
    };
  }
}
