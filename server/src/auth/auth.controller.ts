import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('register')
async register(@Body() dto: CreateUserDto) {
  console.log('REGISTER BODY:', dto);
  return this.usersService.createUser(dto);
}

  @Post('login')
  async login(@Body() dto: LoginDto) {
    const { email, password } = dto;
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      throw new BadRequestException('Неверный адрес электронной почты или пароль');
    }
    return this.authService.login(user as { id: number; email: string });
  }
}
