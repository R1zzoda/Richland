import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Неверный адрес электронной почты' })
  email: string;

  @IsString({ message: 'Требуется пароль' })
  password: string;
}
