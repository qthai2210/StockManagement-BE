import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from '../schemas/user.schema';
import { CreateUserDto } from '../users/dto/create-user.dto';

export interface LoginDto {
  email: string;
  password: string;
}

export interface JwtPayload {
  email: string;
  sub: string; // user id
  role: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async register(
    createUserDto: CreateUserDto,
  ): Promise<{ user: User; token: string }> {
    // Check if user already exists
    const existingUser = await this.userModel.findOne({
      email: createUserDto.email,
    });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      saltRounds,
    );

    // Create new user
    const newUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();

    // Generate JWT token
    const payload: JwtPayload = {
      email: savedUser.email,
      sub: savedUser._id!.toString(),
      role: savedUser.role,
    };

    const token = this.jwtService.sign(payload);

    // Remove password from response
    const userResponse = savedUser.toObject();
    const { password, ...userWithoutPassword } = userResponse;

    return {
      user: userWithoutPassword as User,
      token,
    };
  }

  async login(loginDto: LoginDto): Promise<{ user: User; token: string }> {
    // Find user by email
    const foundUser = await this.userModel.findOne({ email: loginDto.email });
    if (!foundUser) {
      throw new Error('Invalid credentials');
    }

    // Check if user is active
    if (!foundUser.isActive) {
      throw new Error('Account is deactivated');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      foundUser.password!,
    );
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Generate JWT token
    const jwtPayload: JwtPayload = {
      email: foundUser.email,
      sub: foundUser._id!.toString(),
      role: foundUser.role,
    };

    const jwtToken = this.jwtService.sign(jwtPayload);

    // Remove password from response
    const userResponse = foundUser.toObject();
    const { password, ...userWithoutPassword } = userResponse;

    return {
      user: userWithoutPassword as User,
      token: jwtToken,
    };
  }

  async validateUser(payload: JwtPayload): Promise<User | null> {
    const user = await this.userModel.findById(payload.sub).select('-password');
    if (!user || !user.isActive) {
      return null;
    }
    return user;
  }

  async refreshToken(userId: string): Promise<string> {
    const user = await this.userModel.findById(userId);
    if (!user || !user.isActive) {
      throw new Error('User not found or inactive');
    }

    const payload: JwtPayload = {
      email: user.email,
      sub: user._id!.toString(),
      role: user.role,
    };

    return this.jwtService.sign(payload);
  }

  async getUserProfile(userId: string): Promise<User> {
    const user = await this.userModel.findById(userId).select('-password');
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  async updateProfile(
    userId: string,
    updateData: Partial<User>,
  ): Promise<User> {
    // Don't allow password updates through this method
    const { password, ...safeUpdateData } = updateData;

    const user = await this.userModel
      .findByIdAndUpdate(userId, safeUpdateData, { new: true })
      .select('-password');

    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify old password
    const isOldPasswordValid = await bcrypt.compare(
      oldPassword,
      user.password!,
    );
    if (!isOldPasswordValid) {
      throw new Error('Invalid old password');
    }

    // Hash new password
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await this.userModel.findByIdAndUpdate(userId, {
      password: hashedNewPassword,
    });
  }
}
