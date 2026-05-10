import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserRole } from '../users/schemas/user.schema';
import * as bcryptjs from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { username, email, password } = registerDto;
    const normalizedEmail = email.toLowerCase();
    // kiểm tra email đã tồn tại chưa
    const existingUser = await this.usersService.findByEmail(normalizedEmail);
    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    const hashedPassword = await bcryptjs.hash(password, 10); //bcryptjs.hash() băm
    //default
    const user = await this.usersService.create({
      username,
      email: normalizedEmail,
      passwordHash: hashedPassword,
      role: UserRole.STUDENT,
      level: 1,
      exp: 0,
      coins: 0,
      onboardingCompleted: false,
      petProfileInitialized: false,
    });

    return {
      message: 'Register successful',
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        level: user.level,
        exp: user.exp,
        coins: user.coins,
        onboardingCompleted: user.onboardingCompleted,
        petProfileInitialized: user.petProfileInitialized,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const normalizedEmail = email.toLowerCase();
    //tìm user theo cái email
    const user = await this.usersService.findByEmail(normalizedEmail);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcryptjs.compare(password, user.passwordHash); //dùng pass đã băm
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user._id.toString(), email: user.email };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
      },
      onboardingCompleted: user.onboardingCompleted,
      petProfileInitialized: user.petProfileInitialized,
    };
  }
}
